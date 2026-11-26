<?php

namespace App\Controllers\Api;

class HealthController extends BaseApiController
{
    protected $format = 'json';

    public function __construct()
    {
        $this->request ??= \Config\Services::request();
        $this->response ??= \Config\Services::response();
    }

    public function index()
    {
        return $this->respond([
            'status'    => 'success',
            'message'   => 'CodeIgniter 4 backend is running smoothly!',
            'version'   => \CodeIgniter\CodeIgniter::CI_VERSION,
            'timestamp' => date('Y-m-d H:i:s'),
            'env'       => ENVIRONMENT,
        ]);
    }
}
