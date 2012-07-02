from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, get_object_or_404, get_list_or_404
from django.utils.translation import ugettext as _
from django.template import RequestContext
import datetime
from django.utils.timezone import utc
from etraining.models import Choice, Question, QuestionType
from etraining.models import Document, Training
from etraining.models import Employee, EmployeeTraining, NonemployeeRegistration, NonemployeeTraining, Group
from etraining.admin_forms import VisitorRegistrationForm, EmployeeRegistrationForm

@login_required
def visitor_registration(request):
  if request.method == "POST":
    form = VisitorRegistrationForm(request.POST)
    if form.is_valid():
      # notify user to display entrance training
      return HttpResponseRedirect(reverse("visitor_training"))
  else:
    form = VisitorRegistrationForm()

  return render_to_response("etraining/admin/visitor_registration.html", {
      'form': form,
    }, context_instance=RequestContext(request))

@login_required
def visitor_training(request):
  if request.method == "POST":
    #sign up registration
    return HttpResponseRedirect(reverse("visitor_registration"))
  else:
    return render_to_response("etraining/admin/visitor_training.html", {}, context_instance=RequestContext(request))

@login_required
def employee_registration(request):
  if request.method == "POST":
    form = EmployeeRegistrationForm(request.POST)
    if form.is_valid():
      return render_to_response("etraining/admin/employee_registration_result.html", {}, context_instance=RequestContext(request))
  else:
    form = EmployeeRegistrationForm()

  return render_to_response("etraining/admin/employee_registration.html", {
      'form': form,
    }, context_instance=RequestContext(request))

@login_required
def training_list(request):
  if request.method == "POST":
    pass

  return render_to_response("etraining/admin/training_list.html", {
      'training_list': training_list,
    }, context_instance=RequestContext(request))

@login_required
def training_signup(request):
  if request.method == "POST":
# get list of ids
# associate and set attendtime/admin for each training item
# Ajax call to do signup
    pass
  else: 
# query training
    return render_to_response("etraining/admin/training_signup.html", {}, context_instance=RequestContext(request))

@login_required
def view_training(request):
# get training by id
  return render_to_response("etraining/admin/view_training.html", {
    }, context_instance=RequestContext(request))


@login_required
def schedule_employee_training(request):
  if request.method == "POST":
    pass

  return render_to_response("etraining/admin/schedule_employee_training.html", {}, context_instance=RequestContext(request))

@login_required
def schedule_vendor_training(request):
  if request.method == "POST":
    pass

  return render_to_response("etraining/admin/schedule_vendor_training.html", {}, context_instance=RequestContext(request))

@login_required
def schedule_entrance_training(request):
  if request.method == "POST":
    pass

  return render_to_response("etraining/admin/schedule_visitor_training.html", {}, context_instance=RequestContext(request))

@login_required
def view_employee_training(request):
  return render_to_response("etraining/admin/view_employee_training.html", {}, context_instance=RequestContext(request))

@login_required
def view_employee_training_detail(request):
  return render_to_response("etraining/admin/view_employee_training_detail.html", {}, context_instance=RequestContext(request))

@login_required
def view_vendor_training(request):
  return render_to_response("etraining/admin/view_vendor_training.html", {}, context_instance=RequestContext(request))

@login_required
def view_vendor_training_detail(request):
  return render_to_response("etraining/admin/view_vendor_training_detail.html", {}, context_instance=RequestContext(request))

@login_required
def view_training_signup(request):
  return render_to_response("etraining/admin/view_training_signup.html", {}, context_instance=RequestContext(request))

@login_required
def view_visitor_entrance(request):
  return render_to_response("etraining/admin/view_visitor_entrance.html", {}, context_instance=RequestContext(request))

@login_required
def view_visitor_entrance_detail(request):
  return render_to_response("etraining/admin/view_visitor_entrance_detail.html", {}, context_instance=RequestContext(request))

@login_required
def manage_documents(request):
  if request.method == "POST":
    return render_to_response("etraining/admin/manage_documents.html", {}, context_instance=RequestContext(request))
  else:
    return render_to_response("etraining/admin/manage_documents.html", {}, context_instance=RequestContext(request))

@login_required
def add_document(request):
  pass

@login_required
def edit_document(request):
  pass

@login_required
def delete_document(request):
  pass

@login_required
def manage_question_poll(request):
  if request.method == "POST":
    return render_to_response("etraining/admin/manage_question_poll.html", {}, context_instance=RequestContext(request))
  else:
    return render_to_response("etraining/admin/manage_question_poll.html", {}, context_instance=RequestContext(request))

@login_required
def add_question_poll(request):
  pass

@login_required
def add_question(request):
  pass

@login_required
def edit_question(request):
  pass

@login_required
def delete_question(request):
  pass

@login_required
def manage_employee_org(request):
  if request.method == "POST":
    return render_to_response("etraining/admin/manage_employee_org.html", {}, context_instance=RequestContext(request))
  else:
    return render_to_response("etraining/admin/manage_employee_org.html", {}, context_instance=RequestContext(request))

@login_required
def manage_visitor_org(request):
  if request.method == "POST":
    return render_to_response("etraining/admin/manage_visitor_org.html", {}, context_instance=RequestContext(request))
  else:
    return render_to_response("etraining/admin/manage_visitor_org.html", {}, context_instance=RequestContext(request))
