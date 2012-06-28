from django.conf.urls import patterns, include, url

urlpatterns = patterns('etraining.views',
    url(r'available_trainings/$', 'available_trainings', name='available_trainings'),
    url(r'passed_trainings/$', 'passed_trainings', name='passed_trainings'),
    url(r'take_training/(?P<training_id>\d+)/$', 'take_training', name='take_training'),
)
