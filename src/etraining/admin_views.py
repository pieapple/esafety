from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, get_object_or_404, get_list_or_404
from django.http import HttpResponse
from django.utils.translation import ugettext as _
from django.template import RequestContext
from etraining.models import Choice, Question, QuestionType
from etraining.models import Document, Training
from etraining.models import Employee, EmployeeTrainingRecord, NonemployeeRegistration, NonemployeeTrainingRecord, EntranceTrainingRecord, Group
from etraining.admin_forms import NonemployeeRegistrationForm, EmployeeRegistrationForm
import datetime
from django.utils.timezone import utc

def get_entrance_training_for_group(group):
  if group.entrance_training:
    return group.entrance_training
  elif group.parent_group:
    return get_entrance_training_for_group(group.parent_group)
  else:
    return None

@login_required
def visitor_entrance(request):
  if request.method == "POST":
    form = NonemployeeRegistrationForm(request.POST)
    if form.is_valid():
      # notify user to display entrance training
      visitor_entrance = form.save(commit=False)
      visitor_entrance.entrance_time = datetime.datetime.utcnow().replace(tzinfo=utc)
      visitor_entrance.admin = request.user

      try:
        group_id = request.POST['group']
      except:
        group_id = None
      try:
        sub_group_id = request.POST['sub_group']
      except:
        sub_group_id = None
      if group_id and sub_group_id:
        group = Group.objects.get(pk=int(sub_group_id))
        visitor_entrance.group = group

      training = get_entrance_training_for_group(group)
      entrance_training_record = EntranceTrainingRecord(training=training)
      entrance_training_record.save()
      visitor_entrance.entrance_training = entrance_training_record
      visitor_entrance.save()
      return render_to_response("etraining/admin/visitor_training.html", {
          "training": training,
          "registration": visitor_entrance,
        }, context_instance=RequestContext(request))
  else:
    form = NonemployeeRegistrationForm()

  groups = Group.objects.filter(is_employee_group=False).filter(parent_group__isnull=True)
  sub_groups = Group.objects.filter(is_employee_group=False).filter(parent_group__isnull=False)
  return render_to_response("etraining/admin/visitor_entrance.html", {
      'form': form,
      'groups': groups,
      'sub_groups': sub_groups,
    }, context_instance=RequestContext(request))

@login_required
def visitor_training(request):
  if request.method == "POST":
    try:
      training_id = int(request.POST["training_id"])
      registration_id = int(request.POST["registration_id"])
      training = Training.objects.get(pk=training_id)
      registration = NonemployeeRegistration.objects.get(pk=registration_id)
      entrance_training = EntranceTraining.objects.filter(registration=registration, training=training)
      entrance_training.admin = request.user
      entrance_training.attend_date = datetime.date.today()
      entrance_training.save()
    except:
      pass

    return HttpResponseRedirect(reverse("visitor_entrance"))

@login_required
def employee_registration(request):
  if request.method == "POST":
    form = EmployeeRegistrationForm(request.POST)
    if form.is_valid():
      employee_registration = form.save(commit=False)

      try:
        group_id = request.POST['group']
      except:
        group_id = None
      try:
        sub_group_id = request.POST['sub_group']
      except:
        sub_group_id = None
      if group_id and sub_group_id:
        group = Group.objects.get(pk=int(sub_group_id))
        employee_registration.group = group

      employee_registration.save()
      return render_to_response("etraining/admin/employee_registration_result.html", {}, context_instance=RequestContext(request))
  else:
    form = EmployeeRegistrationForm()

  groups = Group.objects.filter(is_employee_group=True).filter(parent_group__isnull=True)
  sub_groups = Group.objects.filter(is_employee_group=True).filter(parent_group__isnull=False)
  return render_to_response("etraining/admin/employee_registration.html", {
      'form': form,
      'groups': groups,
      'sub_groups': sub_groups,
    }, context_instance=RequestContext(request))

@login_required
def training_schedule_list(request):
  groups = Group.objects.all()
  return render_to_response("etraining/admin/training_schedule_list.html", {
      'groups': groups,
      'today': datetime.date.today(),
    }, context_instance=RequestContext(request))

