<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use CodeIgniter\RESTful\ResourceController;

class BaseApiController extends ResourceController
{
    protected $format = 'json';

    public function __construct()
    {
        DatabaseBootstrapper::ensureInitialized();
        $this->request ??= \Config\Services::request();
        $this->response ??= \Config\Services::response();
    }

    /**
     * Safely extract JSON, POST, or RawInput payload
     */
    protected function getRequestData(): array
    {
        if ($this->request instanceof \CodeIgniter\HTTP\IncomingRequest) {
            $json = $this->request->getJSON(true);
            if (is_array($json) && !empty($json)) {
                return $json;
            }
            $post = $this->request->getPost();
            if (is_array($post) && !empty($post)) {
                return $post;
            }
            $raw = $this->request->getRawInput();
            if (is_array($raw) && !empty($raw)) {
                return $raw;
            }
        }
        return [];
    }
}
