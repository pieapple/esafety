# coding: utf-8
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import pre_save
from django.dispatch import receiver
import sys, time, pyekho, os

class IsConfirmAvailable(models.Model):
    registration = models.IntegerField()

class QuestionType(models.Model):
    name = models.CharField(max_length=255)

    def __unicode__(self):
        return self.name

class Question(models.Model):
    content = models.TextField()
    question_type = models.ForeignKey("QuestionType")

    def __unicode__(self):
        return self.content

class Choice(models.Model):
    text = models.TextField()
    is_answer = models.BooleanField()
    question = models.ForeignKey("Question")

    def __unicode__(self):
        return self.text + ', is_answer: ' + str(self.is_answer)

class Document(models.Model):
    name = models.CharField(max_length=255)
    text = models.TextField()
    audio_clip = models.CharField(max_length=255, blank=True, null=True)
    audio_file = models.CharField(max_length=255, blank=True, null=True)

class Training(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    credits = models.IntegerField(blank=True, null=True)
    training_type = models.CharField(max_length=255, blank=True, null=True)
    exam_type = models.ForeignKey("QuestionType", blank=True, null=True)
    pass_criteria = models.IntegerField(blank=True, null=True)
    question_count = models.IntegerField(blank=True, null=True)
    training_date = models.DateField(blank=True, null=True)
    project = models.CharField(max_length=255, blank=True, null=True)
    document = models.ForeignKey("Document")

    def __unicode__(self):
        return self.name

class EmployeeGroupManager(models.Manager):
    def get_query_set(self):
        return super(EmployeeGroupManager, self).get_query_set() \
            .filter(is_employee_group=True)
    
    def root_group(self):
        return self.get_query_set().get(name=u"所有员工")

    def groups(self):
        root_group = self.root_group()
        return self.get_query_set().filter(parent_group=root_group)

    def subgroups(self):
        subgroups = []
        groups = self.groups() 
        for group in groups:
            subgroups.extend(self.get_query_set().filter(parent_group=group))
        return subgroups

class NonemployeeGroupManager(models.Manager):
    def get_query_set(self):
        return super(NonemployeeGroupManager, self).get_query_set() \
            .filter(is_employee_group=False)
    
    def root_group(self):
        return self.get_query_set().get(name=u"所有外来人员")

    def groups(self):
        root_group = self.root_group()
        return self.get_query_set().filter(parent_group=root_group)

    def subgroups(self):
        subgroups = []
        groups = self.groups() 
        for group in groups:
            subgroups.extend(self.get_query_set().filter(parent_group=group))
        return subgroups

    def vendorgroups(self):
        vendorgroups = []
        groups = self.filter(name=u"承包商") 
        for group in groups:
            vendorgroups.extend(self.get_query_set().filter(parent_group=group))
        return vendorgroups

class Group(models.Model):
    name = models.CharField(max_length=255)
    parent_group = models.ForeignKey("self", blank=True, null=True, related_name="child_groups")
    is_employee_group = models.BooleanField() 

    objects = models.Manager()
    employee_groups = EmployeeGroupManager()
    nonemployee_groups = NonemployeeGroupManager()

    # nonemployee training
    entrance_training = models.ForeignKey("Training", blank=True, null=True, related_name="entrance_attendees")

    # employee specific training
    factory_training = models.ForeignKey("Training", blank=True, null=True, related_name="factory_attendees")
    chejian_training = models.ForeignKey("Training", blank=True, null=True, related_name="chejian_attendees")
    banzu_training = models.ForeignKey("Training", blank=True, null=True, related_name="banzu_attendees")

    # common trainings
    trainings = models.ManyToManyField("Training", blank=True, null=True)

    def __unicode__(self):
        return self.name

class Employee(models.Model):
    identity = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    sex = models.BooleanField()
    edu = models.CharField(max_length=255, blank=True, null=True)
    major = models.CharField(max_length=255, blank=True, null=True)
    duty = models.CharField(max_length=255, blank=True, null=True)
    home_address = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=255, blank=True, null=True)
    group = models.ForeignKey("Group")

    factory_training = models.ForeignKey("EmployeeTrainingRecord", blank=True, \
                                        null=True, related_name="factory_attendee")
    chejian_training = models.ForeignKey("EmployeeTrainingRecord", blank=True, \
                                        null=True, related_name="chejian_attendee")
    banzu_training = models.ForeignKey("EmployeeTrainingRecord", blank=True, null=True, \
                                        related_name="banzu_attendee")

    trainings = models.ManyToManyField("Training", blank=True, null=True, through="EmployeeTrainingRecord")

    def __unicode__(self):
        return self.name

