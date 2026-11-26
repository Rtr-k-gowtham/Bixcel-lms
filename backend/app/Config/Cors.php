<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

/**
 * Cross-Origin Resource Sharing (CORS) Configuration
 */
class Cors extends BaseConfig
{
    /**
     * The default CORS configuration.
     */
    public array $default = [
        'allowedOrigins'         => [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ],
        'allowedOriginsPatterns' => [],
        'supportsCredentials'   => true,
        'allowedHeaders'         => [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
        ],
        'exposedHeaders'         => ['Authorization'],
        'allowedMethods'         => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'maxAge'                 => 7200,
    ];
}
