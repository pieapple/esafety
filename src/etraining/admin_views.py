from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, get_object_or_404, get_list_or_404
from django.http import HttpResponse
from django.utils.translation import ugettext as _
from django.template import RequestContext
from etraining.models import Choice, Question, QuestionType
from etraining.models import Document, Training
from etraining.models import Employee, EmployeeTraining, NonemployeeRegistration, NonemployeeTraining
from etraining.models import EmployeeGroup, NonemployeeGroup, EmployeeGroupTrainingSchedule, NonemployeeGroupTrainingSchedule, EntranceTraining
from etraining.admin_forms import NonemployeeRegistrationForm, EmployeeRegistrationForm
import datetime
from django.utils.timezone import utc

def get_training_for_employeegroup(group):
  if group.parent_group:
    return group.trainings + get_training_for_employeegroup(group.parent_group)
  else:
    return group.trainings

def get_training_for_nonemployeegroup(group):
  if group.parent_group:
    return group.trainings + get_training_for_nonemployeegroup(group.parent_group)
  else:
    return group.trainings

def get_entrance_training_for_nonemployeegroup(group):
  if group.entrance_training:
    return group.entrance_training
  elif group.parent_group:
    return get_entrance_training_for_nonemployeegroup(group.parent_group)
  else:
    return None

@login_required
def nonemployee_registration(request):
  if request.method == "POST":
    form = NonemployeeRegistrationForm(request.POST)
    if form.is_valid():
      # notify user to display entrance training
      nonemployee_registration = form.save(commit=False)
      nonemployee_registration.entrance_time = datetime.datetime.utcnow().replace(tzinfo=utc)
      nonemployee_registration.admin = request.user

      group_id = request.POST['group']
      sub_group_id = request.POST['sub_group']
      if group_id and sub_group_id:
        group = NonemployeeGroup.objects.get(pk=int(sub_group_id))
        
      nonemployee_registration.group = group
      nonemployee_registration.save()

      training = get_entrance_training_for_nonemployeegroup(group)
      return render_to_response("etraining/admin/visitor_training.html", {
          "training": training,
          "registration": nonemployee_registration,
        }, context_instance=RequestContext(request))
  else:
    form = NonemployeeRegistrationForm()

  groups = NonemployeeGroup.objects.filter(parent_group__isnull=True)
  sub_groups = NonemployeeGroup.objects.filter(parent_group__isnull=False)

  return render_to_response("etraining/admin/visitor_registration.html", {
      'form': form,
      'groups': groups,
      'sub_groups': sub_groups,
    }, context_instance=RequestContext(request))

@login_required
def visitor_training(request):
  if request.method == "POST":
    training = Training.objects.get(pk=request.POST["training_id"])
    registration = Registration.objects.get(pk=request.POST["registration_id"])
    entrance_training = EntranceTraining.objects.filter(registration=registration, training=training)
    if not entrance_training:
      entrance_training = ENtranceTraining.create(registartion=registartion, training=training)
    entrance_training.admin = request.user
    entrance_training.attend_date = datetime.date.today()
    entrance_training.save()
    return HttpResponseRedirect(reverse("visitor_registration"))

@login_required
def employee_registration(request):
  if request.method == "POST":
    form = EmployeeRegistrationForm(request.POST)
    if form.is_valid():
      employee_registration = form.save(commit=False)
      group_id = request.POST['group']
      sub_group_id = request.POST['sub_group']
      if group_id and sub_group_id:
        group = EmployeeGroup.objects.get(pk=int(sub_group_id))
        
      employee_registration.group = group
      employee_registration.save()
      employee_registration.save()
      return render_to_response("etraining/admin/employee_registration_result.html", {}, context_instance=RequestContext(request))
  else:
    form = EmployeeRegistrationForm()

  groups = EmployeeGroup.objects.filter(parent_group__isnull=True)
  sub_groups = EmployeeGroup.objects.filter(parent_group__isnull=False)

  return render_to_response("etraining/admin/employee_registration.html", {
      'form': form,
      'groups': groups,
      'sub_groups': sub_groups,
    }, context_instance=RequestContext(request))

