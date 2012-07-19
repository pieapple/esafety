# -*- coding: UTF-8 -*- 
"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".
#coding=utf-8 
Replace this with more appropriate tests for your application.
"""
from django.conf import settings
from django.test import TestCase
import sys, time, os, urllib2

class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        path = "audio/" + str(time.time()) + ".mp3"
        #pyekho.saveOgg(unicode(instance.name + "\n" + instance.text), settings.MEDIA_ROOT + path)
        f = file(settings.MEDIA_ROOT + path,"wb")
        src = u"安全" + "\n" + u"须知"
        #src= 'hello'+ u"须知"
        length = 150
        start = 0
        while start < len(src):
            text = src[start:length]
            data = googleTTS(text)
            f.write(data)
            start = start + length
        else:
            f.close()
        self.assertEqual(1 + 1, 2)
def googleTTS(text):
    url = u"http://translate.google.com/translate_tts?ie=UTF-8&tl=zh_CN&q="
    url = url + urllib2.quote(unicode(text).encode('utf-8'))
    req = urllib2.Request(url.encode('utf-8'))
    req.add_header("User-Agent", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; .NET CLR 1.0.3705; .NET CLR 1.1.4322; .NET CLR 1.2.30703)")
    res = urllib2.urlopen(req)
    html = res.read()
    res.close()
    return html