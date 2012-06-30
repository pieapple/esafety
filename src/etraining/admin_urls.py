from django.conf.urls import patterns, include, url

urlpatterns = patterns('etraining.admin_views',
  url(r'vreg$', 'visitor_registration', name='visitor_registration'),
)