class NewemployeeTrainingManager(models.Manager):
    def get_query_set(self):
        return super(NewemployeeTrainingManager, self).get_query_set() \
            .filter(training__training_type__in=[u"班组培训", u"厂级培训", u"车间培训"])

class RegularTrainingManager(models.Manager):
    def get_query_set(self):
        return super(RegularTrainingManager, self).get_query_set() \
            .filter(training__training_type=u"日常培训")

class EmployeeTrainingRecord(models.Model):
    training = models.ForeignKey("Training")
    employee = models.ForeignKey("Employee")

    signature = models.TextField(blank=True, null=True)
    attend_date = models.DateField(blank=True, null=True)
    score = models.IntegerField(blank=True, null=True)
    admin = models.ForeignKey(User, blank=True, null=True)
    exam_result = models.CharField(max_length=500, blank=True, null=True)

    objects = models.Manager()
    newemployee_trainings = NewemployeeTrainingManager()
    regular_trainings = RegularTrainingManager()

    def __unicode__(self):
        return self.training.name+'|'+self.employee.name

class VendorManager(models.Manager):
    def get_query_set(self):
        return super(VendorManager, self).get_query_set().filter(group__name=u"承包商")

class VisitorManager(models.Manager):
    def get_query_set(self):
        return super(VisitorManager, self).get_query_set().filter(group__name=u"访客")

class NonemployeeRegistration(models.Model):
    identity = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    sex = models.BooleanField()
    edu = models.CharField(max_length=255, blank=True, null=True)
    major = models.CharField(max_length=255, blank=True, null=True)
    duty = models.CharField(max_length=255, blank=True, null=True)
    org = models.CharField(max_length=255, blank=True, null=True)
    home_address = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=255, blank=True, null=True)
    certid = models.CharField(max_length=255, blank=True, null=True)
    reason = models.TextField()
    group = models.ForeignKey("Group")
    entrance_time = models.DateTimeField()
    admin = models.ForeignKey(User)

    entrance_training = models.ForeignKey("NonemployeeTrainingRecord", blank=True, null=True, related_name="entrance_attendee")
    trainings = models.ManyToManyField("Training", blank=True, null=True, through="NonemployeeTrainingRecord")

    objects = models.Manager()
    vendors = VendorManager()
    visitors = VisitorManager()

    def __unicode__(self):
        return self.identity

class VendorTrainingManager(models.Manager):
    def get_query_set(self):
        return super(VendorTrainingManager, self).get_query_set() \
            .filter(training__training_type=u"承包商培训")

class EntranceTrainingManager(models.Manager):
    def get_query_set(self):
        return super(EntranceTrainingManager, self).get_query_set() \
            .filter(training__training_type=u"告知培训")

class NonemployeeTrainingRecord(models.Model):
    training = models.ForeignKey("Training")
    registration = models.ForeignKey("NonemployeeRegistration")

    signature = models.TextField(blank=True, null=True)
    attend_date = models.DateField(blank=True, null=True)
    score = models.IntegerField(blank=True, null=True)
    admin = models.ForeignKey(User, blank=True, null=True)
    exam_result = models.CharField(max_length=500, blank=True, null=True)

    objects = models.Manager()
    entrance_trainings = EntranceTrainingManager()
    vendor_trainings = VendorTrainingManager()

    def __unicode__(self):
        return self.training+'|'+self.registration

@receiver(pre_save, sender=Document)
def convert_to_mp3(sender, **kwargs):
    if sys.getdefaultencoding() != 'utf8':
        reload(sys)
    sys.setdefaultencoding('utf8')
    instance = kwargs['instance']
    if instance:
        if instance.audio_file:
            try:
                os.remove(instance.audio_file)
            except:
                pass
        path = "audio/" + str(time.time()) + ".ogg"
        pyekho.saveOgg(unicode(instance.name + "\n" + instance.text), settings.MEDIA_ROOT + path)
        instance.audio_clip = settings.MEDIA_URL + path
        instance.audio_file = settings.MEDIA_ROOT + path
