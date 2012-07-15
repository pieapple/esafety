# coding: utf-8
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.utils.translation import ugettext as _
from django.conf import settings
from etraining.models import Choice, Question, QuestionType, Document, Training, IsConfirmAvailable
from etraining.models import Employee, EmployeeTrainingRecord, NonemployeeRegistration, NonemployeeTrainingRecord, Group
from etraining.admin_forms import NonemployeeRegistrationForm, EmployeeRegistrationForm
import datetime, sys, random
from django.utils.timezone import utc

def get_entrance_training_for_group(group):
    if group.entrance_training:
        return group.entrance_training
    elif group.parent_group:
        return get_entrance_training_for_group(group.parent_group)
    else:
        return None

def get_employees_by_group(group):
    employee_list = []
    employee_list.extend(group.employee_set.all())
    for new_group in group.child_groups.all():
        employee_list.extend(get_employees_by_group(new_group))
    return employee_list

def get_nonemployees_by_group(group):
    nonemployee_list = []
    nonemployee_list.extend(new_group.nonemployeeregistration_set.all())
    for new_group in group.child_groups.all():
        nonemployee_list.extend(get_nonemployees_by_group(new_group))
    return nonemployee_list

@login_required
def visitor_entrance(request):
    if request.method == "POST":
        form = NonemployeeRegistrationForm(request.POST)
        if form.is_valid():
            visitor_entrance = form.save(commit=False)
            visitor_entrance.entrance_time = datetime.datetime.utcnow().replace(tzinfo=utc)
            visitor_entrance.admin = request.user
            visitor_entrance.save()

            if request.POST.has_key('group') and request.POST.has_key('sub_group'):
                group_id = request.POST['group']
                sub_group_id = request.POST['sub_group']
                group = Group.nonemployee_groups.get(pk=int(sub_group_id))

                training = get_entrance_training_for_group(group)
                entrance_training_record = NonemployeeTrainingRecord(registration=visitor_entrance, \
                        training=training)
                entrance_training_record.save()

                visitor_entrance.group = group 
                visitor_entrance.entrance_training = entrance_training_record
                visitor_entrance.save()

            available = IsConfirmAvailable(registration=visitor_entrance.pk)
            available.save()

            return render_to_response("etraining/admin/visitor_training.html", {
                "training": training,
                "registration": visitor_entrance,
            }, context_instance=RequestContext(request))
    else:
        form = NonemployeeRegistrationForm()

    root_group = Group.nonemployee_groups.root_group()
    groups = Group.nonemployee_groups.groups()
    sub_groups = Group.nonemployee_groups.subgroups()
    return render_to_response("etraining/admin/visitor_entrance.html", {
        'form': form,
        'root_group': root_group,
        'groups': groups,
        'sub_groups': sub_groups,
    }, context_instance=RequestContext(request))

@login_required
def visitor_training(request):
    if request.method == "POST":
        training = Training.objects.get(pk=request.POST["training_id"])
        registration = NonemployeeRegistration.objects.get(pk=request.POST["registration_id"])

        entrance_training = NonemployeeTrainingRecord.entrance_trainings.filter( \
                registration=registration, training=training)
        entrance_training.admin = request.user
        entrance_training.attend_date = datetime.datetime.utcnow().replace(tzinfo=utc)
        entrance_training.save()           

        return HttpResponseRedirect(reverse("visitor_entrance"))

@login_required
def new_employee_registration(request):
    if request.method == "POST":
        form = EmployeeRegistrationForm(request.POST)
        if form.is_valid():
            employee_registration = form.save(commit=False)

            if request.POST.has_key('group') and request.POST.has_key('sub_group'):
                group_id = request.POST['group']
                sub_group_id = request.POST['sub_group']
                group = Group.employee_groups.get(pk=int(sub_group_id))
                employee_registration.group = group

            employee_registration.save()

            return render_to_response("etraining/admin/new_employee_registration_result.html", {\
            }, context_instance=RequestContext(request))
    else:
        form = EmployeeRegistrationForm()

    root_group = Group.employee_groups.root_group()
    groups = Group.employee_groups.groups()
    sub_groups = Group.employee_groups.subgroups()
    return render_to_response("etraining/admin/new_employee_registration.html", {
        'form': form,
        'root_group': root_group,
        'groups': groups,
        'sub_groups': sub_groups,
    }, context_instance=RequestContext(request))

