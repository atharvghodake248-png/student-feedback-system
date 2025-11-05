# feedback_app/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, Student, Teacher, Subject, Branch, Year,
    Semester, Feedback, FeedbackSummary, Division, TeacherSubject
)

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """Admin interface for CustomUser"""
    list_display = ('username', 'email', 'user_type', 'first_name', 'last_name', 'is_active', 'is_staff')
    list_filter = ('user_type', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'prn_number')
    ordering = ('username',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'prn_number', 'password_reset_token', 'password_reset_expiry')}),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'prn_number')}),
    )

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    """Admin interface for Branch"""
    list_display = ('name', 'code')
    search_fields = ('name', 'code')
    ordering = ('name',)

@admin.register(Year)
class YearAdmin(admin.ModelAdmin):
    """Admin interface for Year"""
    list_display = ('name',)
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    """Admin interface for Semester"""
    list_display = ('year', 'number')
    list_filter = ('year',)
    search_fields = ('year__name',)
    ordering = ('year', 'number')

@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    """Admin interface for Division"""
    list_display = ('name',)
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    """Admin interface for Subject"""
    list_display = ('code', 'name', 'credits', 'semester', 'branch', 'division')
    list_filter = ('semester', 'branch', 'division')
    search_fields = ('code', 'name')
    ordering = ('code',)

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    """Admin interface for Teacher"""
    list_display = ('employee_id', 'get_full_name', 'department', 'is_class_teacher', 'get_subjects_count')
    list_filter = ('department', 'is_class_teacher')
    search_fields = ('employee_id', 'user__first_name', 'user__last_name', 'user__email')
    ordering = ('employee_id',)
    filter_horizontal = ('subjects',)
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Name'
    
    def get_subjects_count(self, obj):
        return obj.subjects.count()
    get_subjects_count.short_description = 'Subjects'

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    """Admin interface for Student"""
    list_display = ('prn_number', 'get_full_name', 'year', 'branch', 'semester', 'division', 'class_teacher')
    list_filter = ('year', 'branch', 'semester', 'division')
    search_fields = ('prn_number', 'user__first_name', 'user__last_name', 'user__email')
    ordering = ('prn_number',)
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Name'

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    """Admin interface for Feedback"""
    list_display = ('id', 'student', 'teacher', 'subject', 'overall_satisfaction', 'comment_sentiment', 'created_at')
    list_filter = ('overall_satisfaction', 'comment_sentiment', 'suggestion_sentiment', 'is_anonymous', 'created_at')
    search_fields = ('student__prn_number', 'teacher__employee_id', 'subject__code', 'comments', 'suggestions')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(FeedbackSummary)
class FeedbackSummaryAdmin(admin.ModelAdmin):
    """Admin interface for FeedbackSummary"""
    list_display = ('teacher', 'subject', 'semester', 'total_responses', 'avg_overall_satisfaction', 'last_updated')
    list_filter = ('semester', 'last_updated')
    search_fields = ('teacher__employee_id', 'subject__code')
    ordering = ('-last_updated',)
    readonly_fields = ('last_updated',)

@admin.register(TeacherSubject)
class TeacherSubjectAdmin(admin.ModelAdmin):
    """Admin interface for TeacherSubject"""
    list_display = ('teacher', 'subject', 'assigned_date')
    list_filter = ('assigned_date',)
    search_fields = ('teacher__employee_id', 'subject__code')
    ordering = ('-assigned_date',)
    readonly_fields = ('assigned_date',)
