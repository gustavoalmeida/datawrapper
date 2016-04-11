
define(function() {

    /*
     * initialize sign up form
     */
    return function() {

        function refreshSalt() {
            $.getJSON('/api/auth/salt', function(res) {
               if (res.status == 'ok') {
                  $('.btn-register, .btn-login').data('salt', res.data.salt);
               }
            });
        }

        $('a[href=#login], a[href=#signup]').click(function(e) {
            $('#dwLoginForm').modal();
            $('#dwLoginForm .alert').remove();
            var a = $(e.target);
            var clickedLogin = a.attr('href') == '#login';
            if (clickedLogin) {
                $('#dwLoginForm .login-email').focus();
            } else {
                $('#register-email').focus();
                $('.row-login').css('opacity', 0.5);
                $('.row-login *').click(function() {
                    $('.row-login').css('opacity', 1);
                });
            }
            if (a.data('target')) $('#dwLoginForm .login-form').data('target', a.data('target'));

            var logEmail = $('#home-login .login-form .login-email'),
                logPwd = $('#home-login .login-form .login-pwd');
            if (logEmail.val() !== '') $('#register-email').val(logEmail.val());
            if (logPwd.val() !== '') $('#register-pwd').val(logPwd.val());

            refreshSalt();
            return false;
        });

        refreshSalt();

        function checkEmail(emailAddress) {
          var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
          var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
          var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
          var sQuotedPair = '\\x5c[\\x00-\\x7f]';
          var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
          var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
          var sDomain_ref = sAtom;
          var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
          var sWord = '(' + sAtom + '|' + sQuotedString + ')';
          var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
          var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
          var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
          var sValidEmail = '^' + sAddrSpec + '$'; // as whole string

          var reValidEmail = new RegExp(sValidEmail);

          return reValidEmail.test(emailAddress);
        }

        $('.btn-register').click(function(evt) {
            
            

            var form = $(evt.target).parents('.signup-form'),
                pwd = $.trim($('.register-pwd', form).val()),
                pwd2 = $.trim($('.register-pwd-2', form).val()),
                auth_salt = $('.btn-register', form).data('salt'),
                email = $('.register-email', form).val();
            form.find('.btn-register').addClass('disabled');
            form.find('.alert').remove();
            form.find('.error').removeClass('error');

            if (email == '' || !checkEmail(email)){
                $('.register-email', form).closest('.control-group').addClass('error');
                dw.backend.logError('O campo email não parece válido.', '.signup-form');
                form.find('.btn-register').removeClass('disabled');
                return;
            }
            if (pwd == ''){
                $('.register-pwd', form).closest('.control-group').addClass('error');
                dw.backend.logError('O campo senha é obrigatório.', '.signup-form');
                form.find('.btn-register').removeClass('disabled');
                return;
            }
            if (pwd.length<8){
                $('.register-pwd', form).closest('.control-group').addClass('error');
                dw.backend.logError('Use senha com no mínimo 8 caracteres.', '.signup-form');
                form.find('.btn-register').removeClass('disabled');
                return;
            }
            if (pwd !== pwd2){
                $('.register-pwd', form).closest('.control-group').addClass('error');
                $('.register-pwd-2', form).closest('.control-group').addClass('error');
                dw.backend.logError('O campo senha e o repetir senha não estão iguais.', '.signup-form');
                form.find('.btn-register').removeClass('disabled');
                return;
            }
             var payload = {
                email: email,
                pwd: CryptoJS.HmacSHA256(pwd, auth_salt).toString(),
                pwd2: CryptoJS.HmacSHA256(pwd2, auth_salt).toString()
             };
             $.ajax({
                url: '/api/users',
                type: 'POST',
                data: JSON.stringify(payload),
                dataType: 'json',
                context: this,
                success: function(data) {
                    if (data.status == 'ok') {
                        // If the registration went well, notify user we sent him an email
                        $('.row.login-signup, .alternative-signins').addClass("hidden");
                        $('.signup-confirm').removeClass("hidden");

                        $('.btn-got-it', '.signup-confirm').click(function() {
                            $('#dwLoginForm').modal('hide');
                            window.location.reload();
                        });
                    } else {
                        dw.backend.logError(data.code, '.signup-form');
                        form.find('.btn-register').removeClass('disabled');
                    }

                }
             });
        });

        

        function loginEvent(evt) {
            var loginForm = $(evt.target).parents('.login-form'),
                lgBtn = $('.btn-login', loginForm),
                pwd = $('.login-pwd', loginForm).val(),
                auth_salt = lgBtn.data('salt'),
                payload = {
                    email: $('.login-email', loginForm).val(),
                    pwhash: CryptoJS.HmacSHA256(pwd, auth_salt).toString(),
                    keeplogin: $('.keep-login', loginForm).attr('checked') == 'checked'
                };
            if (pwd === '') {
                $('.login-pwd', loginForm).parent().addClass('error');
                return false;
            }

            $('.control-group', loginForm).removeClass('error');

            $.ajax({
                url: '/api/auth/login',
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify(payload),
                success: function(data) {
                    if (data.status == "ok") {
                        $('#dwLoginForm').modal('hide');
                        $('input', loginForm).val('');
                        if (loginForm.data('target')) location.href = loginForm.data('target');
                        else {
                            if (location.pathname == "/login") location.pathname = "/";
                            else location.reload();
                        }
                    } else {
                        if (data.code == 'login-invalid') {
                            $('.login-pwd', loginForm).parent().addClass('error');
                        } else if (data.code == 'login-email-unknown') {
                            $('.login-email', loginForm).parent().addClass('error');
                        }
                        dw.backend.logError(data.message, loginForm);
                    }
                }
            });
        }

        // log in on login button click
        $('.btn-login').click(loginEvent);
        // log in on email,pwd enter press
        $('.login-form input').keyup(function(evt) {
            if (evt.keyCode == 13) loginEvent(evt);
        });
    }; // end initialize signup

});
