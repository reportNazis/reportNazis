from django.db import models
import uuid
from django.utils import timezone
from datetime import timedelta

def default_expiration():
    return timezone.now() + timedelta(days=7)

class InviteCode(models.Model):
    code = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=default_expiration)

    def is_valid(self):
        return self.is_active and self.expires_at > timezone.now()
