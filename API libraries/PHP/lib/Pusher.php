<?php

/**
 * Description of Pusher
 *
 * @author rudnev
 */
class Pusher {

    /**
     * Options.
     * @var array
     */
    private $_config = array();

    /**
     * Initializes a new Pusher with app, token, secret, host and port.
     * 
     * @param string|int $app name of application
     * @param string     $token name of user (id)
     * @param string     $secret key for authentication
     * @param string     $host host of pusher
     * @param int        $port port of pusher
     */
    public function __construct($app, $token, $secret, $host, $port) {
        $this->_config['app'] = $app;
        $this->_config['server'] = $host;
        $this->_config['port'] = $port;
        $this->_config['token'] = $token;
        $this->_config['secret'] = $secret;

        $this->_config['url'] = $this->_config['server'] . ':' . $this->_config['port'] .'/api/apps/' . $this->_config['app'];
    }

    /**
     * Trigger an event by providing event name and payload.
     *
     * @param string $path event path
     * @param array $data sending data
     * @return array response
     */
    public function trigger($path, $data) {
        $full_url = $this->_config['url'] . $path;

            $context = stream_context_create(array(
            'http' => array(
                'method'  => 'POST',
                'header'  => array(
                    'Authorization: Basic ' . base64_encode($this->_config['token'].':'.$this->_config['secret']),
                    'Content-type: application/x-www-form-urlencoded'
                    ),
                'content' => http_build_query($data)
            )
        ));

        $body = file_get_contents($full_url, false, $context);

        $status = array();

        preg_match('#HTTP/\d+\.\d+ (\d+)#', $http_response_header[0], $status);

        return array('body' => $body, 'status' => $status[1]);
    }
}