@login_required
def training_signup(request, group_id, training_id):
  group = Group.objects.get(pk=group_id)
  training = Training.objects.get(pk=training_id)

  if request.method == "POST":
    try:
      if group.is_employee_group:
        employee_id = int(request.POST["employee_id"])
        employee = Employee.objects.get(pk=employee_id)
        try:
          employeeTrainingRecord = EmployeeTrainingRecord.objects.get(employee=employee, training_schedule=training_schedule)
        except:
          employeeTrainingRecord = EmployeeTrainingRecord(employee=employee, training_schedule=training_schedule)
        if request.POST["signup"]:
          employeeTrainingRecord.attend_date = datetime.date.today()
          employeeTrainingRecord.admin = request.user
        else:
          employeeTrainingRecord.attend_date = None
          employeeTrainingRecord.admin = None
        employeeTrainingRecord.save()
      else:
        registration_id = int(request.POST["registration_id"])
        registration = NonemployeeRegistrationRecord.objects.get(pk=registration_id)
        try:
          nonemployeeTrainingRecord = NonemployeeTrainingRecord.objects.get(registration=registration, training_schedule=training_schedule)
        except:
          nonemployeeTrainingRecord = NonemployeeTrainingRecord(registration=registration, training_schedule=training_schedule)
        if request.POST["signup"]:
          nonemployeeTrainingRecord.attend_date = datetime.date.today()
          nonemployeeTrainingRecord.admin = request.user
        else:
          nonemployeeTrainingRecord.attend_date = None
          nonemployeeTrainingRecord.admin = None
        nonemployeeTrainingRecord.save()

      return HttpResponse("")
    except:
      return HttpResponse("Error")
  else: 
    employee_list = []
    nonemployee_list = []
    if group.is_employee_group:
      groups = Group.objects.filter(is_employee_group=True)
      for new_group in groups:
        if new_group == group or new_group.parent_group == group:
          employee_list.extend(new_group.employee_set.all())
    else:
      groups = Group.objects.filter(is_employee_group=False)
      for new_group in groups:
        if new_group == group or new_group.parent_group == group:
          nonemployee_list.extend(new_group.nonemployeeRegistration_set.all())
    return render_to_response("etraining/admin/training_signup.html", {
        "training": training,
        "group": group,
        "employee_list": employee_list,
        "nonemployee_list": nonemployee_list,
      }, context_instance=RequestContext(request))

@login_required
def view_training_signup(request, employee_training_id):
  training_schedule = EmployeeGroupTrainingSchedule.objects.get(pk=employee_training_id)
  return render_to_response("etraining/admin/view_training_signup.html", {
      "training": training,
      "group": group,
    }, context_instance=RequestContext(request))

@login_required
def attend_training(request, training_id):
  training = Training.objects.get(pk=training_id)
  return render_to_response("etraining/admin/training_attend.html", {
      "training": training,
    }, context_instance=RequestContext(request))

