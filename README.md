# NetSuite Academy 🎓

NetSuite Academy is a web-based learning and assessment platform designed to provide students with a structured environment for learning courses, completing modules, attempting quizzes, tracking progress, and receiving certificates after successfully completing a course.

The project contains a separate frontend and backend application and is designed to provide a clean, modern and presentable learning experience.

---

## 🚀 Features

### 👨‍🎓 Student Features

- Student login and authentication
- Student dashboard
- Browse available courses
- View course details
- Access learning modules
- Track course/module progress
- Complete learning content
- Attempt course quizzes
- Select answers interactively
- Automatic quiz evaluation
- Passing score validation
- Quiz result display
- Course completion tracking
- Certificate generation for completed courses

### 👨‍🏫 Instructor / Admin Features

- Admin authentication
- Course management
- Course creation
- Course publishing
- Module management
- Quiz management
- Question and answer management
- Student progress tracking
- Course performance monitoring

### 🎯 Assessment

The platform supports:

- Multiple-choice questions
- Four answer options
- Configurable passing scores
- Automatic score calculation
- Pass/fail result
- Attempt tracking
- Progress tracking

---

## 🏗️ Project Structure

```text
netsuite-academy/
│
├── netsuite-academy-backend/
│   │
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── admin.py
│   │   │   ├── courses.py
│   │   │   ├── modules.py
│   │   │   ├── quizzes.py
│   │   │   └── certificates.py
│   │   │
│   │   ├── database.py
│   │   ├── models.py
│   │   └── main.py
│   │
│   ├── netsuite_academy.db
│   ├── requirements.txt
│   └── test_fastapi.py
│
├── netsuite-academy-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── README.md
└── PROMPT_HISTORY.md