@login_required
def training_list(request):
  nonemployee_training_schedule = NonemployeeGroupTrainingSchedule.objects.all()
  employee_training_schedule = EmployeeGroupTrainingSchedule.objects.all()
  return render_to_response("etraining/admin/training_list.html", {
      'employee_training_schedule': employee_training_schedule,
      'nonemployee_training_schedule': nonemployee_training_schedule,
    }, context_instance=RequestContext(request))

@login_required
def employee_training_signup(request):
  if request.method == "POST":
    training_schedule = EmployeeGroupTrainingSchedule.objects.get(request.POST["training_schedule_id"])
    employee = Employee.objects.get(request.POST["employee_id"])
    employeeTraining = EmployeeTraining.objects.get(employee=employee, training=training_schedule.training)
    if not employeeTraining:
      employeeTraining = EmployeeTraining(employee=employee, training=training_schedule.training)
    if request.POST["signup"]:
      employeeTraining.attend_date = datetime.date.today()
      employeeTraining.admin = request.user
    else:
      employeeTraining.attend_date = None
      employeeTraining.admin = None
    employeeTraining.save()
  else: 
    training = Training
    return render_to_response("etraining/admin/training_signup.html", {}, context_instance=RequestContext(request))

@login_required
def vendor_training_signup(request):
  if request.method == "POST":
    training_schedule = EmployeeGroupTrainingSchedule.objects.get(request.POST["training_schedule_id"])
    employee = Employee.objects.get(request.POST["employee_id"])
    employeeTraining = EmployeeTraining.objects.get(employee=employee, training=training_schedule.training)
    if not employeeTraining:
      employeeTraining = EmployeeTraining(employee=employee, training=training_schedule.training)
    if request.POST["signup"]:
      employeeTraining.attend_date = datetime.date.today()
      employeeTraining.admin = request.user
    else:
      employeeTraining.attend_date = None
      employeeTraining.admin = None
    employeeTraining.save()
  else: 
    training = Training
    return render_to_response("etraining/admin/training_signup.html", {}, context_instance=RequestContext(request))

@login_required
def view_training(request, training_id):
  training = Training.objects.get(pk=training_id)
  return render_to_response("etraining/admin/view_training.html", {
      "training": training,
    }, context_instance=RequestContext(request))

@login_required
def schedule_employee_training(request):
  if request.method == "POST":
    document = Document.objects.get(pk=int(request.POST["document_id"]))

    group_id = request.POST['group']
    sub_group_id = request.POST['sub_group']
    if group_id and sub_group_id:
      employeeGroup = EmployeeGroup.objects.get(pk=int(sub_group_id))

    name = request.POST["training_name"]
    description = request.POST["training_description"]
    training_type = request.POST["training_type"]
    pass_criteria = int(request.POST["pass_criteria"])
    question_count = int(request.POST["question_count"])
    exam_type_id = int(request.POST["exam_type"])

    training = Training(name=name, description=description, training_type=training_type, pass_criteria=pass_criteria, question_count=question_count)
    training.exam_type = QuestionType.objects.get(pk=exam_type_id)
    training.save()
    training_schedule = EmployeeGroupTrainingSchedule(training=training,employee_group=employeeGroup)
    training_schedule.training_date = datetime.date.today() 
    training_schedule.save()
    return render_to_response("etraining/admin/schedule_employee_training_result.html", {}, context_instance=RequestContext(request))
  else:
    documents = Document.objects.all()
    groups = EmployeeGroup.objects.filter(parent_group__isnull=True)
    sub_groups = EmployeeGroup.objects.filter(parent_group__isnull=False)
    question_types = QuestionType.objects.all()
    return render_to_response("etraining/admin/schedule_employee_training.html", {
        "documents": documents,
        "groups": groups,
        "sub_groups": sub_groups,
        "exam_types": question_types,
      }, context_instance=RequestContext(request))

