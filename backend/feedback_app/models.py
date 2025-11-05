from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import pre_save
from django.dispatch import receiver


# ------------------------------
#  USER MODEL
# ------------------------------
class CustomUser(AbstractUser):
    """Extended user model with additional fields"""
    USER_TYPE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='student'
    )
    prn_number = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        help_text="Student PRN or Employee ID"
    )

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"


# ------------------------------
#  BRANCH MODEL
# ------------------------------
class Branch(models.Model):
    """Academic branches/departments"""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    
    class Meta:
        verbose_name_plural = "Branches"
    
    def __str__(self):
        return f"{self.name} ({self.code})"


# ------------------------------
#  YEAR MODEL
# ------------------------------
class Year(models.Model):
    """Academic years"""
    name = models.CharField(max_length=20, unique=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


# ------------------------------
#  SEMESTER MODEL
# ------------------------------
class Semester(models.Model):
    """Semesters within academic years"""
    number = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(8)]
    )
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='semesters')
    
    class Meta:
        unique_together = ['number', 'year']
        ordering = ['year', 'number']
    
    def __str__(self):
        return f"{self.year.name} - Semester {self.number}"


# ------------------------------
#  DIVISION MODEL
# ------------------------------
class Division(models.Model):
    """Division/Section - A, B, C, D, etc."""
    name = models.CharField(max_length=10, unique=True, help_text="Division name (A, B, C, etc.)")
    
    class Meta:
        ordering = ['name']
        verbose_name = "Division"
        verbose_name_plural = "Divisions"
    
    def __str__(self):
        return f"Division {self.name}"


# ------------------------------
#  SUBJECT MODEL
# ------------------------------
class Subject(models.Model):
    """Academic subjects"""
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=200)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='subjects')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='subjects')
    division = models.ForeignKey(Division, on_delete=models.SET_NULL, null=True, blank=True, related_name='subjects', help_text="Optional: Specific division")
    credits = models.IntegerField(default=4)
    
    class Meta:
        ordering = ['code']
        unique_together = ['code', 'semester', 'branch', 'division']
    
    def __str__(self):
        div_str = f" - Div {self.division.name}" if self.division else ""
        return f"{self.code} - {self.name}{div_str}"


