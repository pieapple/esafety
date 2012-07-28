# coding: utf-8
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse

def index(request):
    return HttpResponseRedirect(reverse("visitor_welcome"))

@login_required
def admin_index(request):
    if request.user.username.startswith(u"门卫"):
        return HttpResponseRedirect(reverse("visitor_entrance"))
    elif request.user.username.startswith(u"人事处"):
        return HttpResponseRedirect(reverse("employee_training_schedule_list"))
    elif request.user.username.startswith(u"主管"):
        return HttpResponseRedirect(reverse("view_employee_training_list"))
    else:
        return HttpResponse("不允许访问, 请注销重新登陆！<a href='/accounts/logout'>注销</a>")

def 
