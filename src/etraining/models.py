# coding: utf-8
from django.db import models
from django.contrib.auth.models import User

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
    audio_clip = models.CharField(max_length=255)

class Training(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    training_type = models.CharField(max_length=255, blank=True, null=True)
    exam_type = models.ForeignKey("QuestionType", blank=True, null=True)
    pass_criteria = models.IntegerField(blank=True, null=True)
    question_count = models.IntegerField(blank=True, null=True)
    training_date = models.DateField(blank=True, null=True)
    documents = models.ManyToManyField("Document")

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
    trainings = models.ManyToManyField("Training", blank=True, null=True, through="EmployeeTrainingRecord")

    def __unicode__(self):
        return self.name

class EmployeeTrainingRecord(models.Model):
    training = models.ForeignKey("Training")
    employee = models.ForeignKey("Employee")
    attend_date = models.DateField(blank=True, null=True)
    score = models.IntegerField(blank=True, null=True)
    admin = models.ForeignKey(User, blank=True, null=True)

    def __unicode__(self):
        return self.training+'|'+self.employee

class Group(models.Model):
    name = models.CharField(max_length=255)
    parent_group = models.ForeignKey("self", blank=True, null=True)
    is_employee_group = models.BooleanField() 
    entrance_training = models.ForeignKey("Training", blank=True, null=True, related_name="entrance_attendee")
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
