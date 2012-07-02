from django.conf.urls import patterns, url

urlpatterns = patterns('etraining.views',
  url(r'^visitor_welcome/$', 'visitor_welcome', name='visitor_welcome'),
  url(r'^entrance_training/$', 'entrance_training', name='entrance_training'),
  url(r'^self_search/$', 'self_search', name='self_search'),
  url(r'^self_training/$', 'self_training', name='self_training'),
  url(r'^self_examination/$', 'self_examination', name='self_examination'),
)
