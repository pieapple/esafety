from django.conf.urls import patterns, include, url

urlpatterns = patterns('etraining.views',
    url(r'^$', 'search_person', name='search_person'),
)
