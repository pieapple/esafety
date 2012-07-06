from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = patterns('',
    url(r'^$', 'esafety.views.index', name='index'),
    url(r'^accounts/login/$', 'django.contrib.auth.views.login', name='login'),
    url(r'^accounts/logout/$', 'django.contrib.auth.views.logout', {'next_page':'/'},name='logout'),
    url(r'^etraining/', include('etraining.urls')),
    url(r'^admin/etraining/', include('etraining.admin_urls')),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
