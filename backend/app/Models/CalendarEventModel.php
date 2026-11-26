<?php

namespace App\Models;

use CodeIgniter\Model;

class CalendarEventModel extends Model
{
    protected $table = 'calendar_events';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = [
        'event_uid',
        'title',
        'event_type',
        'date',
        'start_time',
        'end_time',
        'track',
        'batch_code',
        'instructor',
        'room',
        'description',
        'attendance_required',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}
