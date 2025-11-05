# feedback_app/management/commands/seed_data.py

from django.core.management.base import BaseCommand
from feedback_app.models import Branch, Year, Semester, Subject, CustomUser

class Command(BaseCommand):
    help = 'Seed database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Create Branches
        cs_branch, _ = Branch.objects.get_or_create(name='Computer Science', code='CS')
        it_branch, _ = Branch.objects.get_or_create(name='Information Technology', code='IT')
        
        # Create Years
        fy_year, _ = Year.objects.get_or_create(name='FY')
        sy_year, _ = Year.objects.get_or_create(name='SY')
        ty_year, _ = Year.objects.get_or_create(name='TY')
        final_year, _ = Year.objects.get_or_create(name='Final')
        
        # Create Semesters
        fy_sem1, _ = Semester.objects.get_or_create(number=1, year=fy_year)
        fy_sem2, _ = Semester.objects.get_or_create(number=2, year=fy_year)
        sy_sem3, _ = Semester.objects.get_or_create(number=3, year=sy_year)
        sy_sem4, _ = Semester.objects.get_or_create(number=4, year=sy_year)
        ty_sem5, _ = Semester.objects.get_or_create(number=5, year=ty_year)
        ty_sem6, _ = Semester.objects.get_or_create(number=6, year=ty_year)
        final_sem7, _ = Semester.objects.get_or_create(number=7, year=final_year)
        final_sem8, _ = Semester.objects.get_or_create(number=8, year=final_year)
        
        # FY Common Subjects
        fy_subjects = [
            ('MA1101', 'Engineering Mathematics-I', fy_sem1),
            ('PH1102', 'Engineering Physics', fy_sem1),
            ('EE1103', 'Basic Electrical Engineering', fy_sem1),
            ('CS1104', 'Programming Fundamentals', fy_sem1),
            ('HS1105', 'Communication Skills', fy_sem1),
            ('MA1201', 'Engineering Mathematics-II', fy_sem2),
            ('CH1202', 'Engineering Chemistry', fy_sem2),
            ('ME1203', 'Engineering Graphics', fy_sem2),
            ('EC1204', 'Basic Electronics', fy_sem2),
            ('HS1205', 'Environmental Science', fy_sem2),
        ]
        
        for code, name, semester in fy_subjects:
            # Create for both CS and IT branches
            Subject.objects.get_or_create(code=code, name=name, semester=semester, branch=cs_branch)
            Subject.objects.get_or_create(code=code, name=name, semester=semester, branch=it_branch)
        
        # SY Computer Science Subjects
        cs_subjects = [
            ('CS2301', 'Data Structures', sy_sem3, cs_branch),
            ('CS2302', 'Computer Organization & Architecture', sy_sem3, cs_branch),
            ('CS2303', 'Discrete Mathematics', sy_sem3, cs_branch),
            ('CS2304', 'Digital Logic Design', sy_sem3, cs_branch),
            ('HS2305', 'Humanities Elective', sy_sem3, cs_branch),
            ('CS2401', 'Design & Analysis of Algorithms', sy_sem4, cs_branch),
            ('CS2402', 'Operating Systems', sy_sem4, cs_branch),
            ('CS2403', 'Database Management Systems', sy_sem4, cs_branch),
            ('CS2404', 'Computer Networks', sy_sem4, cs_branch),
            ('HS2405', 'Open Elective I', sy_sem4, cs_branch),
        ]
        
        # TY Computer Science Subjects
        cs_subjects.extend([
            ('CS3501', 'Software Engineering', ty_sem5, cs_branch),
            ('CS3502', 'Artificial Intelligence', ty_sem5, cs_branch),
            ('CS3503', 'Web Technologies', ty_sem5, cs_branch),
            ('CS3504', 'Cloud Computing', ty_sem5, cs_branch),
            ('CS3601', 'Machine Learning', ty_sem6, cs_branch),
            ('CS3602', 'Compiler Design', ty_sem6, cs_branch),
            ('CS3603', 'Elective II', ty_sem6, cs_branch),
            ('CS3604', 'Mini Project', ty_sem6, cs_branch),
        ])
        
        # Final Year Computer Science Subjects
        cs_subjects.extend([
            ('CS4701', 'Deep Learning', final_sem7, cs_branch),
            ('CS4702', 'Big Data Analytics', final_sem7, cs_branch),
            ('CS4703', 'Elective III', final_sem7, cs_branch),
            ('CS4704', 'Major Project Phase I', final_sem7, cs_branch),
            ('CS4801', 'Blockchain Technology', final_sem8, cs_branch),
            ('CS4802', 'Elective IV', final_sem8, cs_branch),
            ('CS4803', 'Major Project Phase II', final_sem8, cs_branch),
        ])
        
        # SY IT Subjects
        it_subjects = [
            ('IT2301', 'Data Structures & Algorithms', sy_sem3, it_branch),
            ('IT2302', 'Computer Organization', sy_sem3, it_branch),
            ('IT2303', 'Discrete Mathematics', sy_sem3, it_branch),
            ('IT2304', 'Database Management Systems', sy_sem3, it_branch),
            ('HS2305', 'Professional Communication', sy_sem3, it_branch),
            ('IT2401', 'Design & Analysis of Algorithms', sy_sem4, it_branch),
            ('IT2402', 'Operating Systems', sy_sem4, it_branch),
            ('IT2403', 'Computer Networks', sy_sem4, it_branch),
            ('IT2404', 'Software Engineering', sy_sem4, it_branch),
            ('HS2405', 'Open Elective I', sy_sem4, it_branch),
        ]
        
        # TY IT Subjects
        it_subjects.extend([
            ('IT3501', 'Web Technologies', ty_sem5, it_branch),
            ('IT3502', 'Artificial Intelligence', ty_sem5, it_branch),
            ('IT3503', 'Information Security', ty_sem5, it_branch),
            ('IT3504', 'Cloud Computing', ty_sem5, it_branch),
            ('IT3601', 'Machine Learning', ty_sem6, it_branch),
            ('IT3602', 'Compiler Design', ty_sem6, it_branch),
            ('IT3603', 'Elective II', ty_sem6, it_branch),
            ('IT3604', 'Mini Project', ty_sem6, it_branch),
        ])
        
        # Final Year IT Subjects
        it_subjects.extend([
            ('IT4701', 'Deep Learning', final_sem7, it_branch),
            ('IT4702', 'Big Data Analytics', final_sem7, it_branch),
            ('IT4703', 'Elective III', final_sem7, it_branch),
            ('IT4704', 'Major Project Phase I', final_sem7, it_branch),
            ('IT4801', 'Blockchain Technology', final_sem8, it_branch),
            ('IT4802', 'Elective IV', final_sem8, it_branch),
            ('IT4803', 'Major Project Phase II', final_sem8, it_branch),
        ])
        
        # Create CS and IT subjects
        for code, name, semester, branch in cs_subjects + it_subjects:
            Subject.objects.get_or_create(code=code, name=name, semester=semester, branch=branch)
        
        # Create default admin user
        if not CustomUser.objects.filter(username='admin').exists():
            admin_user = CustomUser.objects.create_user(
                username='admin',
                password='admin123',
                first_name='System',
                last_name='Administrator',
                email='admin@college.edu',
                user_type='admin',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(f'Created admin user: admin/admin123')
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))