<?php

/**
 * This example shows settings to use when sending via Google's Gmail servers.
 */

//SMTP needs accurate times, and the PHP time zone MUST be set
//This should be done in your php.ini, but this is how to do it if you don't have access to that
//date_default_timezone_set('Etc/UTC');
require_once ROOT_PATH . 'vendor/autoload.php';

function send_smtp($to, $subject, $message, $headers){
	$config = $GLOBALS['dw_config'];
	$host = isset($config['plugins']['email-smtp']['host']) ? $config['plugins']['email-smtp']['host'] : 'localhost';
	//Create a new PHPMailer instance
	$mail = new PHPMailer;

	//Tell PHPMailer to use SMTP
	$mail->isSMTP();
	//Enable SMTP debugging
	// 0 = off (for production use)
	// 1 = client messages
	// 2 = client and server messages
	$mail->SMTPDebug = 4;

	//Ask for HTML-friendly debug output
	$mail->Debugoutput = 'html';

	//Set the hostname of the mail server
	$mail->Host = $host;
	// use
	// $mail->Host = gethostbyname('smtp.gmail.com');
	// if your network does not support SMTP over IPv6

	//Set the SMTP port number - 587 for authenticated TLS, a.k.a. RFC4409 SMTP submission
	$mail->Port = 25;

	//Set the encryption system to use - ssl (deprecated) or tls
	//$mail->SMTPSecure = 'tls';

	//Whether to use SMTP authentication
	$mail->SMTPAuth = false;

	//Username to use for SMTP authentication - use full email address for gmail
	//$mail->Username = "infograficosaws2@gmail.com";

	//Password to use for SMTP authentication
	//$mail->Password = "infoabcinfo";

	//Set who the message is to be sent from
	$mail->setFrom('noreply', 'Graficos - O Globo');

	//Set an alternative reply-to address
	$mail->addReplyTo('noreply', 'Graficos - O Globo');

	//Set who the message is to be sent to
	$mail->addAddress($to);

	//Set the subject line
	$mail->Subject = $subject;

	//Read an HTML message body from an external file, convert referenced images to embedded,
	//convert HTML into a basic plain-text alternative body
	$mail->msgHTML($message);

	//Replace the plain text body with one created manually
	$mail->AltBody = $message;

	//Attach an image file
	//$mail->addAttachment('images/phpmailer_mini.png');
	error_log('Enviando....');
	//send the message, check for errors
	if (!$mail->send()) {
	  error_log($mail->ErrorInfo);
		 echo "Mailer Error: " . $mail->ErrorInfo;
	} else {
		error_log('ENviado');
	    echo "Message sent!";
	}

}
