from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, get_object_or_404, get_list_or_404
from django.template import RequestContext
from django.http import HttpResponse


def index(request):
    return render_to_response("index.html",
            {},
            context_instance=RequestContext(request))
