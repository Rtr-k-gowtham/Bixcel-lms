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

            if (!$db->tableExists('departments')) {
                $forge = \Config\Database::forge();
                $forge->addField([
                    'id'           => ['type' => 'INT', 'constraint' => 11, 'unsigned' => false, 'auto_increment' => true],
                    'code'         => ['type' => 'VARCHAR', 'constraint' => 50, 'unique' => true],
                    'name'         => ['type' => 'VARCHAR', 'constraint' => 150],
                    'description'  => ['type' => 'TEXT', 'null' => true],
                    'head_of_dept' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
                    'email'        => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
                    'phone'        => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
                    'status'       => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'Active'],
                    'created_at'   => ['type' => 'DATETIME', 'null' => true],
                    'updated_at'   => ['type' => 'DATETIME', 'null' => true],
                ]);
                $forge->addKey('id', true);
                $forge->createTable('departments', true);

                $now = date('Y-m-d H:i:s');
                $db->table('departments')->insertBatch([
                    [
                        'code'         => 'DEP-CS',
                        'name'         => 'Computer Science & Software Engineering',
                        'description'  => 'Core computer science algorithms and software engineering.',
                        'head_of_dept' => 'Dr. Alan Wright',
                        'email'        => 'cs.dept@bixcel.edu',
                        'phone'        => '+1 (555) 019-2831',
                        'status'       => 'Active',
                        'created_at'   => $now,
                        'updated_at'   => $now,
                    ],
                    [
                        'code'         => 'DEP-FS',
                        'name'         => 'Full-Stack Web Development',
                        'description'  => 'Modern client and server web architectures, React, Next.js, and APIs.',
                        'head_of_dept' => 'Gowtham Tamilkathir',
                        'email'        => 'fsd.dept@bixcel.edu',
                        'phone'        => '+1 (555) 019-4829',
                        'status'       => 'Active',
                        'created_at'   => $now,
                        'updated_at'   => $now,
                    ],
                    [
                        'code'         => 'DEP-UIX',
                        'name'         => 'UI/UX & Product Design',
                        'description'  => 'User research, prototyping, and design systems.',
                        'head_of_dept' => 'Sophia Chen',
                        'email'        => 'design.dept@bixcel.edu',
                        'phone'        => '+1 (555) 019-3321',
                        'status'       => 'Active',
                        'created_at'   => $now,
                        'updated_at'   => $now,
                    ],
                ]);
            }
            self::$bootstrapped = true;
        } catch (\Throwable $e) {
            log_message('error', 'DatabaseBootstrapper error: ' . $e->getMessage());
        }
    }
}
