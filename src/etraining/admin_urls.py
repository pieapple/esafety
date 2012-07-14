from django.conf.urls import patterns, url

urlpatterns = patterns('etraining.admin_views',
    url(r'^visitor_entrance/$', 'visitor_entrance', name='visitor_entrance'),
    url(r'^visitor_training/$', 'visitor_training', name='visitor_training'),
    
    url(r'^new_employee_registration/$', 'new_employee_registration', name='new_employee_registration'),

    url(r'^employee_training_schedule_list/$', 'employee_training_schedule_list', \
        name='employee_training_schedule_list'),
    url(r'^vendor_training_schedule_list/$', 'vendor_training_schedule_list', \
        name='vendor_training_schedule_list'),
    url(r'^training_signup/(?P<group_id>\d+)/(?P<training_id>\d+)/$', 'training_signup', \
        name='training_signup'),
    url(r'^attend_training/(?P<training_id>\d+)/$', 'attend_training', name='attend_training'),

    url(r'^schedule_new_employee_training/$', 'schedule_new_employee_training', \
        name='schedule_new_employee_training'),
    url(r'^schedule_employee_regular_training/$', 'schedule_employee_regular_training', \
        name='schedule_employee_regular_training'),
    url(r'^schedule_vendor_training/$', 'schedule_vendor_training', name='schedule_vendor_training'),
    url(r'^schedule_visitor_training/$', 'schedule_visitor_training', name='schedule_visitor_training'),

    url(r'^manage_question_poll/$', 'manage_question_poll', name='manage_question_poll'),
    url(r'^add_question_poll/$', 'add_question_poll', name='add_question_poll'),
    url(r'^add_question/$', 'add_question', name='add_question'),
    url(r'^edit_question/$', 'edit_question', name='edit_question'),
    url(r'^delete_question/$', 'delete_question', name='delete_question'),
    url(r'^manage_documents/$', 'manage_documents', name='manage_documents'),
    url(r'^add_document/$', 'add_document', name='add_document'),
    url(r'^edit_document/$', 'edit_document', name='edit_document'),
    url(r'^delete_document/$', 'delete_document', name='delete_document'),

    url(r'^view_employee_training_list/$', 'view_employee_training_list', name='view_employee_training_list'),
    url(r'^view_vendor_training_list/$', 'view_vendor_training_list', name='view_vendor_training_list'),
    url(r'^view_training_signup/(?P<group_id>\d+)/(?P<training_id>\d+)/$', 'view_training_signup', \
        name='view_training_signup'),
    url(r'^view_new_employee_training/$', 'view_new_employee_training', name='view_new_employee_training'),
    url(r'^view_regular_employee_training/$', 'view_regular_employee_training', name='view_regular_employee_training'),
    url(r'^view_vendor_training/$', 'view_vendor_training', name='view_vendor_training'),
    url(r'^view_vendor_entrance/$', 'view_vendor_entrance', name='view_vendor_entrance'),
    url(r'^view_visitor_entrance/$', 'view_visitor_entrance', name='view_visitor_entrance'),
)
