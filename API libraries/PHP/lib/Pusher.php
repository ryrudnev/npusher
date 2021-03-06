<?php

// Pusher execption
class PusherException extends Exception
{
    
}

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
     * @param int        $timeout waiting time for connection
     */
    public function __construct($app, $token, $secret, $host, $port, $timeout=5) {
        if (!extension_loaded('curl') || !extension_loaded('json')) {
            throw new PusherException('There is missing dependant extensions - need cUrl and JSON');
        }

        $this->_config['app'] = $app;
        $this->_config['server'] = $host;
        $this->_config['port'] = $port;
        $this->_config['token'] = $token;
        $this->_config['secret'] = $secret;
        $this->_config['timeout'] = $timeout;

        $this->_config['url'] = $this->_config['server'] . ':' . $this->_config['port'] . '/api/apps/' . $this->_config['app'];
    }

    /**
     * Trigger an event by providing event name and payload.
     *
     * @param string $path event path
     * @param array $data sending data
     * @return array response body and status
     */
    public function trigger($path, array $data) {
        $json = json_encode($data);
        
        $full_url = $this->_config['url'] . $path;
        
        $ch = curl_init();
        if ($ch === false) {
            throw new PusherException('Could not initialise cURL');
	}
        
        curl_setopt($ch, CURLOPT_URL, $full_url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Authorization: Basic ' . base64_encode($this->_config['token'] . ':' . $this->_config['secret']),
            'Content-Type: application/json',
            'Content-Length: ' . strlen($json))
        );
        
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->_config['timeout']);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $this->_config['timeout'] / 2);
        curl_setopt($ch, CURLOPT_DNS_CACHE_TIMEOUT, $this->_config['timeout'] * 2);

        $response = array();
        
        $response['body'] = curl_exec($ch);
        $response['status'] = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch) !== 0) {
            throw new PusherException('cUrl error: ' . curl_error($ch));    
        }
        
        curl_close($ch);
        
        return $response;
    }
}
