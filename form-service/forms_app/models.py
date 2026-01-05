from django.db import models

class FormConfig(models.Model):
    form_id = models.CharField(max_length=100, unique=True)
    schema = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

class FormResponse(models.Model):
    form = models.ForeignKey(FormConfig, on_delete=models.CASCADE, to_field='form_id')
    answers = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(auto_now_add=True)
