<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class UserController extends ResourceController
{
    protected $format = 'json';

    private static array $users = [
        [
            'id'         => 1,
            'name'       => 'Dr. Marcus Vance',
            'email'      => 'm.vance@bixcel.edu',
            'emp_id'     => 'BX-FAC-014',
            'role'       => 'Academic Dean',
            'role_code'  => 'ROLE_DEAN',
            'department' => 'Computer Science',
            'phone'      => '+1 (555) 234-8901',
            'status'     => 'Active',
            'last_login' => '10 mins ago',
            'avatar'     => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        ],
        [
            'id'         => 2,
            'name'       => 'Elena Rostova',
            'email'      => 'e.rostova@bixcel.edu',
            'emp_id'     => 'BX-ADM-002',
            'role'       => 'Super Admin',
            'role_code'  => 'ROLE_SUPER_ADMIN',
            'department' => 'Executive Office',
            'phone'      => '+1 (555) 876-5432',
            'status'     => 'Active',
            'last_login' => 'Just now',
            'avatar'     => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces',
        ],
        [
            'id'         => 3,
            'name'       => 'Sophia Chen',
            'email'      => 's.chen@bixcel.edu',
            'emp_id'     => 'BX-TUT-089',
            'role'       => 'Tutor / Faculty',
            'role_code'  => 'ROLE_TUTOR',
            'department' => 'UI / UX Design',
            'phone'      => '+1 (555) 345-6789',
            'status'     => 'Active',
            'last_login' => '2 hours ago',
            'avatar'     => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
        ],
        [
            'id'         => 4,
            'name'       => 'David Miller',
            'email'      => 'd.miller@bixcel.edu',
            'emp_id'     => 'BX-TUT-092',
            'role'       => 'Tutor / Faculty',
            'role_code'  => 'ROLE_TUTOR',
            'department' => 'Cloud & DevOps',
            'phone'      => '+1 (555) 456-7890',
            'status'     => 'Active',
            'last_login' => 'Yesterday',
            'avatar'     => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
        ],
        [
            'id'         => 5,
            'name'       => 'Priya Sharma',
            'email'      => 'p.sharma@bixcel.edu',
            'emp_id'     => 'BX-OPS-031',
            'role'       => 'Admission Officer',
            'role_code'  => 'ROLE_ADMISSIONS',
            'department' => 'Student Affairs',
            'phone'      => '+1 (555) 567-8901',
            'status'     => 'Active',
            'last_login' => '3 hours ago',
            'avatar'     => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces',
        ],
        [
            'id'         => 6,
            'name'       => 'Michael Sterling',
            'email'      => 'm.sterling@bixcel.edu',
            'emp_id'     => 'BX-FIN-019',
            'role'       => 'Accountant',
            'role_code'  => 'ROLE_FINANCE',
            'department' => 'Bursar & Finance',
            'phone'      => '+1 (555) 678-9012',
            'status'     => 'Active',
            'last_login' => '1 day ago',
            'avatar'     => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
        ],
        [
            'id'         => 7,
            'name'       => 'Alex Vance',
            'email'      => 'a.vance@student.bixcel.edu',
            'emp_id'     => 'BX-STU-1044',
            'role'       => 'Student / Learner',
            'role_code'  => 'ROLE_STUDENT',
            'department' => 'Full-Stack Web Dev',
            'phone'      => '+1 (555) 789-0123',
            'status'     => 'Active',
            'last_login' => '45 mins ago',
            'avatar'     => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces',
        ],
        [
            'id'         => 8,
            'name'       => 'Robert Langdon',
            'email'      => 'r.langdon@bixcel.edu',
            'emp_id'     => 'BX-ADM-005',
            'role'       => 'Admin',
            'role_code'  => 'ROLE_ADMIN',
            'department' => 'Academic Operations',
            'phone'      => '+1 (555) 890-1234',
            'status'     => 'Inactive',
            'last_login' => '3 weeks ago',
            'avatar'     => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces',
        ],
    ];

    public function index()
    {
        return $this->respond([
            'status' => 'success',
            'count'  => count(self::$users),
            'data'   => self::$users,
        ]);
    }

    public function show($id = null)
    {
        $id = (int)$id;
        foreach (self::$users as $user) {
            if ($user['id'] === $id) {
                return $this->respond([
                    'status' => 'success',
                    'data'   => $user,
                ]);
            }
        }
        return $this->failNotFound('User not found with ID: ' . $id);
    }

    public function create()
    {
        $data = $this->request->getJSON(true) ?? $this->request->getPost();

        if (empty($data['name']) || empty($data['email'])) {
            return $this->failValidationErrors('Name and Email are mandatory');
        }

        $newUser = [
            'id'         => count(self::$users) + 1,
            'name'       => $data['name'],
            'email'      => $data['email'],
            'emp_id'     => $data['emp_id'] ?? ('BX-USER-0' . (count(self::$users) + 10)),
            'role'       => $data['role'] ?? 'Tutor / Faculty',
            'role_code'  => $data['role_code'] ?? 'ROLE_TUTOR',
            'department' => $data['department'] ?? 'General Academics',
            'phone'      => $data['phone'] ?? '+1 (555) 000-0000',
            'status'     => $data['status'] ?? 'Active',
            'last_login' => 'Never',
            'avatar'     => $data['avatar'] ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
        ];

        self::$users[] = $newUser;

        return $this->respondCreated([
            'status'  => 'success',
            'message' => 'User created successfully',
            'data'    => $newUser,
        ]);
    }

    public function update($id = null)
    {
        $id = (int)$id;
        $data = $this->request->getJSON(true) ?? $this->request->getRawInput();

        foreach (self::$users as &$user) {
            if ($user['id'] === $id) {
                if (isset($data['name'])) $user['name'] = $data['name'];
                if (isset($data['email'])) $user['email'] = $data['email'];
                if (isset($data['role'])) $user['role'] = $data['role'];
                if (isset($data['department'])) $user['department'] = $data['department'];
                if (isset($data['status'])) $user['status'] = $data['status'];
                if (isset($data['phone'])) $user['phone'] = $data['phone'];

                return $this->respond([
                    'status'  => 'success',
                    'message' => 'User updated successfully',
                    'data'    => $user,
                ]);
            }
        }

        return $this->failNotFound('User not found to update with ID: ' . $id);
    }

    public function delete($id = null)
    {
        $id = (int)$id;
        foreach (self::$users as $idx => $user) {
            if ($user['id'] === $id) {
                array_splice(self::$users, $idx, 1);
                return $this->respondDeleted([
                    'status'  => 'success',
                    'message' => 'User deleted successfully',
                ]);
            }
        }

        return $this->failNotFound('User not found to delete');
    }
}
