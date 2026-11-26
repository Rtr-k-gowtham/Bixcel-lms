<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class HealthController extends ResourceController
{
    protected $format = 'json';

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
