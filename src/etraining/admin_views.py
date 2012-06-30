from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, get_object_or_404, get_list_or_404
from django.utils.translation import ugettext as _
from django.template import RequestContext
import datetime
from django.utils.timezone import utc
from etraining.models import Choice, Question, QuestionType
from etraining.models import Document, Training
from etraining.models import Employee, EmployeeTraining, NonemployeeRegistration, NonemployeeTraining, Group

@login_required
def visitor_registration(request):
  pass

@login_required
def visitor_training(request):
  pass

@login_required
def employee_registration(request):
  pass

@login_required
def training_list(request):
  pass

@login_required
def training_signup(request):
  pass

@login_required
def view_training(request):
  pass

@login_required
def schedule_employee_training(request):
  pass

@login_required
def schedule_vendor_training(request):
  pass

@login_required
def schedule_entrance_training(request):
  pass

@login_required
def view_employee_training(request):
  pass

@login_required
def view_employee_training_detail(request):
  pass

@login_required
def view_vendor_training(request):
  pass

@login_required
def view_vendor_training_detail(request):
  pass

@login_required
def view_training_signup(request):
  pass

@login_required
def view_visitor_entrance(request):
  pass

@login_required
def view_visitor_entrance_detail(request):
  pass

@login_required
def manage_training_document(request):
  pass

@login_required
def manage_question_poll(request):
  pass

@login_required
def manage_employee_org(request):
  pass

@login_required
def manage_visitor_org(request):
  pass