@login_required
def employee_training_schedule_list(request):
    groups = Group.employee_groups.all()
    return render_to_response("etraining/admin/employee_training_schedule_list.html", {
        'groups': groups,
    }, context_instance=RequestContext(request))

@login_required
def vendor_training_schedule_list(request):
    groups = Group.nonemployee_groups.all()
    return render_to_response("etraining/admin/vendor_training_schedule_list.html", {
        'groups': groups,
    }, context_instance=RequestContext(request))

@login_required
def training_signup(request, group_id, training_id):
    group = Group.objects.get(pk=group_id)
    training = Training.objects.get(pk=training_id)

    if request.method == "POST":
        #try:
            if group.is_employee_group:
                employee = Employee.objects.get(pk=request.POST["employee_id"])
                employeeTrainingRecord = EmployeeTrainingRecord.objects.get_or_create( \
                    employee=employee, training=training)
                print employeeTrainingRecord
                employeeTrainingRecord.attend_date = datetime.date.today()
                employeeTrainingRecord.admin = request.user
                employeeTrainingRecord.save()
            else:
                registration = NonemployeeRegistration.objects.get(pk=request.POST["registration_id"])
                nonemployeeTrainingRecord, = NonemployeeTrainingRecord.objects.get_or_create( \
                    registration=registration, training=training)
                nonemployeeTrainingRecord.attend_date = datetime.date.today()
                nonemployeeTrainingRecord.admin = request.user
                nonemployeeTrainingRecord.save()

            return HttpResponse("OK")
        #except:
        #    return HttpResponse("Error")
    else: 
        employee_list = []
        nonemployee_list = []
        if group.is_employee_group:
            employee_list =  get_employees_by_group(group)
            for employee in employee_list:
                print employee
                if EmployeeTrainingRecord.objects.filter(employee=employee, training=training).count():
                    print "done"
                    employee.training_done = True
                else:
                    print "not done"
                    employee.training_done = False
        else:
            nonemployee_list = get_nonemployees_by_group(group)
            nonemployee_dict = {}
            for nonemployee in nonemployee_list:
                identity = nonemployee.identity
                if nonemployee_dict.has_key(identity):
                    item = nonemployee_dict[identity]
                    if item.entrance_time > nonemployee.entrance_time:
                        nonemployee_dict[identity] = nonemployee
                else:
                    nonemployee_dict[identity] = nonemployee
            nonemployee_list = nonemployee_dict.values()
            for nonemployee in nonemployee_list:
                if NonemployeeTrainingRecord.objects.filter(registration=nonemployee, training=training).count():
                    nonemployee.training_done = True
                else:
                    nonemployee.training_done = False

        return render_to_response("etraining/admin/training_signup.html", {
            "training": training,
            "group": group,
            "employee_list": employee_list,
            "nonemployee_list": nonemployee_list,
        }, context_instance=RequestContext(request))

@login_required
def attend_training(request, training_id):
    training = Training.objects.get(pk=training_id)
    return render_to_response("etraining/admin/training_attend.html", {
        "training": training,
        "audio_clip": training.document.audio_clip,
    }, context_instance=RequestContext(request))

