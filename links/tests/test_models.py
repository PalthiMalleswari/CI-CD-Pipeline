import pytest

from links.models import Bookmark


@pytest.mark.django_db
def test_slug_is_generated_from_title():
    b = Bookmark.objects.create(title="Hello World", url="https://example.com")
    assert b.slug == "hello-world"


@pytest.mark.django_db
def test_ordering_is_newest_first():
    old = Bookmark.objects.create(title="Old", url="https://a.com")
    new = Bookmark.objects.create(title="New", url="https://b.com")

    assert list(Bookmark.objects.all()) == [new, old]
