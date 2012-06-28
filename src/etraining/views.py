from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response, get_object_or_404, get_list_or_404
from django.utils.translation import ugettext as _
from django.template import RequestContext
import datetime
from django.utils.timezone import utc

def search_person(request):
    return render_to_response("etraining/search_person.html",
            {},
            context_instance=RequestContext(request))
# Create your views here.