@login_required
def schedule_new_employee_training(request):
    if request.method == "POST":
        name = request.POST["training_name"]
        description = request.POST["training_description"]
        training_type = request.POST["training_type"]
        credits = int(request.POST["credits"])
        pass_criteria = int(request.POST["pass_criteria"])
        question_count = int(request.POST["question_count"])
        exam_type_id = int(request.POST["exam_type"])
        document = Document.objects.get(pk=int(request.POST["document_id"]))

        training = Training(name=name, description=description, training_type=training_type, \
                credits=credits, pass_criteria=pass_criteria, question_count=question_count)
        training.exam_type = QuestionType.objects.get(pk=exam_type_id)
        training.training_date = datetime.date.today() 
        training.document = document
        training.save()

        if request.POST.has_key('group') and request.POST['group']:
            if request.POST.has_key('sub_group') and request.POST['sub_group']:
                group = Group.employee_groups.get(pk=int(request.POST['sub_group']))
            else:
                group = Group.employee_groups.get(pk=int(request.POST['group']))
        else:
            group = Group.employee_groups.root_group()

        if group:
            if training_type == u"班组培训":
                group.banzu_training = training
            elif training_type == u"车间培训":
                group.chejian_training = training
            elif training_type == u"厂级培训":
                group.factory_training = training
            group.save()

        return render_to_response("etraining/admin/schedule_new_employee_training_result.html", {
        }, context_instance=RequestContext(request))
    else:
        documents = Document.objects.all()
        question_types = QuestionType.objects.all()
        root_group = Group.employee_groups.root_group()
        groups = Group.employee_groups.groups()
        sub_groups = Group.employee_groups.subgroups()
        return render_to_response("etraining/admin/schedule_new_employee_training.html", {
            "documents": documents,
            'root_group': root_group,
            "groups": groups,
            "sub_groups": sub_groups,
            "exam_types": question_types,
        }, context_instance=RequestContext(request))

@login_required
def schedule_employee_regular_training(request):
    if request.method == "POST":
        name = request.POST["training_name"]
        description = request.POST["training_description"]
        credits = int(request.POST["credits"])
        pass_criteria = int(request.POST["pass_criteria"])
        question_count = int(request.POST["question_count"])
        exam_type_id = int(request.POST["exam_type"])
        document = Document.objects.get(pk=int(request.POST["document_id"]))

        training = Training(name=name, description=description, training_type=u"日常培训", \
                credits=credits, pass_criteria=pass_criteria, question_count=question_count)
        training.exam_type = QuestionType.objects.get(pk=exam_type_id)
        training.training_date = datetime.date.today() 
        training.document = document
        training.save()

        if request.POST.has_key('group') and request.POST['group']:
            if request.POST.has_key('sub_group') and request.POST['sub_group']:
                group = Group.employee_groups.get(pk=int(request.POST['sub_group']))
            else:
                group = Group.employee_groups.get(pk=int(request.POST['group']))
        else:
            group = Group.employee_groups.root_group()

        if group:
            group.trainings.add(training)
            group.save()

        return render_to_response("etraining/admin/schedule_employee_regular_training_result.html", {
        }, context_instance=RequestContext(request))
    else:
        documents = Document.objects.all()
        question_types = QuestionType.objects.all()
        root_group = Group.employee_groups.root_group()
        groups = Group.employee_groups.groups()
        sub_groups = Group.employee_groups.subgroups()
        return render_to_response("etraining/admin/schedule_employee_regular_training.html", {
            "documents": documents,
            "root_group": root_group,
            "groups": groups,
            "sub_groups": sub_groups,
            "exam_types": question_types,
        }, context_instance=RequestContext(request))

@login_required
def schedule_vendor_training(request):
    if request.method == "POST":
        name = request.POST["training_name"]
        description = request.POST["training_description"]
        project = request.POST["vendor_project"]
        pass_criteria = int(request.POST["pass_criteria"])
        question_count = int(request.POST["question_count"])
        exam_type_id = int(request.POST["exam_type"])
        document = Document.objects.get(pk=int(request.POST["document_id"]))

        training = Training(name=name, description=description, training_type=u"承包商上岗培训", \
            project=project, pass_criteria=pass_criteria, question_count=question_count)
        training.exam_type = QuestionType.objects.get(pk=exam_type_id)
        training.training_date = datetime.date.today() 
        training.document = document
        training.save()

        if request.POST.has_key('group') and request.POST['group']:
            if request.POST.has_key('sub_group') and request.POST['sub_group']:
                group = Group.nonemployee_groups.get(pk=int(request.POST['sub_group']))
            else:
                group = Group.nonemployee_groups.get(pk=int(request.POST['group']))
        else:
            group = Group.nonemployee_groups.root_group()

        if group:
            group.trainings.add(training)
            group.save()

        return render_to_response("etraining/admin/schedule_vendor_training_result.html", {
        }, context_instance=RequestContext(request))
    else:
        documents = Document.objects.all()
        question_types = QuestionType.objects.all()
        sub_groups = Group.nonemployee_groups.vendorgroups()
        return render_to_response("etraining/admin/schedule_vendor_training.html", {
            "documents": documents,
            "sub_groups": sub_groups,
            "exam_types": question_types,
        }, context_instance=RequestContext(request))

