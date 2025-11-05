#  Student-Teacher Feedback System

A comprehensive Django-based feedback management system for educational institutions.

##  Features

- **Student Management**: Add, edit, and manage students with divisions
- **Teacher Management**: Assign subjects and class teachers
- **Feedback System**: Anonymous feedback with sentiment analysis
- **Admin Dashboard**: Complete control panel for administrators
- **Class Teacher Dashboard**: Track student feedback completion
- **Reports**: Download Excel and CSV reports

##  Technologies Used

- **Backend**: Django, Python
- **Frontend**: React.js
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Authentication**: Django Auth System
- **Sentiment Analysis**: TextBlob

##  Installation

1. Clone the repository:
```bash
git clone https://github.com/atharvghodake248-png/student-feedback-system.git
cd student-feedback-system
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Run the server:
```bash
python manage.py runserver
```

##  User Types

- **Admin**: Full system access
- **Teacher**: View feedback and manage classes
- **Student**: Submit feedback for subjects
