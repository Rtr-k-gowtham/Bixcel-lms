<?php

namespace App\Libraries;

class DatabaseBootstrapper
{
    private static bool $bootstrapped = false;

    public static function ensureInitialized(): void
    {
        if (self::$bootstrapped) {
            return;
        }

        try {
            $db = \Config\Database::connect();
            if (!$db->tableExists('students')) {
                $migrations = \Config\Services::migrations();
                $migrations->latest();

                $seeder = \Config\Database::seeder();
                $seeder->call('App\Database\Seeds\DatabaseSeeder');
            }
            self::$bootstrapped = true;
        } catch (\Throwable $e) {
            log_message('error', 'DatabaseBootstrapper error: ' . $e->getMessage());
        }
    }
}
