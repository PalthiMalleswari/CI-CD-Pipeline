from django.db import models
from django.utils.text import slugify

# Create your models here.


class Bookmark(models.Model):
    title = models.CharField(max_length=200)
    url = models.URLField()
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):

        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):

        return self.title
