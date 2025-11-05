# feedback_app/management/commands/add_sample_feedback.py

from django.core.management.base import BaseCommand
from django.db import transaction
from feedback_app.models import (
    Student, Teacher, Subject, Feedback
)
from textblob import TextBlob
import random
import re

class Command(BaseCommand):
    help = 'Adds sample feedback data for testing'

    def analyze_sentiment(self, text):
        """Analyze sentiment of text"""
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
        self.stdout.write('Adding sample feedback data...')
        
        try:
            with transaction.atomic():
                # Get all students and teachers
                students = list(Student.objects.all())
                teachers = list(Teacher.objects.all())
                
                if not students:
                    self.stdout.write(self.style.ERROR('No students found. Run setup_database first.'))
                    return
                
                if not teachers:
                    self.stdout.write(self.style.ERROR('No teachers found. Run setup_database first.'))
                    return
                
                # Sample feedback comments and suggestions
                positive_comments = [
                    "Excellent teaching methodology. The professor explains concepts very clearly and makes the subject interesting.",
                    "Great teacher! Very helpful and always available for doubts. Makes learning enjoyable.",
                    "Outstanding teaching skills. The way concepts are explained is brilliant and easy to understand.",
                    "Very good teaching approach. Interactive sessions and practical examples help a lot.",
                    "Fantastic professor! Deep knowledge of the subject and explains everything thoroughly.",
                    "Really appreciate the teaching style. Makes complex topics simple and engaging.",
                    "Amazing teacher who truly cares about student learning. Always encouraging and supportive.",
                    "Excellent course delivery. Well-organized lectures and helpful study materials provided."
                ]
                
                neutral_comments = [
                    "The teaching is okay. Could be more interactive but concepts are covered adequately.",
                    "Average teaching pace. Sometimes too fast, sometimes too slow.",
                    "Course content is good but delivery could be improved slightly.",
                    "Satisfactory teaching method. Gets the job done but room for improvement.",
                    "Decent teaching overall. Some topics need more detailed explanation.",
                    "The classes are fine. Content is covered but could be more engaging."
                ]
                
                negative_comments = [
                    "Teaching could be improved. Concepts are not explained clearly enough.",
                    "Difficult to understand lectures. Need more examples and practical sessions.",
                    "Teaching speed is too fast. Hard to keep up with the pace of lectures.",
                    "Not very interactive. More student engagement would help learning.",
                    "Course material is not well organized. Difficult to follow along."
                ]
                
                positive_suggestions = [
                    "Keep up the excellent work! Maybe add more real-world examples.",
                    "Continue the great teaching. Perhaps include more practical assignments.",
                    "Maintain the current teaching style. Very effective and engaging.",
                    "Great job! Could add more interactive quizzes for better learning.",
                    "Please continue teaching this way. Maybe include more case studies."
                ]
                
                neutral_suggestions = [
                    "Could provide more study materials and reference books.",
                    "More practice problems would be helpful for exam preparation.",
                    "Additional tutorial sessions might help with difficult topics.",
                    "Providing lecture notes in advance would be beneficial.",
                    "More examples during lectures would improve understanding."
                ]
                
                negative_suggestions = [
                    "Please slow down the teaching pace and explain concepts more thoroughly.",
                    "Need more interactive sessions and practical demonstrations.",
                    "Should provide better study materials and organized notes.",
                    "More focus on fundamentals needed before moving to advanced topics.",
                    "Please make lectures more engaging and interactive."
                ]
                
                feedback_count = 0
                
                # Create feedback for each student
                for student in students:
                    # Get subjects for this student's branch and semester
                    subjects = Subject.objects.filter(
                        branch=student.branch,
                        semester=student.semester
                    )
                    
                    for subject in subjects:
                        # Get teachers who teach this subject
                        subject_teachers = Teacher.objects.filter(subjects=subject)
                        
                        for teacher in subject_teachers:
                            # Check if feedback already exists
                            if Feedback.objects.filter(
                                student=student,
                                teacher=teacher,
                                subject=subject,
                                semester=student.semester
                            ).exists():
                                continue
                            
                            # Randomly decide sentiment tendency
                            sentiment_type = random.choices(
                                ['positive', 'neutral', 'negative'],
                                weights=[0.6, 0.3, 0.1]  # 60% positive, 30% neutral, 10% negative
                            )[0]
                            
                            # Select comments based on sentiment
                            if sentiment_type == 'positive':
                                comment = random.choice(positive_comments)
                                suggestion = random.choice(positive_suggestions)
                                rating_base = random.randint(4, 5)
                            elif sentiment_type == 'neutral':
                                comment = random.choice(neutral_comments)
                                suggestion = random.choice(neutral_suggestions)
                                rating_base = 3
                            else:
                                comment = random.choice(negative_comments)
                                suggestion = random.choice(negative_suggestions)
                                rating_base = random.randint(1, 2)
                            
                            # Generate ratings with slight variation
                            teaching_rating = max(1, min(5, rating_base + random.randint(-1, 1)))
                            content_rating = max(1, min(5, rating_base + random.randint(-1, 1)))
                            interaction_rating = max(1, min(5, rating_base + random.randint(-1, 1)))
                            assignment_rating = max(1, min(5, rating_base + random.randint(-1, 1)))
                            overall_rating = rating_base
                            
                            # Analyze sentiment
                            comment_sentiment, comment_score = self.analyze_sentiment(comment)
                            suggestion_sentiment, suggestion_score = self.analyze_sentiment(suggestion)
                            
                            # Create feedback
                            feedback = Feedback.objects.create(
                                student=student,
                                teacher=teacher,
                                subject=subject,
                                semester=student.semester,
                                teaching_effectiveness=teaching_rating,
                                course_content=content_rating,
                                interaction_quality=interaction_rating,
                                assignment_feedback=assignment_rating,
                                overall_satisfaction=overall_rating,
                                comments=comment,
                                comment_sentiment=comment_sentiment,
                                comment_sentiment_score=comment_score,
                                suggestions=suggestion,
                                suggestion_sentiment=suggestion_sentiment,
                                suggestion_sentiment_score=suggestion_score,
                                is_anonymous=random.choice([True, False])
                            )
                            
                            feedback_count += 1
                            self.stdout.write(
                                f'✓ Created feedback: {student.prn_number} → '
                                f'{teacher.employee_id} ({subject.code}) - Rating: {overall_rating}'
                            )
                
                self.stdout.write(self.style.SUCCESS('\n' + '='*70))
                self.stdout.write(self.style.SUCCESS(f'✅ Successfully created {feedback_count} feedback entries!'))
                self.stdout.write(self.style.SUCCESS('='*70))
                self.stdout.write(self.style.SUCCESS('\n📊 Summary:'))
                self.stdout.write(f'   Total Students: {len(students)}')
                self.stdout.write(f'   Total Teachers: {len(teachers)}')
                self.stdout.write(f'   Total Feedback: {feedback_count}')
                self.stdout.write(self.style.SUCCESS('\n🎉 You can now view feedback data in the dashboard and download CSV!'))
                self.stdout.write(self.style.SUCCESS('='*70 + '\n'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error: {str(e)}'))
            import traceback
            self.stdout.write(self.style.ERROR(traceback.format_exc()))
            raise