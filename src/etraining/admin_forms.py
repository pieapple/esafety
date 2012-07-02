from django import forms
from etraining.models import Employee, NonemployeeRegistration

class VisitorRegistrationForm(forms.ModelForm):
  class Meta:
    model = NonemployeeRegistration
    fields = ('identity', 'name', 'sex', 'edu', 'major', 'duty', 'org', 'home_address', 'phone_number', 'group', 'certid', 'reason') 

class EmployeeRegistrationForm(forms.ModelForm):
  class Meta:
    model = Employee
    fields = ('identity', 'name', 'sex', 'edu', 'major', 'home_address', 'phone_number', 'employee_group') 
