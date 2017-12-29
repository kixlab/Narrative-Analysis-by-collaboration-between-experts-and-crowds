from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.contrib import messages
from django.contrib.messages import get_messages
from .models import Novel, Summary_Sentence, Paragraph, Step1_Task_A, Step1_Task_B, Feedback_Step1
from .database_manage import Novel_Data_Gen, Pick_Step1_task
from .forms import Step1Form, Feedback1Form
import json
# Create your views here.

def step1(request, novel_id):
    novel = Novel.objects.get(title = novel_id)
    if request.method=='POST':
        step1form = Step1Form(request.POST)
        if step1form.is_valid():
            Turker_id = step1form.cleaned_data['Turker_id']
            paragraph = Paragraph.objects.get(novel=novel, paragraph_id = step1form.cleaned_data['paragraph_id'])
            sen1 = Summary_Sentence.objects.get(novel=novel, summary_id = step1form.cleaned_data['sentence_for_A'])
            sen2 = Summary_Sentence.objects.get(novel=novel, summary_id = step1form.cleaned_data['sentence_for_B'])
            TaskA = Step1_Task_A(Turker_id = Turker_id, refer_paragraph = paragraph, is_separate = step1form.cleaned_data['is_split'], confidence = step1form.cleaned_data['is_split_confidence'], novel = novel, context_begin_paragraph = step1form.cleaned_data['begin1'], context_end_paragraph = step1form.cleaned_data['end1'])
            TaskB_1 = Step1_Task_B(Turker_id = Turker_id, refer_paragraph = paragraph, sentence = sen1, confidence = step1form.cleaned_data['sentence_for_A_confidence'], novel = novel, context_begin_paragraph = step1form.cleaned_data['begin2_A'], context_end_paragraph = step1form.cleaned_data['end2_A'])
            TaskB_2 = Step1_Task_B(Turker_id = Turker_id, refer_paragraph = paragraph, sentence = sen2, confidence = step1form.cleaned_data['sentence_for_B_confidence'], novel = novel, context_begin_paragraph = step1form.cleaned_data['begin2_B'], context_end_paragraph = step1form.cleaned_data['end2_B'])
            TaskA.save()
            TaskB_1.save()
            TaskB_2.save()
            messages.add_message(request, messages.INFO, Turker_id)
            return HttpResponseRedirect('/evline_task/feedback_step1/')
    #Novel_Data_Gen(novel_id)
    paragraph_id = Pick_Step1_task(novel_id)
    total_paragraphs = list(Paragraph.objects.filter(novel=novel).values('paragraph_string'))
    print(total_paragraphs)
    paragraphs = Paragraph.objects.filter(novel = novel, paragraph_id__in = range(paragraph_id-4,  paragraph_id+6))
    summary_sentences = Summary_Sentence.objects.filter(novel=novel)
    texts = {
        'total_paragraphs' : total_paragraphs,
        'paragraphs' : paragraphs,
        'range' : range(paragraph_id-4,paragraph_id+6),
        'center_paragraph_id' : paragraph_id,
        'next_paragraph_id' : paragraph_id+1,
        'summary_sentences' : summary_sentences,
    }
    return render(request, 'evline_task/step1.html', texts)

def step2(request):
    return HttpResponse()

def end(request, turker_id):
    context={
        'Turker_id': turker_id,
    }
    return render(request, 'evline_task/end.html', context)
def feedback_step1(request):
    if request.method=="POST":
        feedback1form = Feedback1Form(request.POST)
        if feedback1form.is_valid():
            Turker_id = feedback1form.cleaned_data['Turker_id']
            feedback = feedback1form.cleaned_data['step1feedback']
            feedbackmodel = Feedback_Step1(feedback = feedback, Turker_id = Turker_id)
            feedbackmodel.save()
            return HttpResponseRedirect('/evline_task/end/'+Turker_id)
    storage = get_messages(request)
    for message in storage:
        turker_id = message
        break
    print(turker_id)
    return render(request, 'evline_task/feedback.html', {'Turker_id': turker_id})
