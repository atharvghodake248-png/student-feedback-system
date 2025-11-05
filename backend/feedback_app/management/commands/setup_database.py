# feedback_app/management/commands/setup_database.py

from django.core.management.base import BaseCommand
from django.db import transaction
from feedback_app.models import (
    Branch, Year, Semester, Subject, CustomUser, Teacher, Student
)

class Command(BaseCommand):
    help = 'Sets up the database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Setting up database...')
        
        try:
            with transaction.atomic():
                # Clear existing data
                self.stdout.write('Clearing existing data...')
                Teacher.objects.all().delete()
                Student.objects.all().delete()
                CustomUser.objects.all().delete()
                Subject.objects.all().delete()
                Semester.objects.all().delete()
                Year.objects.all().delete()
                Branch.objects.all().delete()
                
                # Create Branches
                comp_branch, _ = Branch.objects.get_or_create(name="Computer Engineering", code="COMP")
                self.stdout.write(self.style.SUCCESS(f'✓ Created branch: {comp_branch.name}'))
                
                it_branch, _ = Branch.objects.get_or_create(name="Information Technology", code="IT")
                self.stdout.write(self.style.SUCCESS(f'✓ Created branch: {it_branch.name}'))
                
                extc_branch, _ = Branch.objects.get_or_create(name="Electronics Engineering", code="EXTC")
                self.stdout.write(self.style.SUCCESS(f'✓ Created branch: {extc_branch.name}'))
                
                mech_branch, _ = Branch.objects.get_or_create(name="Mechanical Engineering", code="MECH")
                self.stdout.write(self.style.SUCCESS(f'✓ Created branch: {mech_branch.name}'))
                
                civil_branch, _ = Branch.objects.get_or_create(name="Civil Engineering", code="CIVIL")
                self.stdout.write(self.style.SUCCESS(f'✓ Created branch: {civil_branch.name}'))
                
                # Create Years
                second_year, _ = Year.objects.get_or_create(name="Second Year")
                self.stdout.write(self.style.SUCCESS(f'✓ Created year: {second_year.name}'))
                
                third_year, _ = Year.objects.get_or_create(name="Third Year")
                self.stdout.write(self.style.SUCCESS(f'✓ Created year: {third_year.name}'))
                
                fourth_year, _ = Year.objects.get_or_create(name="Fourth Year")
                self.stdout.write(self.style.SUCCESS(f'✓ Created year: {fourth_year.name}'))
                
                # Create Semesters
                sem3, _ = Semester.objects.get_or_create(number=3, year=second_year)
                self.stdout.write(self.style.SUCCESS(f'✓ Created semester: {sem3.number}'))
                
                sem4, _ = Semester.objects.get_or_create(number=4, year=second_year)
                self.stdout.write(self.style.SUCCESS(f'✓ Created semester: {sem4.number}'))
                
                sem5, _ = Semester.objects.get_or_create(number=5, year=third_year)
                self.stdout.write(self.style.SUCCESS(f'✓ Created semester: {sem5.number}'))
                
                sem6, _ = Semester.objects.get_or_create(number=6, year=third_year)
                self.stdout.write(self.style.SUCCESS(f'✓ Created semester: {sem6.number}'))
                
                sem7, _ = Semester.objects.get_or_create(number=7, year=fourth_year)
                self.stdout.write(self.style.SUCCESS(f'✓ Created semester: {sem7.number}'))
                
                sem8, _ = Semester.objects.get_or_create(number=8, year=fourth_year)
                self.stdout.write(self.style.SUCCESS(f'✓ Created semester: {sem8.number}'))
                
                # Create Subjects for Multiple Branches
                subjects_data = [
                    # Computer Engineering - Semester 3
                    ("CS2301", "Data Structures and Algorithms", comp_branch, sem3),
                    ("CS2302", "Database Management Systems", comp_branch, sem3),
                    ("CS2303", "Object Oriented Programming", comp_branch, sem3),
                    ("CS2304", "Computer Networks", comp_branch, sem3),
                    ("CS2305", "Operating Systems", comp_branch, sem3),
                    
                    # Computer Engineering - Semester 4
                    ("CS2401", "Software Engineering", comp_branch, sem4),
                    ("CS2402", "Web Technologies", comp_branch, sem4),
                    ("CS2403", "Theory of Computation", comp_branch, sem4),
                    
                    # IT - Semester 3
                    ("IT2301", "Data Structures", it_branch, sem3),
                    ("IT2302", "DBMS", it_branch, sem3),
                    ("IT2303", "Java Programming", it_branch, sem3),
                    
                    # EXTC - Semester 3
                    ("EC2301", "Digital Electronics", extc_branch, sem3),
                    ("EC2302", "Signals and Systems", extc_branch, sem3),
                    
                    # Mechanical - Semester 3
                    ("ME2301", "Thermodynamics", mech_branch, sem3),
                    ("ME2302", "Mechanics of Materials", mech_branch, sem3),
                    
                    # Civil - Semester 3
                    ("CE2301", "Structural Analysis", civil_branch, sem3),
                    ("CE2302", "Geotechnical Engineering", civil_branch, sem3),
                ]
                
                for code, name, branch, semester in subjects_data:
                    subject, _ = Subject.objects.get_or_create(
                        code=code,
                        defaults={
                            'name': name,
                            'branch': branch,
                            'semester': semester
                        }
                    )
                    self.stdout.write(self.style.SUCCESS(f'✓ Created subject: {subject.code} - {subject.name}'))
                
                # Create Admin User
                admin_user, created = CustomUser.objects.get_or_create(
                    username='admin',
                    defaults={
                        'email': 'admin@college.edu',
                        'first_name': 'Admin',
                        'last_name': 'User',
                        'user_type': 'admin',
                        'is_staff': True,
                        'is_superuser': True
                    }
                )
                if created:
                    admin_user.set_password('admin123')
                    admin_user.save()
                    self.stdout.write(self.style.SUCCESS('✓ Created admin user (username: admin, password: admin123)'))
                
                # Create Rajkumar Patil (Teacher)
                rajkumar_user, created = CustomUser.objects.get_or_create(
                    prn_number='T001',
                    defaults={
                        'username': 'rajkumar.patil',
                        'email': 'rajkumar.patil@college.edu',
                        'first_name': 'Rajkumar',
                        'last_name': 'Patil',
                        'user_type': 'teacher'
                    }
                )
                if created:
                    rajkumar_user.set_password('teacher123')
                    rajkumar_user.save()
                    self.stdout.write(self.style.SUCCESS('✓ Created user: Rajkumar Patil'))
                
                # Create Teacher profile for Rajkumar
                rajkumar_teacher, _ = Teacher.objects.get_or_create(
                    user=rajkumar_user,
                    defaults={
                        'employee_id': 'EMP001',
                        'department': comp_branch
                    }
                )
                
                # Assign ALL Computer Engineering subjects to Rajkumar
                cs_subjects = Subject.objects.filter(branch=comp_branch)
                rajkumar_teacher.subjects.set(cs_subjects)
                self.stdout.write(self.style.SUCCESS(f'✓ Assigned {cs_subjects.count()} subjects to Rajkumar Patil'))
                
                # Create Priya Sharma (Teacher)
                teacher2_user, created = CustomUser.objects.get_or_create(
                    prn_number='T002',
                    defaults={
                        'username': 'priya.sharma',
                        'email': 'priya.sharma@college.edu',
                        'first_name': 'Priya',
                        'last_name': 'Sharma',
                        'user_type': 'teacher'
                    }
                )
                if created:
                    teacher2_user.set_password('teacher123')
                    teacher2_user.save()
                    self.stdout.write(self.style.SUCCESS('✓ Created user: Priya Sharma'))
                
                # Create Teacher profile for Priya
                teacher2, _ = Teacher.objects.get_or_create(
                    user=teacher2_user,
                    defaults={
                        'employee_id': 'EMP002',
                        'department': it_branch
                    }
                )
                
                # Assign IT subjects to Priya
                it_subjects = Subject.objects.filter(branch=it_branch)
                teacher2.subjects.set(it_subjects)
                self.stdout.write(self.style.SUCCESS(f'✓ Assigned {it_subjects.count()} subjects to Priya Sharma'))
                
                # Create Sample Students for Different Branches
                students_data = [
                    ('2023CS001', 'Rahul', 'Kumar', comp_branch, second_year, sem3),
                    ('2023CS002', 'Priya', 'Patel', comp_branch, second_year, sem3),
                    ('2023CS003', 'Amit', 'Singh', comp_branch, second_year, sem3),
                    ('2023IT001', 'Sneha', 'Desai', it_branch, second_year, sem3),
                    ('2023IT002', 'Rohan', 'Mehta', it_branch, second_year, sem3),
                    ('2023EC001', 'Ananya', 'Rao', extc_branch, second_year, sem3),
                    ('2023ME001', 'Vikram', 'Reddy', mech_branch, second_year, sem3),
                    ('2023CE001', 'Kavya', 'Nair', civil_branch, second_year, sem3),
                ]
                
                for prn, first_name, last_name, branch, year, semester in students_data:
                    student_user, created = CustomUser.objects.get_or_create(
                        prn_number=prn,
                        defaults={
                            'username': f'{first_name.lower()}.{last_name.lower()}',
                            'email': f'{first_name.lower()}.{last_name.lower()}@student.college.edu',
                            'first_name': first_name,
                            'last_name': last_name,
                            'user_type': 'student'
                        }
                    )
                    if created:
                        student_user.set_password('student123')
                        student_user.save()
                        
                        # Create Student profile with ALL required fields
                        Student.objects.get_or_create(
                            user=student_user,
                            defaults={
                                'prn_number': prn,
                                'branch': branch,
                                'year': year,
                                'semester': semester
                            }
                        )
                        self.stdout.write(self.style.SUCCESS(f'✓ Created student: {first_name} {last_name} ({prn})'))
                
                self.stdout.write(self.style.SUCCESS('\n' + '='*70))
                self.stdout.write(self.style.SUCCESS('✅ DATABASE SETUP COMPLETED SUCCESSFULLY!'))
                self.stdout.write(self.style.SUCCESS('='*70))
                self.stdout.write(self.style.SUCCESS('\n📝 LOGIN CREDENTIALS:'))
                self.stdout.write(self.style.SUCCESS('\n🔐 ADMIN:'))
                self.stdout.write('   Username: admin')
                self.stdout.write('   Password: admin123')
                self.stdout.write(self.style.SUCCESS('\n👨‍🏫 TEACHERS (Login with PRN):'))
                self.stdout.write('   Rajkumar Patil')
                self.stdout.write('     PRN: T001')
                self.stdout.write('     Password: teacher123')
                self.stdout.write('     Subjects: All Computer Engineering (8 subjects)')
                self.stdout.write('')
                self.stdout.write('   Priya Sharma')
                self.stdout.write('     PRN: T002')
                self.stdout.write('     Password: teacher123')
                self.stdout.write('     Subjects: All IT subjects (3 subjects)')
                self.stdout.write(self.style.SUCCESS('\n👨‍🎓 STUDENTS (Login with PRN):'))
                self.stdout.write('   Password for all students: student123')
                self.stdout.write('')
                self.stdout.write('   Computer Engineering:')
                self.stdout.write('     - 2023CS001 (Rahul Kumar)')
                self.stdout.write('     - 2023CS002 (Priya Patel)')
                self.stdout.write('     - 2023CS003 (Amit Singh)')
                self.stdout.write('')
                self.stdout.write('   Information Technology:')
                self.stdout.write('     - 2023IT001 (Sneha Desai)')
                self.stdout.write('     - 2023IT002 (Rohan Mehta)')
                self.stdout.write('')
                self.stdout.write('   Other Branches:')
                self.stdout.write('     - 2023EC001 (Electronics - Ananya Rao)')
                self.stdout.write('     - 2023ME001 (Mechanical - Vikram Reddy)')
                self.stdout.write('     - 2023CE001 (Civil - Kavya Nair)')
                self.stdout.write(self.style.SUCCESS('\n' + '='*70))
                self.stdout.write(self.style.SUCCESS('🚀 You can now start the server with: python manage.py runserver'))
                self.stdout.write(self.style.SUCCESS('='*70 + '\n'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error: {str(e)}'))
            import traceback
            self.stdout.write(self.style.ERROR(traceback.format_exc()))
            raise