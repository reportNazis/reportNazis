import uuid
import hashlib
import json

from django.db import models
from django.utils.translation import gettext_lazy as _

HASH_MAX_LENGTH = 64

class ContentBlob(models.Model):
    """
    Immutable Content Store. 
    Here lies the JSON-Data sent by the Tiptap Frontend Texteditor.
    Primary Key is the Hash of the Content -> Automatic duplicate reduction.
    """

    hash = models.CharField(
        max_length=HASH_MAX_LENGTH,
        primary_key=True,
        editable=False
    )

    data = models.JSONField(
        help_text="Frontend Texteditor Content"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        #Automatic Hash Calculation BEFORE Save
        if not self.hash: 
            self.hash = self.calculate_hash(self.data)
        super().save(*args, **kwargs)
    
    @staticmethod
    def calculate_hash(content_dict):
        
        content_bytes = json.dumps(content_dict, sort_keys=True).encode('utf-8')
        return hashlib.sha256(content_bytes).hexdigest()
    
    def __str__(self):
        return f"Blob {self.hash[:8]}..."
    
class Document(models.Model):
    """
    Project Scope "Container" - or Repository
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(max_length=255)

    owner_id = models.CharField(max_length=255, db_index=True)

    doi = models.CharField(max_length=255, blank=True, null=True, unique=True)

    current_version = models.OnteToOneField(
        'DocumentVersion',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='head_of_document'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
class DocumentVersion(models.Model):
    """
    The Version-Graph. 
    Connects a Document with a ContentBlob at a certain Timestamp.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='versions'
    )

    content_blob = models.ForeignKey(
        ContentBlob,
        on_delete=models.PROTECT
    )

    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True, 
        related_name='children'
    )

    author_id = models.CharField(max_length=255)

    class Visibility(models.TextChoices):
        PRIVATE = 'private', 'Only Author'
        GROUP_INTERNAL = 'group_internal', 'Only Members of my Group'
        INTERNAL = 'internal', 'All Members'
        PUBLIC = 'public', 'Everyone accessing the app'

    visibility = models.CharField(
        max_length=10,
        choices=Visibility.choices,
        default=Visibility.INTERNAL,
        db_index=True
    )

    class Meta: 
        ordering = ['-created_at']
        indexes = [
            models.Index(field=['document', 'created_at']),
        ]

    def __str__(self):
        return f"v{self.created_at.strftime('%Y-%m-%d %H:%M')} - {self.id}"
    

class Citation(models.Model):
    # Who cites?
    source_document = models.ForeignKey(
        'Document',
        on_delete=models.CASCADE,
        related_name='outgoing_citations'
    )

    target_document = models.ForeignKey(
        'Document',
        on_delete=models.PROTECT,
        related_name='incoming_citations'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        unique_together = ('source_document', 'target_document')
        indexes = [
            models.Index(fields=['target_document']),
        ]