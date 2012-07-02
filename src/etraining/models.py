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
        return self.text + ', is_answer: ' + self.is_answer

class Document(models.Model):
    text = models.TextField()
    audio_clip = models.CharField(max_length=255)

class Training(models.Model):
    name = models.CharField(max_length=255)
    training_type = models.CharField(max_length=255)
    exam_type = models.ForeignKey("QuestionType")
    pass_criteria = models.IntegerField()
    question_count = models.IntegerField()
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
    admin = models.ForeignKey(User)
    employee_group = models.ForeignKey("Group")
    trainings = models.ManyToManyField("Training", through="EmployeeTraining")

    def __unicode__(self):
        return self.name

class EmployeeTraining(models.Model):
    training = models.ForeignKey("Training")
    employee = models.ForeignKey("Employee")
    attend_date = models.DateField()
    training_date = models.DateField()
    score = models.IntegerField()
    admin = models.ForeignKey(User)

    def __unicode__(self):
        return self.training+'|'+self.employee

class Group(models.Model):
    name = models.CharField(max_length=255)
    parentgroup = models.ForeignKey("Group")
    is_employee_group = models.BooleanField()
    trainings = models.ManyToManyField("Training")

    def __unicode__(self):
        return self.name

class NonemployeeRegistration(models.Model):
    group = models.ForeignKey("Group")
    identity = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    sex = models.BooleanField()
    edu = models.CharField(max_length=255)
    major = models.CharField(max_length=255)
    duty = models.CharField(max_length=255)
    org = models.CharField(max_length=255)
    home_address = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=255)
    certid = models.CharField(max_length=255)
    reason = models.TextField()
    entrance_time = models.DateTimeField()
    entrance_training = models.ForeignKey("Training", related_name="entrance_training") 
    trainings = models.ManyToManyField("Training", related_name="trainings", through="NonemployeeTraining")

    def __unicode__(self):
        return self.identity

class NonemployeeTraining(models.Model):
    training = models.ForeignKey("Training")
    registration = models.ForeignKey("NonemployeeRegistration")
    attend_date = models.DateField()
    training_date = models.DateField()
    score = models.IntegerField()
    admin = models.ForeignKey(User)

    def __unicode__(self):
        return self.training+'|'+self.registration
