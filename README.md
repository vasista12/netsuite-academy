# NetSuite Academy

NetSuite Academy is a full-stack learning and course management platform designed to provide a centralized environment for creating courses, managing learners, conducting assessments, and issuing completion certificates.

## 🚀 Features

### Learner Portal
- Learner authentication
- View available published courses
- View course information and passing score
- Start and complete courses
- Take course assessments
- Track learning progress
- View earned certificates
- Download certificates as PDF

### Administration Portal
- Admin authentication and authorization
- Dashboard statistics
- Course management
- Publish and manage courses
- Quiz management
- Learner management
- Certificate tracking

### Authentication & Security
- JWT-based authentication
- Role-based access control
- Admin and instructor authorization
- Password hashing
- Protected API endpoints

### Certificate Generation
- Automatic certificate generation after successful completion
- Unique certificate number
- Final score displayed on certificate
- Issue date
- Downloadable PDF certificate

## 🏗️ Technology Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Passlib / bcrypt
- ReportLab

### Frontend
- React
- TypeScript
- Vite
- Axios

## 📁 Project Structure

```text
netsuite-academy/
│
├── netsuite-academy-backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── admin.py
│   │   │   ├── auth.py
│   │   │   ├── certificates.py
│   │   │   ├── courses.py
│   │   │   ├── learners.py
│   │   │   ├── modules.py
│   │   │   └── quizzes.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── requirements.txt
│   └── test_fastapi.py
│
├── netsuite-academy-frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md