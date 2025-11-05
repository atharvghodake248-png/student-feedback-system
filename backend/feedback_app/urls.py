# feedback_app/urls.py - COMPLETE URL CONFIGURATION

from django.urls import path
from . import views

urlpatterns = [
    # ==================== AUTHENTICATION ====================
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # ==================== STUDENT ENDPOINTS ====================
    path('student/dashboard/', views.student_dashboard, name='student_dashboard'),
    path('student/subjects/', views.get_student_subjects, name='student_subjects'),
    path('student/submit-feedback/', views.submit_feedback, name='submit_feedback'),
    
    # ==================== TEACHER ENDPOINTS ====================
    path('teacher/dashboard/', views.teacher_dashboard, name='teacher_dashboard'),
    path('teacher/feedback/', views.teacher_feedback_data, name='teacher_feedback'),
    path('teacher/download-data/', views.download_feedback_data, name='download_feedback'),
    
    # ==================== CLASS TEACHER ENDPOINTS ====================
    path('class-teacher/dashboard/', views.class_teacher_dashboard, name='class_teacher_dashboard'),
    path('class-teacher/student-tracking/', views.class_teacher_student_tracking, name='class_teacher_tracking'),
    path('class-teacher/download-report/', views.download_class_teacher_report, name='download_class_report'),
    
    # ==================== ADMIN - CREATE ENDPOINTS ====================
    path('admin/add-student/', views.add_student, name='add_student'),
    path('admin/add-teacher/', views.add_teacher, name='add_teacher'),
    path('admin/add-subject/', views.add_subject, name='add_subject'),
    path('admin/bulk-add-students/', views.bulk_add_students, name='bulk_add_students'),  # NEW
    
    # ==================== ADMIN - UPDATE ENDPOINTS ====================
    path('admin/students/<int:student_id>/update/', views.update_student, name='update_student'),  # NEW
    path('admin/teachers/<int:teacher_id>/update/', views.update_teacher, name='update_teacher'),  # NEW
    path('admin/subjects/<int:subject_id>/update/', views.update_subject, name='update_subject'),  # NEW
    
    # ==================== ADMIN - DELETE ENDPOINTS ====================
    path('admin/students/<int:student_id>/delete/', views.delete_student, name='delete_student'),  # NEW
    path('admin/teachers/<int:teacher_id>/delete/', views.delete_teacher, name='delete_teacher'),  # NEW
    path('admin/subjects/<int:subject_id>/delete/', views.delete_subject, name='delete_subject'),  # NEW
    
    # ==================== ADMIN - PASSWORD RESET ====================
    path('admin/students/<int:student_id>/reset-password/', views.reset_student_password, name='reset_student_password'),
    path('admin/teachers/<int:teacher_id>/reset-password/', views.reset_teacher_password, name='reset_teacher_password'),
    
    # ==================== ADMIN - ASSIGNMENTS ====================
    path('admin/assign-class-teacher/', views.assign_class_teacher, name='assign_class_teacher'),
    path('admin/teachers/<int:teacher_id>/assign-subjects/', views.assign_subjects_to_teacher, name='assign_subjects'),
    
    # ==================== ADMIN - GET ALL DATA ====================
    path('admin/students/', views.get_all_students, name='get_all_students'),
    path('admin/teachers/', views.get_all_teachers, name='get_all_teachers'),
    path('admin/all-subjects/', views.get_all_subjects, name='get_all_subjects'),  # NEW - For View Subjects tab
    path('admin/manage-access/', views.manage_access, name='manage_access'),
    path('admin/statistics/', views.get_admin_statistics, name='get_admin_statistics'),  # NEW
    
    # ==================== ADMIN - REPORTS ====================
    path('admin/download-all-feedback/', views.download_all_feedback_report, name='download_all_feedback'),  # NEW
    
    # ==================== DATA ENDPOINTS (PUBLIC) ====================
    path('branches/', views.get_branches, name='get_branches'),
    path('years/', views.get_years, name='get_years'),
    path('semesters/<int:year_id>/', views.get_semesters, name='get_semesters'),
    path('subjects/<int:year_id>/<int:branch_id>/<int:semester_id>/', views.get_subjects, name='get_subjects'),
    path('divisions/', views.get_divisions, name='get_divisions'),
    
    # ==================== SEARCH & UTILITY ====================
    path('search/', views.search_users, name='search_users'),  # NEW
    path('health/', views.health_check, name='health_check'),  # NEW

        # ==================== TEACHER-SUBJECT ASSIGNMENT ENDPOINTS ====================
    path('admin/subjects-by-class/', views.get_subjects_by_class, name='subjects_by_class'),
    path('admin/assign-subject-to-teacher/', views.assign_subject_to_teacher, name='assign_subject_to_teacher'),
    path('admin/teacher-subjects/<int:teacher_id>/', views.get_teacher_subjects, name='teacher_subjects'),
    path('admin/remove-subject-assignment/<int:assignment_id>/', views.remove_subject_assignment, name='remove_subject_assignment'),
    path('admin/teacher-subject-assignments/', views.get_all_teacher_subject_assignments, name='all_teacher_subject_assignments'),
]