@login_required
def schedule_employee_training(request):
  if request.method == "POST":
    try:
      name = request.POST["training_name"]
      description = request.POST["training_description"]
      training_type = request.POST["training_type"]
      pass_criteria = int(request.POST["pass_criteria"])
      question_count = int(request.POST["question_count"])
      exam_type_id = int(request.POST["exam_type"])
      document = Document.objects.get(pk=int(request.POST["document_id"]))

      training = Training(name=name, description=description, training_type=training_type, pass_criteria=pass_criteria, question_count=question_count)
      training.exam_type = QuestionType.objects.get(pk=exam_type_id)
      training.training_date = datetime.date.today() 
      training.save()
      training.documents.add(document)

      try:
        group_id = request.POST['group']
      except:
        group_id = None

      try:
        sub_group_id = request.POST['sub_group']
      except:
        sub_group_id = None
      if not group_id:
        groups = Group.objects.filter(is_employee_group=True).filter(parent_group__isnull=True)
        for group in groups:
          group.trainings.add(training)
          group.save()
      elif group_id and not sub_group_id:
        group = Group.objects.get(pk=int(group_id))
        group.trainings.add(training)
        group.save()
      elif group_id and sub_group_id:
        group = Group.objects.get(pk=int(sub_group_id))
        group.trainings.add(training)
        group.save()
    except:
      pass
    return render_to_response("etraining/admin/schedule_employee_training_result.html", {}, context_instance=RequestContext(request))
  else:
    documents = Document.objects.all()
    groups = Group.objects.filter(is_employee_group=True).filter(parent_group__isnull=True)
    sub_groups = Group.objects.filter(is_employee_group=True).filter(parent_group__isnull=False)
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
    try:
      name = request.POST["training_name"]
      description = request.POST["training_description"]
      training_type = request.POST["training_type"]
      pass_criteria = int(request.POST["pass_criteria"])
      question_count = int(request.POST["question_count"])
      exam_type_id = int(request.POST["exam_type"])
      document = Document.objects.get(pk=int(request.POST["document_id"]))

      training = Training(name=name, description=description, training_type=training_type, pass_criteria=pass_criteria, question_count=question_count)
      training.exam_type = QuestionType.objects.get(pk=exam_type_id)
      training.training_date = datetime.date.today() 
      training.save()
      training.documents.add(document)

      try:
        group_id = request.POST['group']
      except:
        group_id = None

      try:
        sub_group_id = request.POST['sub_group']
      except:
        sub_group_id = None

      if not group_id:
        groups = Group.objects.filter(is_employee_group=False).filter(parent_group__isnull=True)
        for group in groups:
          group.trainings.add(training)
          group.save()
      elif group_id and not sub_group_id:
        group = Group.objects.get(pk=int(group_id))
        group.trainings.add(training)
        group.save()
      elif group_id and sub_group_id:
        group = Group.objects.get(pk=int(sub_group_id))
        group.trainings.add(training)
        group.save()
    except:
      pass
    return render_to_response("etraining/admin/schedule_vendor_training_result.html", {}, context_instance=RequestContext(request))
  else:
    documents = Document.objects.all()
    groups = Group.objects.filter(is_employee_group=False).filter(parent_group__isnull=True)
    sub_groups = Group.objects.filter(is_employee_group=False).filter(parent_group__isnull=False)
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
    name = request.POST["training_name"]
    description = request.POST["training_description"]
    document = Document.objects.get(pk=int(request.POST["document_id"]))

    training = Training(name=name, description=description)
    training.save()
    training.documents.add(document)

    try:
      group_id = request.POST['group']
    except:
      group_id = None

    try:
      sub_group_id = request.POST['sub_group']
    except:
      sub_group_id = None

    print group_id
    print sub_group_id
    if not group_id:
      print "1"
      groups = Group.objects.filter(is_employee_group=False).filter(parent_group__isnull=True)
      print groups
      for group in groups:
        group.entrance_training = training
        group.save()
    elif group_id and not sub_group_id:
      print "2"
      group = Group.objects.get(pk=int(group_id))
      group.entrance_training = training
      group.save()
    elif group_id and sub_group_id:
      print "3"
      group = Group.objects.get(pk=int(sub_group_id))
      group.entrance_training = training
      group.save()
    return render_to_response("etraining/admin/schedule_visitor_training_result.html", {}, context_instance=RequestContext(request))
  else:
    documents = Document.objects.all()
    groups = Group.objects.filter(is_employee_group=False).filter(parent_group__isnull=True)
    sub_groups = Group.objects.filter(is_employee_group=False).filter(parent_group__isnull=False)
    return render_to_response("etraining/admin/schedule_visitor_training.html", {
        "documents": documents,
        "groups": groups,
        "sub_groups": sub_groups,
      }, context_instance=RequestContext(request))

@login_required
def view_employee_training(request):
  employee_trainings = EmployeeTrainingRecord.objects.all()
  return render_to_response("etraining/admin/view_employee_training.html", {
    "employee_training_list": employee_trainings,
  }, context_instance=RequestContext(request))

@login_required
def view_vendor_training(request):
  vendor_trainings = NonemployeeTrainingRecord.objects.all()
  return render_to_response("etraining/admin/view_vendor_training.html", {
    "vendor_training_list": vendor_trainings,
  }, context_instance=RequestContext(request))

@login_required
def view_visitor_entrance(request):
  visitor_entrances = NonemployeeRegistration.objects.all()
  return render_to_response("etraining/admin/view_visitor_entrance.html", {
    "visitor_entrance_list": visitor_entrances,
  }, context_instance=RequestContext(request))

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
      for question in questions:
        choices = question.choice_set.all()
        try:
          question.choice_1 = choices[0].text
        except:
          question.choice_1 = ""
        try:
          question.choice_2 = choices[1].text
        except:
          question.choice_2 = ""
        try:
          question.choice_3 = choices[2].text
        except:
          question.choice_3 = ""
        try:
          question.choice_4 = choices[3].text
        except:
          question.choice_4 = ""
        for choice in question.choice_set.all():
          if choice.is_answer:
            question.answer = choice.text
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

@login_required
def add_question(request):
  if request.method != "POST":
    return _("Error to add question")
  
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
    return _("Error to edit question")
  
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
      if choice.id == int(value):
        choice.is_answer = True
      else:
        choice.is_answer = False
      chocie.save()
  return HttpResponse(value, content_type="text/plain")

@login_required
def delete_question(request):
  if request.method != "POST":
    return _("Error to delete question")
  
  question = Question.objects.get(pk=request.POST["id"])
  question.delete()
  return HttpResponse("", content_type="text/plain")
