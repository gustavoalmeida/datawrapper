<?php

class DatawrapperPlugin_ThemeOglobo extends DatawrapperPlugin {

    public function init() {
        DatawrapperTheme::register($this, $this->getMeta());
    }

    private function getMeta() {
        return array(
            'id' => 'oglobo',
            'title' => __('O Globo'),
            'version' => '0.0.1'
        );
    }

}