# ------------------------------
#  TEACHER MODEL
# ------------------------------
class Teacher(models.Model):
    """Teacher profile linked to CustomUser"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    subjects = models.ManyToManyField(Subject, related_name='teachers', blank=True)
    department = models.ForeignKey(Branch, on_delete=models.CASCADE, null=True, blank=True)
    
    # Class Teacher Fields
    is_class_teacher = models.BooleanField(default=False)
    assigned_class_year = models.ForeignKey(Year, on_delete=models.SET_NULL, null=True, blank=True, related_name='class_teachers')
    assigned_class_branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='class_teachers_branch')
    assigned_class_semester = models.ForeignKey(Semester, on_delete=models.SET_NULL, null=True, blank=True, related_name='class_teachers_sem')
    assigned_class_division = models.ForeignKey(Division, on_delete=models.SET_NULL, null=True, blank=True, related_name='class_teachers')
    
    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name()}"


# ------------------------------
#  TEACHER-SUBJECT ASSIGNMENT (JUNCTION TABLE)
# ------------------------------
class TeacherSubject(models.Model):
    """Junction table for Teacher-Subject many-to-many relationship"""
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='subject_assignments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='teacher_assignments')
    assigned_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('teacher', 'subject')
        ordering = ['-assigned_date']
        verbose_name = "Teacher-Subject Assignment"
        verbose_name_plural = "Teacher-Subject Assignments"
    
    def __str__(self):
        return f"{self.teacher.employee_id} teaches {self.subject.code}"

        
# ------------------------------
#  STUDENT MODEL
# ------------------------------
class Student(models.Model):
    """Student profile linked to CustomUser"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    prn_number = models.CharField(max_length=20, unique=True)
    year = models.ForeignKey(Year, on_delete=models.CASCADE)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    division = models.ForeignKey(Division, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    class_teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_students')
    
    def __str__(self):
        div_str = f" - Div {self.division.name}" if self.division else ""
        return f"{self.prn_number} - {self.user.get_full_name()}{div_str}"


# ------------------------------
#  FEEDBACK MODEL
# ------------------------------
class Feedback(models.Model):
    """Student feedback for teachers and subjects"""
    SATISFACTION_CHOICES = [
        (1, 'Very Poor'),
        (2, 'Poor'),
        (3, 'Average'),
        (4, 'Good'),
        (5, 'Excellent'),
    ]
    
    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('negative', 'Negative'),
        ('neutral', 'Neutral'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='feedback_given')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='feedback_received')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='feedback')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    
    teaching_effectiveness = models.IntegerField(choices=SATISFACTION_CHOICES, validators=[MinValueValidator(1), MaxValueValidator(5)])
    course_content = models.IntegerField(choices=SATISFACTION_CHOICES, validators=[MinValueValidator(1), MaxValueValidator(5)])
    interaction_quality = models.IntegerField(choices=SATISFACTION_CHOICES, validators=[MinValueValidator(1), MaxValueValidator(5)])
    assignment_feedback = models.IntegerField(choices=SATISFACTION_CHOICES, validators=[MinValueValidator(1), MaxValueValidator(5)])
    overall_satisfaction = models.IntegerField(choices=SATISFACTION_CHOICES, validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    comments = models.TextField(blank=True, default="No comments", help_text="Additional comments")
    suggestions = models.TextField(blank=True, default="No suggestions", help_text="Suggestions for improvement")
    
    comment_sentiment = models.CharField(max_length=10, choices=SENTIMENT_CHOICES, null=True, blank=True)
    comment_sentiment_score = models.FloatField(null=True, blank=True)
    
    suggestion_sentiment = models.CharField(max_length=10, choices=SENTIMENT_CHOICES, null=True, blank=True)
    suggestion_sentiment_score = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_anonymous = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['student', 'teacher', 'subject', 'semester']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Feedback by {self.student.prn_number} for {self.teacher.user.get_full_name()} - {self.subject.code}"


# ------------------------------
#  FEEDBACK SUMMARY MODEL
# ------------------------------
class FeedbackSummary(models.Model):
    """Aggregated feedback summary for teachers and subjects"""
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='feedback_summaries')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='feedback_summaries')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    
    total_responses = models.IntegerField(default=0)
    avg_teaching_effectiveness = models.FloatField(default=0.0)
    avg_course_content = models.FloatField(default=0.0)
    avg_interaction_quality = models.FloatField(default=0.0)
    avg_assignment_feedback = models.FloatField(default=0.0)
    avg_overall_satisfaction = models.FloatField(default=0.0)
    
    positive_comments_count = models.IntegerField(default=0)
    negative_comments_count = models.IntegerField(default=0)
    neutral_comments_count = models.IntegerField(default=0)
    
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['teacher', 'subject', 'semester']
        ordering = ['-last_updated']
    
    def __str__(self):
        return f"Summary: {self.teacher.user.get_full_name()} - {self.subject.code} ({self.semester})"


# ------------------------------
#  SIGNAL — AUTO CLASS TEACHER ASSIGNMENT
# ------------------------------
@receiver(pre_save, sender=Student)
def auto_assign_class_teacher(sender, instance, **kwargs):
    """
    Automatically assigns class teacher to student
    based on matching year, branch, semester, and division.
    """
    if not instance.class_teacher and instance.year and instance.branch and instance.semester and instance.division:
        try:
            teacher = Teacher.objects.get(
                is_class_teacher=True,
                assigned_class_year=instance.year,
                assigned_class_branch=instance.branch,
                assigned_class_semester=instance.semester,
                assigned_class_division=instance.division
            )
            instance.class_teacher = teacher
        except Teacher.DoesNotExist:
            pass  # No teacher found for this combination