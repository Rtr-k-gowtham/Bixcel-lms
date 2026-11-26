# Bixcel LMS

Full-stack Learning Management System (LMS) application built with **React 19 (Vite)** on the frontend and **CodeIgniter 4 (PHP 8.2+)** on the backend RESTful API.

---

## 📁 Project Architecture

```
Bixcel-lms/
├── backend/                  # CodeIgniter 4 PHP Application
│   ├── app/
│   │   ├── Config/
│   │   │   ├── Cors.php      # Configured CORS for http://localhost:5173
│   │   │   ├── Filters.php   # Global CORS filter enabled
│   │   │   └── Routes.php    # RESTful API routes (/api/health, /api/courses)
│   │   └── Controllers/Api/
│   │       ├── HealthController.php # System health & version check
│   │       └── CourseController.php # RESTful Resource Controller for LMS courses
│   ├── public/               # Web root (index.php)
│   ├── spark                 # CodeIgniter CLI tool
│   ├── .env                  # Environment config (baseURL, environment, DB)
│   └── composer.json
│
├── frontend/                 # React 19 Frontend (Vite)
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js        # Axios API client configured with baseURL
│   │   ├── App.jsx           # LMS Dashboard with live health check & course catalog
│   │   ├── App.css           # Modern, responsive UI design
│   │   └── main.jsx
│   ├── vite.config.js        # Configured Vite proxy (/api -> http://localhost:8080)
│   ├── .env                  # VITE_API_BASE_URL=http://localhost:8080/api
│   └── package.json
│
├── package.json              # Root package to launch both services concurrently
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ (tested with Node 24 and npm 11)
- **PHP**: 8.1+ (tested with PHP 8.2 64-bit with `intl`, `mbstring`, `curl`, `openssl`, `pdo_mysql`)
- **Composer**: v2.x

---

### Running Both Servers Together

From the root `Bixcel-lms` directory:

```bash
npm run dev
```

This starts:
- **Backend (CodeIgniter 4)** on [http://localhost:8080](http://localhost:8080)
- **Frontend (React + Vite)** on [http://localhost:5173](http://localhost:5173)

---

### Running Services Individually

#### 1. CodeIgniter 4 Backend
```bash
cd backend
php spark serve --port 8080
```
API endpoints available:
- `GET http://localhost:8080/api/health` — Checks backend status & CI4 version
- `GET http://localhost:8080/api/courses` — Lists all courses
- `POST http://localhost:8080/api/courses` — Creates a new course

#### 2. React Frontend
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Database Setup (Optional)

When you are ready to connect to a MySQL/MariaDB database (e.g., via XAMPP or MySQL server):

1. Open `backend/.env`
2. Uncomment and update your database credentials:
   ```ini
   database.default.hostname = localhost
   database.default.database = bixcel_lms
   database.default.username = root
   database.default.password = 
   database.default.DBDriver = MySQLi
   database.default.port = 3306
   ```
3. Run migrations or create tables using `php spark migrate`.

---

## 🔒 CORS Configuration

CORS is natively enabled in CodeIgniter 4:
- Configuration file: `backend/app/Config/Cors.php`
- Allows origins: `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`
- Allowed methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Allowed headers: `*`
- Credentials supported: `true`