@login_required
def schedule_visitor_training(request):
    if request.method == "POST":
        name = request.POST["training_name"]
        description = request.POST["training_description"]
        document = Document.objects.get(pk=int(request.POST["document_id"]))

        training = Training(name=name, description=description, training_type=u"告知培训")
        training.document = document
        training.save()

        if request.POST.has_key('group') and request.POST['group']:
            if request.POST.has_key('sub_group') and request.POST['sub_group']:
                group = Group.nonemployee_groups.get(pk=int(request.POST['sub_group']))
            else:
                group = Group.nonemployee_groups.get(pk=int(request.POST['group']))
        else:
            group = Group.nonemployee_groups.root_group()

        if group:
            group.entrance_training = training
            group.save()

        return render_to_response("etraining/admin/schedule_visitor_training_result.html", {}, context_instance=RequestContext(request))
    else:
        documents = Document.objects.all()
        root_group = Group.nonemployee_groups.root_group()
        groups = Group.nonemployee_groups.groups()
        sub_groups = Group.nonemployee_groups.subgroups()
        return render_to_response("etraining/admin/schedule_visitor_training.html", {
            "documents": documents,
            "root_group": root_group,
            "groups": groups,
            "sub_groups": sub_groups,
        }, context_instance=RequestContext(request))

@login_required
def view_employee_training_list(request):
    groups = Group.employee_groups.all()
    return render_to_response("etraining/admin/view_employee_training_list.html", {
        'groups': groups,
    }, context_instance=RequestContext(request))

@login_required
def view_vendor_training_list(request):
    groups = Group.nonemployee_groups.all()
    return render_to_response("etraining/admin/view_vendor_training_list.html", {
        'groups': groups,
    }, context_instance=RequestContext(request))

@login_required
def view_training_signup(request, group_id, training_id):
    group = Group.objects.get(pk=group_id)
    training = Training.objects.get(pk=training_id)

    employee_list = []
    nonemployee_list = []
    if group.is_employee_group:
        employee_list = get_employees_by_group(group)
        for employee in employee_list:
            try:
                record = EmployeeTrainingRecord.objects.get(employee=employee, training=training)
            except:
                record = None

            if not record:
                employee.status = 0
            elif not record.score or record.score < training.pass_criteria:
                employee.status = 1
            else:
                employee.status = 2
    else:
        nonemployee_list = get_nonemployees_by_group(group)
        nonemployee_dict = {}
        for nonemployee in nonemployee_list:
            identity = nonemployee.identity
            if nonemployee_dict.has_key(identity):
                item = nonemployee_dict[identity]
                if item.entrance_time > nonemployee.entrance_time:
                    nonemployee_dict[identity] = nonemployee
            else:
                nonemployee_dict[identity] = nonemployee
        nonemployee_list = nonemployee_dict.values()
        for nonemployee in nonemployee_list:
            try:
                record = NonemployeeTrainingRecord.objects.get(registration=nonemployee, training=training)
            except:
                record = None

            if not record:
                nonemployee.status = 0
            elif not record.score or record.score < training.pass_criteria:
                nonemployee.status = 1
            else:
                nonemployee.status = 2
    return render_to_response("etraining/admin/view_training_signup.html", {
        "training": training,
        "group": group,
        "employee_list": employee_list,
        "nonemployee_list": nonemployee_list,
    }, context_instance=RequestContext(request))

