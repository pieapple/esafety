# coding: utf-8
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.utils.translation import ugettext as _
from django.core.urlresolvers import reverse
from etraining.models import Choice, Question, QuestionType, Document, Training, IsConfirmAvailable
from etraining.models import Employee, EmployeeTrainingRecord, NonemployeeRegistration, NonemployeeTrainingRecord, Group
from etraining.admin_forms import NonemployeeRegistrationForm, EmployeeRegistrationForm
import datetime, sys, random

def index(request):
    return HttpResponseRedirect(reverse("self_search"))

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
        training = visitor_entrance.entrance_training.training

    return render_to_response("etraining/entrance_training.html", {
            "training": training,
            "registration": visitor_entrance,
            "audio_clip": training.document.audio_clip,
        }, context_instance=RequestContext(request))

def self_search(request):
    if request.method == "POST":
        identity = request.POST["identity"]
        entries = Employee.objects.filter(identity=identity).order_by('-id')
        if len(entries):
            is_employee = 1
        else:
            entries = NonemployeeRegistration.objects.filter(identity=identity).order_by('-entrance_time')
            is_employee = 0

        if not len(entries):
            entry = None
            trainings = None
            is_employee = 0
        else:
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

    return render_to_response("etraining/self_training.html", {
            "training": training,
            "audio_clip": training.document.audio_clip,
        }, context_instance=RequestContext(request))

def self_examination(request, is_employee, record_id):    
    if int(is_employee):
        record = EmployeeTrainingRecord.objects.get(pk=record_id)
    else:
        record = NonemployeeTrainingRecord.objects.get(pk=record_id)

    session = request.session
    if request.method == "POST":
        action = str(request.POST['act'])
        try:
            answer = int(request.POST['answer'])
        except:
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

            isPass = (score >= record.training.pass_criteria)
            return render_to_response("etraining/self_exam_result.html", {
                    'qcount' : len(session['questions']),
                    'wrongcount' : wrongCount,
                    'pass' : isPass,
                }, context_instance=RequestContext(request))

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
                'answer' : session['answers'][session['cur_qid']] if session['cur_qid'] in session['answers'] else -1
            }, context_instance=RequestContext(request))
    else:
        question_count = record.training.question_count
        qt = record.training.exam_type
        questions = qt.question_set.all()

        random_index_list = random.sample(xrange(len(questions)), question_count)
        random_questions = []
        for random_index in random_index_list:
            random_questions.append(questions[random_index])

        session['questions'] = random_questions
        session['cur_qid'] = 0
        session['answers'] = {}
        return render_to_response("etraining/self_exam.html", {
                'left_qnum' : len(random_questions),
                'qcount' : len(random_questions),
                'cur_qid' : 0,
                'question' : random_questions[0],
                'has_next' : True,
                'has_pre' : False,
            }, context_instance=RequestContext(request))
