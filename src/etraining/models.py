# coding: utf-8
from django.db import models
from django.contrib.auth.models import User

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
    audio_clip = models.CharField(max_length=255)

class Training(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    training_type = models.CharField(max_length=255, blank=True, null=True)
    exam_type = models.ForeignKey("QuestionType", blank=True, null=True)
    pass_criteria = models.IntegerField(blank=True, null=True)
    question_count = models.IntegerField(blank=True, null=True)
    documents = models.ManyToManyField("Document")

    def __unicode__(self):
        return self.name

class Employee(models.Model):
    identity = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    sex = models.BooleanField()
    edu = models.CharField(max_length=255)
    major = models.CharField(max_length=255)
    duty = models.CharField(max_length=255)
    home_address = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=255)
    group = models.ForeignKey("EmployeeGroup")
    trainings = models.ManyToManyField("Training", through="EmployeeTraining")

    def __unicode__(self):
        return self.name

class EmployeeTraining(models.Model):
    training = models.ForeignKey("Training")
    employee = models.ForeignKey("Employee")
    attend_date = models.DateField()
    score = models.IntegerField()
    admin = models.ForeignKey(User)

    def __unicode__(self):
        return self.training+'|'+self.employee

class EmployeeGroupTrainingSchedule(models.Model):
    training = models.ForeignKey("Training")
    employee_group = models.ForeignKey("EmployeeGroup")
    training_date = models.DateField()

class EmployeeGroup(models.Model):
    name = models.CharField(max_length=255)
    parent_group = models.ForeignKey("self", blank=True, null=True)
    trainings = models.ManyToManyField("Training", blank=True, null=True, through="EmployeeGroupTrainingSchedule")

    def __unicode__(self):
        return self.name

class NonemployeeRegistration(models.Model):
    identity = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    sex = models.BooleanField()
    edu = models.CharField(max_length=255)
    major = models.CharField(max_length=255, blank=True, null=True)
    duty = models.CharField(max_length=255, blank=True, null=True)
    org = models.CharField(max_length=255, blank=True, null=True)
    home_address = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=255, blank=True, null=True)
    certid = models.CharField(max_length=255, blank=True, null=True)
    reason = models.TextField()
    group = models.ForeignKey("NonemployeeGroup")
    entrance_time = models.DateTimeField()
    admin = models.ForeignKey(User)

    entrance_training = models.ForeignKey("EntranceTraining", blank=True, null=True)
    trainings = models.ManyToManyField("Training", blank=True, null=True, through="NonemployeeTraining")

    def __unicode__(self):
        return self.identity

class NonemployeeTraining(models.Model):
    training = models.ForeignKey("Training")
    registration = models.ForeignKey("NonemployeeRegistration")
    attend_date = models.DateField()
    score = models.IntegerField()
    admin = models.ForeignKey(User)

    def __unicode__(self):
        return self.training+'|'+self.registration

class EntranceTraining(models.Model):
    training = models.ForeignKey("Training")
    registration = models.ForeignKey("NonemployeeRegistration")
    attend_date = models.DateField()
    admin = models.ForeignKey(User)

    def __unicode__(self):
        return self.training+'|'+self.registration

class NonemployeeGroupTrainingSchedule(models.Model):
    training = models.ForeignKey("Training")
    nonemployee_group = models.ForeignKey("NonemployeeGroup")
    training_date = models.DateField()

class NonemployeeGroup(models.Model):
    name = models.CharField(max_length=255)
    parent_group = models.ForeignKey("self", blank=True, null=True)
    entrance_training = models.ForeignKey("Training", blank=True, null=True, related_name="entrance_attendee")
    trainings = models.ManyToManyField("Training", blank=True, null=True, related_name="training_attendee", through="NonemployeeGroupTrainingSchedule")
    def __unicode__(self):
        return self.name
