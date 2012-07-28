# coding: utf-8
from django.http import HttpResponseServerError

class CopyrightMiddleware:
  def process_request(self, request):
    try:
      import _winreg
      _winreg.OpenKey(_winreg.HKEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\esafety")
    except:
      return HttpResponseServerError("服务器出错，请重新安装服务器程序!") 
    return None
