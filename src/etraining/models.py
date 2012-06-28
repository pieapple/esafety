from django.db import models

class QuestionType(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=135)
    class Meta:
        db_table = u'question_type'

class Question(models.Model):
    id = models.IntegerField(primary_key=True)
    content = models.TextField()
    type = models.ForeignKey(QuestionType, null=True, db_column='type', blank=True)
    class Meta:
        db_table = u'question'

class Choice(models.Model):
    id = models.IntegerField(primary_key=True)
    text = models.TextField()
    is_answer = models.BooleanField(blank=True) 
    question = models.ForeignKey(Question, null=True, db_column='question', blank=True)
    class Meta:
        db_table = u'choice'

class Training(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=3000)
    examtype = models.ForeignKey(QuestionType, null=True, db_column='examType', blank=True)
    passcriteria = models.IntegerField(null=True, db_column='passCriteria', blank=True)
    questioncount = models.IntegerField(null=True, db_column='questionCount', blank=True)
    class Meta:
        db_table = u'training'

class Document(models.Model):
    id = models.IntegerField(primary_key=True)
    text = models.TextField(blank=True)
    audioclip = models.CharField(max_length=3000, db_column='audioClip', blank=True)
    class Meta:
        db_table = u'document'

class Group(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=135, blank=True)
    parentgroups = models.CharField(max_length=3000, db_column='parentGroups', blank=True)
    class Meta:
        db_table = u'group'

class GroupTraining(models.Model):
    id = models.IntegerField(primary_key=True)
    group = models.ForeignKey(Group, null=True, db_column='group', blank=True)
    training = models.ForeignKey(Training, null=True, db_column='training', blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = u'group_training'

class Employee(models.Model):
    id = models.IntegerField(primary_key=True)
    identity = models.CharField(max_length=135, unique=True)
    name = models.CharField(max_length=135, blank=True)
    sex = models.BooleanField() 
    edu = models.CharField(max_length=135, blank=True)
    major = models.CharField(max_length=135, blank=True)
    duty = models.CharField(max_length=135, blank=True)
    homeaddress = models.CharField(max_length=3000, db_column='homeAddress', blank=True)
    isadmin = models.BooleanField(db_column='isAdmin') 
    employeegroup = models.ForeignKey(Group, null=True, db_column='employeeGroup', blank=True)
    class Meta:
        db_table = u'employee'

class EmployeeTraining(models.Model):
    id = models.IntegerField(primary_key=True)
    training = models.ForeignKey(Training, null=True, db_column='training', blank=True)
    employee = models.ForeignKey(Employee, null=True, db_column='employee', blank=True)
    attendtime = models.DateTimeField(null=True, db_column='attendTime', blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    score = models.IntegerField(null=True, blank=True)
    class Meta:
        db_table = u'employee_training'

class NonemployeeRegistration(models.Model):
    id = models.IntegerField(primary_key=True)
    group = models.ForeignKey(Group, null=True, db_column='group', blank=True)
    certid = models.CharField(max_length=135, db_column='certID', blank=True)
    identity = models.CharField(max_length=135, blank=True)
    name = models.CharField(max_length=135, blank=True)
    sex = models.BooleanField(blank=True)
    edu = models.CharField(max_length=135, blank=True)
    major = models.CharField(max_length=135, blank=True)
    duty = models.CharField(max_length=135, blank=True)
    org = models.CharField(max_length=135, blank=True)
    homeaddress = models.CharField(max_length=135, db_column='homeAddress', blank=True)
    reason = models.TextField()
    entrancetime = models.DateTimeField(db_column='entranceTime')
    entrancetraining = models.ForeignKey(Training, db_column='entranceTraining')
    class Meta:
        db_table = u'nonemployee_registration'

class NonemployeeTraining(models.Model):
    id = models.IntegerField(primary_key=True)
    training = models.ForeignKey(Training, null=True, db_column='training', blank=True)
    registration = models.ForeignKey(NonemployeeRegistration, null=True, db_column='registration', blank=True)
    attendtime = models.DateTimeField(null=True, db_column='attendTime', blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    score = models.IntegerField(null=True, blank=True)
    class Meta:
        db_table = u'nonemployee_training'

class TrainingDocument(models.Model):
    id = models.IntegerField(primary_key=True)
    training = models.ForeignKey(Training, null=True, db_column='training', blank=True)
    document = models.ForeignKey(Document, null=True, db_column='document', blank=True)
    class Meta:
        db_table = u'training_document'

