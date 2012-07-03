from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, get_object_or_404, get_list_or_404
from django.http import HttpResponse
from django.utils.translation import ugettext as _
from django.template import RequestContext
from etraining.models import Choice, Question, QuestionType
from etraining.models import Document, Training
from etraining.models import Employee, EmployeeTraining, NonemployeeRegistration, NonemployeeTraining, Group
from etraining.admin_forms import VisitorRegistrationForm, EmployeeRegistrationForm
import datetime
from django.utils.timezone import utc

@login_required
def visitor_registration(request):
  if request.method == "POST":
    form = VisitorRegistrationForm(request.POST)
    if form.is_valid():
      # notify user to display entrance training
      new_registration = form.save(commit=False)
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
      new_registration = form.save(commit=False)
      return render_to_response("etraining/admin/employee_registration_result.html", {}, context_instance=RequestContext(request))
  else:
    form = EmployeeRegistrationForm()

  return render_to_response("etraining/admin/employee_registration.html", {
      'form': form,
    }, context_instance=RequestContext(request))

@login_required
def training_list(request):
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
  question_type = QuestionType.objects.all()

  if request.method == "POST":
    if request.POST["question_type"]:
      type_id = request.POST["question_type"]
      questions = Question.objects.filter(question_type__pk=int(type_id))
      print questions.count()
    return render_to_response("etraining/admin/manage_question_poll.html", {
      'question_list': questions,
      'select_type': int(type_id),
      'question_type_list': question_type,
    }, context_instance=RequestContext(request))
  else:
    return render_to_response("etraining/admin/manage_question_poll.html", {
      'question_type_list': question_type,
    }, context_instance=RequestContext(request))

@login_required
def add_question_poll(request):
  pass

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
