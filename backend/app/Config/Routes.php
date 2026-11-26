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
    $routes->resource('modules', ['controller' => 'Api\ModuleController']);
    $routes->resource('batches', ['controller' => 'Api\BatchController']);
    $routes->post('tutors/assign', 'Api\TutorController::assign');
    $routes->resource('tutors', ['controller' => 'Api\TutorController']);
    $routes->get('fees/balance', 'Api\FeeController::balance');
    $routes->post('fees/remind', 'Api\FeeController::sendReminder');
    $routes->post('fees/commitment', 'Api\FeeController::saveCommitment');
    $routes->post('fees/collect', 'Api\FeeController::collect');
    $routes->get('fees/receipt/(:segment)', 'Api\FeeController::receipt/$1');
    $routes->resource('fees', ['controller' => 'Api\FeeController']);
    $routes->get('calendar/today', 'Api\CalendarController::today');
    $routes->resource('calendar', ['controller' => 'Api\CalendarController']);
    $routes->post('progress/remark', 'Api\ProgressController::remark');
    $routes->resource('progress', ['controller' => 'Api\ProgressController']);
    $routes->get('students/tracks', 'Api\StudentController::tracks');
    $routes->resource('students', ['controller' => 'Api\StudentController']);
    $routes->resource('users', ['controller' => 'Api\UserController']);
    $routes->resource('roles', ['controller' => 'Api\RoleController']);
    $routes->get('permissions', 'Api\PermissionController::index');
    $routes->post('permissions', 'Api\PermissionController::update');
    $routes->get('audit-logs', 'Api\AuditController::index');
    $routes->get('audit-logs/(:segment)', 'Api\AuditController::show/$1');
    $routes->get('notifications', 'Api\NotificationController::index');
    $routes->post('notifications/read-all', 'Api\NotificationController::readAll');
    $routes->put('notifications/(:segment)', 'Api\NotificationController::update/$1');
    $routes->delete('notifications/(:segment)', 'Api\NotificationController::delete/$1');
    $routes->get('profile', 'Api\ProfileController::index');
    $routes->put('profile', 'Api\ProfileController::update');
    $routes->delete('profile/sessions/(:segment)', 'Api\ProfileController::revokeSession/$1');
});
