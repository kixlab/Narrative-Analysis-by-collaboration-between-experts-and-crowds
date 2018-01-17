from django import forms

class Step1Form(forms.Form):
    Task_id = forms.CharField()
    Turker_id = forms.CharField()
    border_input = forms.CharField()
    non_border_input = forms.CharField()
    quiz = forms.CharField()
    beginning_id = forms.IntegerField()
    ending_id = forms.IntegerField()
    refer_paragraph_id = forms.IntegerField()
    summary = forms.CharField()


class Feedback1Form(forms.Form):
    Turker_id = forms.CharField()
    step1feedback = forms.CharField()
    understandability = forms.CharField()
    helpfulness = forms.CharField()

class Step2Form(forms.Form):
    Turker_id = forms.CharField()
    previous_num = forms.IntegerField()
    next_num = forms.IntegerField()
    confidence = forms.IntegerField()
    summary_id = forms.IntegerField()
    Task_id = forms.CharField()
    pts_id = forms.IntegerField()