@login_required
def schedule_vendor_training(request):
  if request.method == "POST":
    document = Document.objects.get(pk=int(request.POST["document_id"]))
    name = request.POST["training_name"]
    description = request.POST["training_description"]
    pass_criteria = int(request.POST["pass_criteria"])
    question_count = int(request.POST["question_count"])
    exam_type_id = int(request.POST["exam_type"])

    group_id = request.POST['group']
    sub_group_id = request.POST['sub_group']
    if group_id and sub_group_id:
      nonemployeeGroup = NonemployeeGroup.objects.get(pk=int(sub_group_id))
    training = Training(name=name, description=description, pass_criteria=pass_criteria, question_count=question_count)
    training.exam_type = QuestionType.objects.get(pk=exam_type_id)
    training.save()
    training_schedule = NonemployeeGroupTrainingSchedule(training=training,nonemployee_group=nonemployeeGroup)
    training_schedule.training_date = datetime.date.today()
    training_schedule.save()
    return render_to_response("etraining/admin/schedule_vendor_training_result.html", {}, context_instance=RequestContext(request))
  else:
    documents = Document.objects.all()
    groups = NonemployeeGroup.objects.filter(parent_group__isnull=True)
    sub_groups = NonemployeeGroup.objects.filter(parent_group__isnull=False)
    question_types = QuestionType.objects.all()
    return render_to_response("etraining/admin/schedule_vendor_training.html", {
        "documents": documents,
        "groups": groups,
        "sub_groups": sub_groups,
        "exam_types": question_types,
      }, context_instance=RequestContext(request))

@login_required
def schedule_visitor_training(request):
  if request.method == "POST":
    document = Document.objects.get(pk=int(request.POST["document_id"]))
    name = request.POST["training_name"]
    description = request.POST["training_description"]

    group_id = request.POST['group']
    sub_group_id = request.POST['sub_group']
    if group_id and sub_group_id:
      nonemployeeGroup = NonemployeeGroup.objects.get(pk=int(sub_group_id))
    training = Training(name=name, description=description)
    training.save()
    nonemployeeGroup.entrance_training = training
    nonemployeeGroup.save()
    return render_to_response("etraining/admin/schedule_visitor_training_result.html", {}, context_instance=RequestContext(request))
  else:
    documents = Document.objects.all()
    groups = NonemployeeGroup.objects.filter(parent_group__isnull=True)
    sub_groups = NonemployeeGroup.objects.filter(parent_group__isnull=False)
    return render_to_response("etraining/admin/schedule_visitor_training.html", {
        "documents": documents,
        "groups": groups,
        "sub_groups": sub_groups,
      }, context_instance=RequestContext(request))

@login_required
def view_employee_training(request):
  if request.method == "POST":
    return render_to_response("etraining/admin/view_employee_training.html", {}, context_instance=RequestContext(request))
  else:
    return render_to_response("etraining/admin/view_employee_training.html", {}, context_instance=RequestContext(request))

@login_required
def view_employee_training_detail(request):
  return render_to_response("etraining/admin/view_employee_training_detail.html", {}, context_instance=RequestContext(request))

@login_required
def view_vendor_training(request):
  if request.method == "POST":
    return render_to_response("etraining/admin/view_vendor_training.html", {}, context_instance=RequestContext(request))
  else:
    return render_to_response("etraining/admin/view_vendor_training.html", {}, context_instance=RequestContext(request))

@login_required
def view_vendor_training_detail(request):
  return render_to_response("etraining/admin/view_vendor_training_detail.html", {}, context_instance=RequestContext(request))

@login_required
def view_training_signup(request):
  return render_to_response("etraining/admin/view_training_signup.html", {}, context_instance=RequestContext(request))

@login_required
def view_visitor_entrance(request):
  if request.method == "POST":
    return render_to_response("etraining/admin/view_visitor_entrance.html", {}, context_instance=RequestContext(request))
  else:
    return render_to_response("etraining/admin/view_visitor_entrance.html", {}, context_instance=RequestContext(request))

@login_required
def view_visitor_entrance_detail(request):
  return render_to_response("etraining/admin/view_visitor_entrance_detail.html", {}, context_instance=RequestContext(request))

