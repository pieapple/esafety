from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, get_object_or_404, get_list_or_404
from django.utils.translation import ugettext as _
from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
import datetime
from django.utils.timezone import utc
from etraining.models import Choice, Question, QuestionType
from etraining.models import Document, Training
from etraining.models import Employee, EmployeeTraining, NonemployeeRegistration, NonemployeeTraining, Group

def visitor_welcome(request):
    return render_to_response("etraining/welcome.html", {}, context_instance=RequestContext(request))

def entrance_training(request):
    if request.method == "POST":
        return HttpResponseRedirect(reverse("visitor_welcome"))
    else:
        return render_to_response("etraining/entrance_training.html", {}, context_instance=RequestContext(request))

def self_search(request):
    if request.method == "POST":
        return render_to_response("etraining/self_search.html", {}, context_instance=RequestContext(request))
    else:
        return render_to_response("etraining/self_search.html", {}, context_instance=RequestContext(request))

def self_training(request):
    return render_to_response("etraining/self_training.html", {}, context_instance=RequestContext(request))

def self_examination(request):
    if request.method == "POST":
# if exam complete
        return render_to_response("etraining/self_exam_result.html", {}, context_instance=RequestContext(request))
# else
# print exam page
    else:
    # hard code question count = 3, question type = 1. this will be picked up from training
        question_count = 3
        qt = QuestionType.objects.get(id=1)
        questions = qt.question_set.all()[:question_count]
        session = request.session
        session['questions'] = questions
        session['cur_qid'] = 0
        return render_to_response("etraining/self_exam.html", {
                                'left_qnum' : len(questions),
                                'qcount' : len(questions),
                                'cur_qid' : 0,
                                'question' : questions[0]
                                }, context_instance=RequestContext(request))
