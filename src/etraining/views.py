# coding: utf-8
from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, get_object_or_404, get_list_or_404
from django.utils.translation import ugettext as _
from django.template import RequestContext
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
import datetime
from django.utils.timezone import utc
from etraining.models import Choice, Question, QuestionType
from etraining.models import Document, Training
from etraining.models import Employee, EmployeeTrainingRecord, NonemployeeRegistration, NonemployeeTrainingRecord, Group, IsConfirmAvailable
import pyekho
from django.conf import settings
import sys

def get_training_for_group(group):
  if group.parent_group:
    trainings = []
    trainings.extend(group.trainings.all())
    trainings.extend(get_training_for_group(group.parent_group))
    return trainings
  else:
    return group.trainings.all() 

def visitor_welcome(request):
    return render_to_response("etraining/welcome.html", {}, context_instance=RequestContext(request))

def is_available_entrance(request):
      available = IsConfirmAvailable.objects.all()
      if available and available[0]:
        return HttpResponse(available[0].registration)
      else:
        return HttpResponse()

def entrance_training(request, registration_id):
    if request.method == "POST":
        for available in IsConfirmAvailable.objects.all():
          available.delete()
        return HttpResponseRedirect(reverse("visitor_welcome"))
    else:
        visitor_entrance = NonemployeeRegistration.objects.get(pk=registration_id)
        training = visitor_entrance.entrance_training
        return render_to_response("etraining/entrance_training.html", {
          "training": training,
          "registration": visitor_entrance,
        }, context_instance=RequestContext(request))

def self_search(request):
    if request.method == "POST":
        identity = request.POST["identity"]
        try:
          entries = Employee.objects.filter(identity=identity).order_by('-id')
          is_employee = 1
        except:
          entries = NonemployeeRegistration.objects.filter(identity=identity).order_by('-entrance_time')
          is_employee = 0

        entry = entries[0]
        trainings = get_training_for_group(entry.group)
        for training in trainings:
          try:
            if is_employee:
              record = EmployeeTrainingRecord.objects.get(training=training, employee=entry)
            else:
              record = NonemployeeTrainingRecord.objects.get(training=training, registration=entry)
            if not record:
              training.status = 0
            elif not record.score or record.score < training.pass_criteria:
              training.record = record.id
              training.status = 1
            else:
              training.record = record.id
              training.status = 2
          except:
            training.status = 0 #no training

        return render_to_response("etraining/self_search.html", {
            'identity': identity,
            'entry': entry,
            'training_list': trainings,
            'is_employee': is_employee,
          }, context_instance=RequestContext(request))
    else:
        return render_to_response("etraining/self_search.html", {}, context_instance=RequestContext(request))

def self_training(request, training_id):
  training = Training.objects.get(pk=training_id)

  if sys.getdefaultencoding() != 'utf8':
    reload(sys)
    sys.setdefaultencoding('utf8')

  text = ""
  for document in training.documents.all():
    text += unicode(document.name)
    text += u"\n"
    text += unicode(document.text)
    text += u"\n"
  path = "audio/" + str(datetime.datetime.now()) + ".ogg"
  pyekho.saveOgg(text, settings.MEDIA_ROOT + path)

  return render_to_response("etraining/self_training.html", {
      "training": training,
      "audio_clip": settings.MEDIA_URL + path,
    }, context_instance=RequestContext(request))

def self_examination(request, is_employee, record_id):    
    if is_employee:
      record = EmployeeTrainingRecord.objects.get(pk=record_id)
    else:
      record = NonemployeeTrainingRecord.objects.get(pk=record_id)

    session = request.session
    if request.method == "POST":
        action = str(request.POST['act'])
        if request.POST.has_key('answer'):
            answer = int(request.POST['answer'])
        else:
            answer = -1
        session['answers'][session['cur_qid']]=answer
        if action == 'finish':
            wrongCount = 0
            for qid in session['answers']:
                question = session['questions'][qid]
                answer = session['answers'][qid]
                try:
                    choice = question.choice_set.get(id=answer)
                except Choice.DoesNotExist:
                    wrongCount += 1
                else:
                    if choice.is_answer:
                        pass
                    else:
                        wrongCount += 1
            score = len(session['questions'])-wrongCount
            record.score = score
            record.save()

            isPass = score > record.training.pass_criteria
            return render_to_response("etraining/self_exam_result.html", {
                      'qcount' : len(session['questions']),
                      'wrongcount' : wrongCount,
                      'pass' : isPass,}, context_instance=RequestContext(request))
        if action == 'pre':
            session['cur_qid'] += -1
        if action == 'next':
            session['cur_qid'] += 1
        if action == "reexam":
            session['cur_qid'] = 0
        return render_to_response("etraining/self_exam.html", {
            'left_qnum' : len(session['questions'])-session['cur_qid'],
            'qcount' : len(session['questions']),
            'cur_qid' : session['cur_qid'],
            'question' : session['questions'][session['cur_qid']],
            'has_next' : len(session['questions'])-session['cur_qid']>1,
            'has_pre' : session['cur_qid']>0,
            'answer' : session['answers'][session['cur_qid']] if session['cur_qid'] in session['answers'] else -1}, context_instance=RequestContext(request))
    else:
        question_count = record.training.question_count
        qt = record.training.exam_type
        questions = qt.question_set.all()[:question_count]
        session['questions'] = questions
        session['cur_qid'] = 0
        session['answers'] = {}
        return render_to_response("etraining/self_exam.html", {
                      'left_qnum' : len(questions),
                      'qcount' : len(questions),
                      'cur_qid' : 0,
                      'question' : questions[0],
                      'has_next' : True,
                      'has_pre' : False}, context_instance=RequestContext(request))
