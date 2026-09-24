# Create your views here.
from django.http import HttpResponse
from rest_framework import generics

from .models import Bookmark
from .serializers import BookmarkSerializer

from django.shortcuts import render


def bookmark_page(request):
    return render(request, "links/index.html")

def home(request):
    return HttpResponse("Hello from Links app!")

class BookmarkListCreateView(generics.ListCreateAPIView):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer


class BookmarkDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer