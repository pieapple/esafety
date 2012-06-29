from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, get_object_or_404, get_list_or_404
from django.utils.translation import ugettext as _
from django.template import RequestContext
import datetime
from django.utils.timezone import utc
from etraining.models import Choice, Question, QuestionType
from etraining.models import Document, Training
from etraining.models import Employee, EmployeeTraining, NonemployeeRegistration, NonemployeeTraining, Group

def search_person(request):
    return render_to_response("etraining/search_person.html",
            {},
            context_instance=RequestContext(request))

def visiting_welcome(request):
  pass

def visiting_training(request):
  pass

@login_required
def admin_visiting_registration(request):
  pass

@login_required
def admin_visiting_training(request):
  pass

@login_required
def employee_registration(request):
  pass

def self_training(request):
  pass

def self_examination(request):
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
def view_employee_training_record(request):
  pass

@login_required
def view_eomployee_training_detail(request):
  pass

@login_required
def view_vendor_training_record(request):
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
