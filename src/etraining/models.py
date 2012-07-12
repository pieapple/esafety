# coding: utf-8
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import pre_save
from django.dispatch import receiver
import sys, datetime, pyekho

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
    chejian_training = models.ForeignKey("EmployeeTrainingRecordTraining", blank=True, \
                                        null=True, related_name="chejian_attendee")
    banzu_training = models.ForeignKey("EmployeeTrainingRecord", blank=True, null=True, \
                                        related_name="banzu_attendee")

    trainings = models.ManyToManyField("Training", blank=True, null=True, through="EmployeeTrainingRecord")

    def __unicode__(self):
        return self.name

class BanzuTrainingManager(models.Manager):
    def get_query_set(self):
        return super(BanzuTrainingManager, self).get_query_set() \
            .filter(training__training_type=u"班组培训")

class ChejianTrainingManager(models.Manager):
    def get_query_set(self):
        return super(ChejianTrainingManager, self).get_query_set() \
            .filter(training__training_type=u"车间培训")

class FactoryManager(models.Manager):
    def get_query_set(self):
        return super(FactoryManager, self).get_query_set() \
            .filter(training__training_type=u"厂级培训")

class EmployeeTrainingRecord(models.Model):
    training = models.ForeignKey("Training")
    employee = models.ForeignKey("Employee")

    objects = models.Manager()
    banzu_trainings = BanzuTrainingManager()
    chejian_trainings = ChejianTrainingManager()
    factory_trainings = FactoryManager()

    attend_date = models.DateField(blank=True, null=True)
    score = models.IntegerField(blank=True, null=True)
    admin = models.ForeignKey(User, blank=True, null=True)

    def __unicode__(self):
        return self.training+'|'+self.employee

class EmployeeGroupManager(models.Manager):
    def get_query_set(self):
        return super(EmployeeGroupManager, self).get_query_set() \
            .filter(is_employee_group=True)

class NonemployeeGroupManager(models.Manager):
    def get_query_set(self):
        return super(NonemployeeGroupManager, self).get_query_set() \
            .filter(is_employee_group=False)

class Group(models.Model):
    name = models.CharField(max_length=255)
    parent_group = models.ForeignKey("self", blank=True, null=True)
    is_employee_group = models.BooleanField() 

    objects = models.Manager()
    employee_groups = EmployeeGroupManager()
    nonemployee_groups = NonemployeeManager()

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

    entrance_training = models.ForeignKey("EntranceTrainingRecord", blank=True, null=True)
    trainings = models.ManyToManyField("Training", blank=True, null=True, through="NonemployeeTrainingRecord")

    def __unicode__(self):
        return self.identity

class NonemployeeTrainingRecord(models.Model):
    training = models.ForeignKey("Training")
    registration = models.ForeignKey("NonemployeeRegistration")
    attend_date = models.DateField(blank=True, null=True)
    score = models.IntegerField(blank=True, null=True)
    admin = models.ForeignKey(User, blank=True, null=True)

    def __unicode__(self):
        return self.training+'|'+self.registration

class EntranceTrainingRecord(models.Model):
    training = models.ForeignKey("Training")
    attend_date = models.DateField(blank=True, null=True)
    admin = models.ForeignKey(User, blank=True, null=True)

    def __unicode__(self):
        return self.training

@receiver(pre_save, sender=Document)
def convert_to_mp3(sender, **kwargs):
    if sys.getdefaultencoding() != 'utf8':
        reload(sys)
    sys.setdefaultencoding('utf8')
    instance = kwargs['instance']
    if instance:
        path = "audio/" + str(datetime.datetime.now()) + ".ogg"
        pyekho.saveOgg(unicode(instance.name + "\n" + instance.text), settings.MEDIA_ROOT + path)
        instance.audio_clip = settings.MEDIA_URL + path
