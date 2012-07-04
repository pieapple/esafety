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
from etraining.models import Employee, EmployeeTraining, NonemployeeRegistration, NonemployeeTraining, EmployeeGroup, NonemployeeGroup

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
    session = request.session
    if request.method == "POST":
# if exam complete
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
            score = (len(session['questions'])-wrongCount)*100/len(session['questions'])
            print(score)
            # to be saved in employee training
            isPass = score > session['pass_criteria']
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
        #else
        #    return render_to_response("etraining/self_exam_result.html", {}, context_instance=RequestContext(request))
        #endif
# else
# print exam page
    else:
    # hard code question count = 3, question type = 1. this will be picked up from training
        question_count = 3
        qt = QuestionType.objects.get(id=1)
        # hard code pass_criteria to 60, it will be picked up from training
        questions = qt.question_set.all()[:question_count]
        session['questions'] = questions
        session['cur_qid'] = 0
        session['pass_criteria'] = 60
        session['answers'] = {}
        return render_to_response("etraining/self_exam.html", {
                                'left_qnum' : len(questions),
                                'qcount' : len(questions),
                                'cur_qid' : 0,
                                'question' : questions[0],
                                'has_next' : True,
                                'has_pre' : False}, context_instance=RequestContext(request))
