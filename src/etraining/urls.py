from django.conf.urls import patterns, url

urlpatterns = patterns('etraining.views',
  url(r'^visitor_welcome/$', 'visitor_welcome', name='visitor_welcome'),
  url(r'^is_available_entrance/$', 'is_available_entrance', name='is_available_entrance'),
  url(r'^entrance_training/(?P<registration_id>\d+)/$', 'entrance_training', name='entrance_training'),
  url(r'^self_search/$', 'self_search', name='self_search'),
  url(r'^self_training/(?P<training_id>\d+)/$', 'self_training', name='self_training'),
  url(r'^self_examination/(?P<is_employee>\d+)/(?P<record_id>\d+)/$', 'self_examination', name='self_examination'),
)
