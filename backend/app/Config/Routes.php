<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');

// Catch-all options route for CORS preflight
$routes->options('(:any)', static function () {
    return service('response')->setStatusCode(200);
});

// API Routes
$routes->group('api', static function ($routes) {
    $routes->get('health', 'Api\HealthController::index');
    $routes->resource('courses', ['controller' => 'Api\CourseController']);
    $routes->resource('users', ['controller' => 'Api\UserController']);
    $routes->resource('roles', ['controller' => 'Api\RoleController']);
    $routes->get('permissions', 'Api\PermissionController::index');
    $routes->post('permissions', 'Api\PermissionController::update');
});
