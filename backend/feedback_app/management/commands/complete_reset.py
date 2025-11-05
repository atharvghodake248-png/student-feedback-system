# feedback_app/management/commands/complete_reset.py
# Create this file to completely reset and setup everything

from django.core.management.base import BaseCommand
from django.db import transaction
from feedback_app.models import *
from textblob import TextBlob
import re

class Command(BaseCommand):
    help = 'Complete database reset and setup'

    def analyze_sentiment(self, text):
        if not text or text.strip() == '':
            return None, 0.0
        text = re.sub(r'[^\w\s]', '', text.lower())
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        if polarity > 0.1:
            return 'positive', polarity
        elif polarity < -0.1:
            return 'negative', polarity
        else:
            return 'neutral', polarity

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('🔄 RESETTING DATABASE...'))
        
        with transaction.atomic():
            # Clear all data
            Feedback.objects.all().delete()
            Teacher.objects.all().delete()
            Student.objects.all().delete()
            CustomUser.objects.all().delete()
            Subject.objects.all().delete()
            Semester.objects.all().delete()
            Year.objects.all().delete()
            Branch.objects.all().delete()
            
            self.stdout.write('✓ Cleared all data')
            
            # Create Branches
            comp = Branch.objects.create(name="Computer Engineering", code="COMP")
            it = Branch.objects.create(name="Information Technology", code="IT")
            extc = Branch.objects.create(name="Electronics Engineering", code="EXTC")
            mech = Branch.objects.create(name="Mechanical Engineering", code="MECH")
            civil = Branch.objects.create(name="Civil Engineering", code="CIVIL")
            self.stdout.write('✓ Created 5 branches')
            
            # Create Years
            second_year = Year.objects.create(name="Second Year")
            third_year = Year.objects.create(name="Third Year")
            fourth_year = Year.objects.create(name="Fourth Year")
            self.stdout.write('✓ Created years')
            
            # Create Semesters
            sem3 = Semester.objects.create(number=3, year=second_year)
            sem4 = Semester.objects.create(number=4, year=second_year)
            sem5 = Semester.objects.create(number=5, year=third_year)
            sem6 = Semester.objects.create(number=6, year=third_year)
            self.stdout.write('✓ Created semesters')
            
            # Create CS Subjects
            cs_subjects = [
                Subject.objects.create(code="CS2301", name="Data Structures and Algorithms", branch=comp, semester=sem3, credits=4),
                Subject.objects.create(code="CS2302", name="Database Management Systems", branch=comp, semester=sem3, credits=4),
                Subject.objects.create(code="CS2303", name="Object Oriented Programming", branch=comp, semester=sem3, credits=4),
                Subject.objects.create(code="CS2304", name="Computer Networks", branch=comp, semester=sem3, credits=4),
                Subject.objects.create(code="CS2305", name="Operating Systems", branch=comp, semester=sem3, credits=4),
            ]
            self.stdout.write(f'✓ Created {len(cs_subjects)} CS subjects')
            
            # Create IT Subjects
            it_subjects = [
                Subject.objects.create(code="IT2301", name="Data Structures", branch=it, semester=sem3, credits=4),
                Subject.objects.create(code="IT2302", name="DBMS", branch=it, semester=sem3, credits=4),
                Subject.objects.create(code="IT2303", name="Java Programming", branch=it, semester=sem3, credits=4),
            ]
            self.stdout.write(f'✓ Created {len(it_subjects)} IT subjects')
            
            # Create Admin
            admin = CustomUser.objects.create_user(
                username='admin',
                email='admin@college.edu',
                password='admin123',
                first_name='Admin',
                last_name='User',
                user_type='admin',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write('✓ Created admin')
            
            # Create Rajkumar Patil (Teacher)
            raj_user = CustomUser.objects.create_user(
                username='rajkumar.patil',
                email='rajkumar.patil@college.edu',
                password='teacher123',
                first_name='Rajkumar',
                last_name='Patil',
                user_type='teacher',
                prn_number='T001'
            )
            rajkumar = Teacher.objects.create(
                user=raj_user,
                employee_id='T001',
                department=comp
            )
            rajkumar.subjects.set(cs_subjects)
            self.stdout.write('✓ Created Rajkumar Patil with 5 CS subjects')
            
            # Create Priya Sharma (Teacher)
            priya_user = CustomUser.objects.create_user(
                username='priya.sharma',
                email='priya.sharma@college.edu',
                password='teacher123',
                first_name='Priya',
                last_name='Sharma',
                user_type='teacher',
                prn_number='T002'
            )
            priya = Teacher.objects.create(
                user=priya_user,
                employee_id='T002',
                department=it
            )
            priya.subjects.set(it_subjects)
            self.stdout.write('✓ Created Priya Sharma with 3 IT subjects')
            
            # Create CS Students
            students = []
            for i, (prn, fname, lname) in enumerate([
                ('2023CS001', 'Rahul', 'Kumar'),
                ('2023CS002', 'Priya', 'Patel'),
                ('2023CS003', 'Amit', 'Singh'),
            ], 1):
                user = CustomUser.objects.create_user(
                    username=prn,  # ✅ Username = PRN
                    email=f'{fname.lower()}.{lname.lower()}@student.edu',
                    password='student123',
                    first_name=fname,
                    last_name=lname,
                    user_type='student',
                    prn_number=prn
                )
                student = Student.objects.create(
                    user=user,
                    prn_number=prn,
                    year=second_year,
                    branch=comp,
                    semester=sem3
                )
                students.append(student)
            self.stdout.write(f'✓ Created {len(students)} CS students')
            
            # Create IT Students
            for prn, fname, lname in [
                ('2023IT001', 'Sneha', 'Desai'),
                ('2023IT002', 'Rohan', 'Mehta'),
            ]:
                user = CustomUser.objects.create_user(
                    username=prn,
                    email=f'{fname.lower()}.{lname.lower()}@student.edu',
                    password='student123',
                    first_name=fname,
                    last_name=lname,
                    user_type='student',
                    prn_number=prn
                )
                student = Student.objects.create(
                    user=user,
                    prn_number=prn,
                    year=second_year,
                    branch=it,
                    semester=sem3
                )
                students.append(student)
            self.stdout.write(f'✓ Created 2 IT students')
            
            # Generate sample feedback
            feedback_templates = {
                5: {
                    'comments': [
                        'Excellent teaching! Very clear explanations.',
                        'Great teacher, makes learning fun and easy.',
                        'Outstanding teaching skills, very helpful.',
                    ],
                    'suggestions': [
                        'Keep up the excellent work!',
                        'Continue the great teaching style.',
                        'Maybe add more practical examples.',
                    ]
                },
                4: {
                    'comments': [
                        'Good teaching overall.',
                        'Very informative lectures.',
                        'Teacher is knowledgeable and helpful.',
                    ],
                    'suggestions': [
                        'Could provide more examples.',
                        'More interactive sessions would help.',
                        'Additional practice problems needed.',
                    ]
                },
                3: {
                    'comments': [
                        'Average teaching, could be better.',
                        'Content is covered but not very engaging.',
                        'Satisfactory but room for improvement.',
                    ],
                    'suggestions': [
                        'Need more interactive teaching.',
                        'Provide better study materials.',
                        'Slow down the pace a bit.',
                    ]
                },
                2: {
                    'comments': [
                        'Teaching is not very clear.',
                        'Difficult to understand lectures.',
                        'Needs improvement in explanation.',
                    ],
                    'suggestions': [
                        'Please explain concepts more clearly.',
                        'Need more detailed explanations.',
                        'Provide better examples.',
                    ]
                },
                1: {
                    'comments': [
                        'Very poor teaching.',
                        'Cannot understand anything.',
                        'Needs major improvement.',
                    ],
                    'suggestions': [
                        'Please improve teaching methods.',
                        'Need complete restructuring of approach.',
                        'More focus on student understanding needed.',
                    ]
                }
            }
            
            import random
            feedback_count = 0
            
            for student in students:
                subjects = Subject.objects.filter(branch=student.branch, semester=student.semester)
                for subject in subjects:
                    teachers = Teacher.objects.filter(subjects=subject)
                    for teacher in teachers:
                        # Generate rating (weighted towards 4-5)
                        rating = random.choices([1,2,3,4,5], weights=[5,10,15,35,35])[0]
                        
                        comment = random.choice(feedback_templates[rating]['comments'])
                        suggestion = random.choice(feedback_templates[rating]['suggestions'])
                        
                        c_sent, c_score = self.analyze_sentiment(comment)
                        s_sent, s_score = self.analyze_sentiment(suggestion)
                        
                        Feedback.objects.create(
                            student=student,
                            teacher=teacher,
                            subject=subject,
                            semester=student.semester,
                            teaching_effectiveness=rating,
                            course_content=rating,
                            interaction_quality=rating,
                            assignment_feedback=rating,
                            overall_satisfaction=rating,
                            comments=comment,
                            comment_sentiment=c_sent,
                            comment_sentiment_score=c_score,
                            suggestions=suggestion,
                            suggestion_sentiment=s_sent,
                            suggestion_sentiment_score=s_score,
                            is_anonymous=random.choice([True, False])
                        )
                        feedback_count += 1
            
            self.stdout.write(f'✓ Created {feedback_count} feedback entries')
            
            self.stdout.write(self.style.SUCCESS('\n' + '='*70))
            self.stdout.write(self.style.SUCCESS('✅ DATABASE SETUP COMPLETE!'))
            self.stdout.write(self.style.SUCCESS('='*70))
            self.stdout.write(self.style.SUCCESS('\n📝 LOGIN CREDENTIALS:\n'))
            
            self.stdout.write(self.style.SUCCESS('🔐 ADMIN:'))
            self.stdout.write('   Username: admin')
            self.stdout.write('   Password: admin123\n')
            
            self.stdout.write(self.style.SUCCESS('👨‍🏫 TEACHERS (Login with Employee ID OR Username):'))
            self.stdout.write('   1. Rajkumar Patil')
            self.stdout.write('      Login: T001 OR rajkumar.patil')
            self.stdout.write('      Password: teacher123')
            self.stdout.write('      Subjects: 5 CS subjects\n')
            
            self.stdout.write('   2. Priya Sharma')
            self.stdout.write('      Login: T002 OR priya.sharma')
            self.stdout.write('      Password: teacher123')
            self.stdout.write('      Subjects: 3 IT subjects\n')
            
            self.stdout.write(self.style.SUCCESS('👨‍🎓 STUDENTS (Login with PRN):'))
            self.stdout.write('   Computer Engineering:')
            self.stdout.write('      2023CS001 (Rahul Kumar)')
            self.stdout.write('      2023CS002 (Priya Patel)')
            self.stdout.write('      2023CS003 (Amit Singh)')
            self.stdout.write('   Information Technology:')
            self.stdout.write('      2023IT001 (Sneha Desai)')
            self.stdout.write('      2023IT002 (Rohan Mehta)')
            self.stdout.write('   Password for ALL students: student123\n')
            
            self.stdout.write(self.style.SUCCESS('='*70))
            self.stdout.write(self.style.SUCCESS('📊 DATABASE STATISTICS:'))
            self.stdout.write(f'   Branches: {Branch.objects.count()}')
            self.stdout.write(f'   Subjects: {Subject.objects.count()}')
            self.stdout.write(f'   Teachers: {Teacher.objects.count()}')
            self.stdout.write(f'   Students: {Student.objects.count()}')
            self.stdout.write(f'   Feedback: {Feedback.objects.count()}')
            self.stdout.write(self.style.SUCCESS('='*70 + '\n'))