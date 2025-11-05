from django.core.management.base import BaseCommand
from feedback_app.models import Feedback
from feedback_app.views import analyze_sentiment

class Command(BaseCommand):
    help = 'Re-analyze sentiment for all existing feedback'

    def handle(self, *args, **options):
        feedbacks = Feedback.objects.all()
        total = feedbacks.count()
        updated = 0

        self.stdout.write(f'Found {total} feedback entries to analyze...')

        for fb in feedbacks:
            # Re-analyze comments
            if fb.comments:
                fb.comment_sentiment, fb.comment_sentiment_score = analyze_sentiment(fb.comments)
            
            # Re-analyze suggestions
            if fb.suggestions:
                fb.suggestion_sentiment, fb.suggestion_sentiment_score = analyze_sentiment(fb.suggestions)
            
            fb.save()
            updated += 1

            if updated % 10 == 0:
                self.stdout.write(f'Processed {updated}/{total}...')

        self.stdout.write(self.style.SUCCESS(f'Successfully re-analyzed {updated} feedback entries!'))