@login_required
def manage_documents(request):
  documents = Document.objects.all()
  return render_to_response("etraining/admin/manage_documents.html", {
    'document_list': documents,
  }, context_instance=RequestContext(request))

@login_required
def add_document(request):
  if request.method != "POST":
    return _("Error to add document")
  
  name = request.POST["name"]
  text = request.POST["text"]
  document = Document(name=name, text=text)
  document.save()
  return HttpResponse(str(document.id), content_type="text/plain")

@login_required
def edit_document(request):
  if request.method != "POST":
    return _("Error to edit document")
  
  value = request.POST["value"]
  columnId = int(request.POST["columnId"])
  document = Document.objects.get(pk=request.POST["id"])
  if columnId == 0:
    document.name = value
  elif columnId == 1:
    document.text = value
  document.save()
  return HttpResponse(value, content_type="text/plain")

@login_required
def delete_document(request):
  if request.method != "POST":
    return _("Error to delete document")
  
  document = Document.objects.get(pk=request.POST["id"])
  document.delete()
  return HttpResponse("", content_type="text/plain")

@login_required
def manage_question_poll(request):
  question_type_list = QuestionType.objects.all()

  if request.method == "POST":
    if request.POST["question_type"]:
      question_type = request.POST["question_type"]
      questions = Question.objects.filter(question_type__pk=int(question_type))
    return render_to_response("etraining/admin/manage_question_poll.html", {
      'question_list': questions,
      'select_type': int(question_type),
      'question_type_list': question_type_list,
    }, context_instance=RequestContext(request))
  else:
    return render_to_response("etraining/admin/manage_question_poll.html", {
      'question_type_list': question_type_list,
    }, context_instance=RequestContext(request))

@login_required
def add_question_poll(request):
  if request.method == "POST":
    question_type = QuestionType(name=request.POST["question_type"])
    question_type.save()
    return HttpResponseRedirect(reverse("manage_question_poll"))

@login_required
def add_question(request):
  if request.method != "POST":
    return _("Error to add document")
  
  question_content = request.POST["question_content"]
  question_type = request.POST["question_type"]
  choice_1 = request.POST["choice_1"]
  choice_1_is_answer = request.POST["choice_1_is_answer"]
  choice_2 = request.POST["choice_2"]
  choice_2_is_answer = request.POST["choice_2_is_answer"]
  choice_3 = request.POST["choice_3"]
  choice_3_is_answer = request.POST["choice_3_is_answer"]
  choice_4 = request.POST["choice_4"]
  choice_4_is_answer = request.POST["choice_4_is_answer"]

  question = Question(content=question_content, question_type=QuestionType.objects.get(pk=question_type))
  question.save()
  choice = Choice(text=choice_1, is_answer=choice_1_is_answer, question=question)
  choice.save()
  choice = Choice(text=choice_2, is_answer=choice_2_is_answer, question=question)
  choice.save()
  choice = Choice(text=choice_3, is_answer=choice_3_is_answer, question=question)
  choice.save()
  choice = Choice(text=choice_4, is_answer=choice_4_is_answer, question=question)
  choice.save()
  return HttpResponse(str(question.id), content_type="text/plain")

@login_required
def edit_question(request):
  if request.method != "POST":
    return _("Error to edit document")
  
  value = request.POST["value"]
  columnId = int(request.POST["columnId"])
  question = Question.objects.get(pk=request.POST["id"])
  choices = question.choice_set.all()
  if columnId == 0:
    question.content = value
    question.save()
  elif columnId >= 1 and columnId <= 4:
    choices[columnId-1].text = value
    choices[columnId-1].save()
  elif columnId == 5:
    for choice in choices:
      choice.is_answer = False
      chocie.save()
    choices[int(value)].is_answer = True
    choices[int(value)].save()
  return HttpResponse(value, content_type="text/plain")

@login_required
def delete_question(request):
  if request.method != "POST":
    return _("Error to delete document")
  
  question = Question.objects.get(pk=request.POST["id"])
  question.delete()
  return HttpResponse("", content_type="text/plain")
