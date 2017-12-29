from django import forms

class Step1Form(forms.Form):
    Turker_id = forms.CharField()
    is_split = forms.BooleanField(required = False)
    is_split_confidence = forms.IntegerField()
    sentence_for_A = forms.IntegerField()
    sentence_for_A_confidence = forms.IntegerField()
    sentence_for_B = forms.IntegerField()
    sentence_for_B_confidence = forms.IntegerField()
    paragraph_id = forms.IntegerField()
    begin1 = forms.IntegerField()
    end1 = forms.IntegerField()
    begin2_A = forms.IntegerField()
    end2_A = forms.IntegerField()
    begin2_B = forms.IntegerField()
    end2_B = forms.IntegerField()

class Feedback1Form(forms.Form):
    Turker_id = forms.CharField()
    step1feedback = forms.CharField()