@login_required
def view_new_employee_training(request):
    employee_trainings = EmployeeTrainingRecord.newemployee_trainings.all()
    return render_to_response("etraining/admin/view_new_employee_training.html", {
        "employee_training_list": employee_trainings,
    }, context_instance=RequestContext(request))

@login_required
def view_regular_employee_training(request):
    employee_trainings = EmployeeTrainingRecord.regular_trainings.all()
    return render_to_response("etraining/admin/view_regular_employee_training.html", {
        "employee_training_list": employee_trainings,
    }, context_instance=RequestContext(request))

@login_required
def view_vendor_training(request):
    vendor_trainings = NonemployeeTrainingRecord.vendor_trainings.all()
    return render_to_response("etraining/admin/view_vendor_training.html", {
        "vendor_training_list": vendor_trainings,
    }, context_instance=RequestContext(request))

@login_required
def view_vendor_entrance(request):
    visitor_entrances = NonemployeeRegistration.vendors.all()
    return render_to_response("etraining/admin/view_vendor_entrance.html", {
        "visitor_entrance_list": visitor_entrances,
    }, context_instance=RequestContext(request))

@login_required
def view_visitor_entrance(request):
    visitor_entrances = NonemployeeRegistration.visitors.all()
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
        if request.POST.has_key("question_type"):
            question_type = request.POST["question_type"]
            questions = Question.objects.filter(question_type__pk=int(question_type))
            for question in questions:
                choices = question.choice_set.all()
                try:
                    question.choice_1 = choices[0].text
                    if choices[0].is_answer:
                        question.answer = 'A'
                except:
                    question.choice_1 = ""
                try:
                    question.choice_2 = choices[1].text
                    if choices[1].is_answer:
                        question.answer = 'B'
                except:
                    question.choice_2 = ""
                try:
                    question.choice_3 = choices[2].text
                    if choices[2].is_answer:
                        question.answer = 'C'
                except:
                    question.choice_3 = ""
                try:
                    question.choice_4 = choices[3].text
                    if choices[3].is_answer:
                        question.answer = 'D'
                except:
                    question.choice_4 = ""
        return render_to_response("etraining/admin/manage_question_poll.html", {
            'question_list': questions,
            'select_type': int(question_type),
            'question_type_list': question_type_list,
        }, context_instance=RequestContext(request))
    else:
        return render_to_response("etraining/admin/manage_question_poll.html", {
            'question_type_list': question_type_list,
            'init_page': True,
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
        return _("Error to add question")
  
    question_content = request.POST["question_content"]
    question_type = request.POST["question_type"]
    choice_1 = request.POST["choice_1"]
    choice_2 = request.POST["choice_2"]
    choice_3 = request.POST["choice_3"]
    choice_4 = request.POST["choice_4"]
    answer = request.POST["answer"]

    question = Question(content=question_content, question_type=QuestionType.objects.get(pk=question_type))
    question.save()

    choice = Choice(text=choice_1, question=question)
    if answer == 1:
        choice.is_answer = True
    else:
        choice.is_answer = False
    choice.save()

    choice = Choice(text=choice_2, question=question)
    if answer == 2:
        choice.is_answer = True
    else:
        choice.is_answer = False
    choice.save()

    choice = Choice(text=choice_3, question=question)
    if answer == 3:
        choice.is_answer = True
    else:
        choice.is_answer = False
    choice.save()

    choice = Choice(text=choice_4, question=question)
    if answer == 4:
        choice.is_answer = True
    else:
        choice.is_answer = False
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
            choice.is_answer = False
            choice.save()
        try:
            choices[int(value)-1].is_answer = True
            choices[int(value)-1].save()
        except:
            return HttpResponse("", content_type="text/plain")
    return HttpResponse(value, content_type="text/plain")

@login_required
def delete_question(request):
    if request.method != "POST":
        return _("Error to delete question")

    question = Question.objects.get(pk=request.POST["id"])
    question.delete()
    return HttpResponse("", content_type="text/plain")
