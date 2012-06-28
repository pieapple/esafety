from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.conf import settings

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'esafety.views.index'),
    url(r'^etraining/', include('etraining.urls')),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
