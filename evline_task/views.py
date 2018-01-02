from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.contrib import messages
from django.contrib.messages import get_messages
from .models import Novel, Summary_Sentence, Paragraph, Step1_Task_A, Step1_Task_B, Feedback_Step1, Chunk, Step2_Task, Feedback_Step2, TaskMarker_Step1
from .database_manage import Novel_Data_Gen, Pick_Step1_task, Step1_Aggregate, Pick_Step2_task, temporary_for_data_exploration, TaskMarker_Step2
from .forms import Step1Form, Feedback1Form, Step2Form
import json
# Create your views here.

def step1(request, novel_id):
    print(temporary_for_data_exploration())
    novel = Novel.objects.get(title = novel_id)
    if request.method=='POST':
        step1form = Step1Form(request.POST)
        if step1form.is_valid():
            Turker_id = step1form.cleaned_data['Turker_id']
            paragraph = Paragraph.objects.get(novel=novel, paragraph_id = step1form.cleaned_data['paragraph_id'])
            paragraph_n = Paragraph.objects.get(novel=novel, paragraph_id = step1form.cleaned_data['paragraph_id']+1)
            sen1 = Summary_Sentence.objects.get(novel=novel, summary_id = step1form.cleaned_data['sentence_for_A'])
            sen2 = Summary_Sentence.objects.get(novel=novel, summary_id = step1form.cleaned_data['sentence_for_B'])
            TaskA = Step1_Task_A(Turker_id = Turker_id, refer_paragraph = paragraph, is_separate = step1form.cleaned_data['is_split'], confidence = step1form.cleaned_data['is_split_confidence'], novel = novel, context_begin_paragraph = step1form.cleaned_data['begin1'], context_end_paragraph = step1form.cleaned_data['end1'])
            TaskB_1 = Step1_Task_B(Turker_id = Turker_id, refer_paragraph = paragraph, sentence = sen1, confidence = step1form.cleaned_data['sentence_for_A_confidence'], novel = novel, context_begin_paragraph = step1form.cleaned_data['begin2_A'], context_end_paragraph = step1form.cleaned_data['end2_A'])
            TaskB_2 = Step1_Task_B(Turker_id = Turker_id, refer_paragraph = paragraph_n, sentence = sen2, confidence = step1form.cleaned_data['sentence_for_B_confidence'], novel = novel, context_begin_paragraph = step1form.cleaned_data['begin2_B'], context_end_paragraph = step1form.cleaned_data['end2_B'])
            TaskA.save()
            TaskB_1.save()
            TaskB_2.save()
            filtered_marker = TaskMarker_Step1.objects.filter(novel = novel, Task_id = step1form.cleaned_data['Task_id'])
            if filtered_marker.count()>0:
                taskmarker = filtered_marker[0]
                taskmarker.Done=True
                taskmarker.Turker_id = Turker_id
                taskmarker.save()
            else:
                taskmarker = TaskMarker_Step1(novel = novel, Turker_id = Turker_id, Task_id = step1form.cleaned_data['Task_id'], Done=True, Start_Time = datetime.datetime.now(), Task_Paragraph = paragraph)
                taskmarker.save()
            messages.add_message(request, messages.INFO, Turker_id)
            return HttpResponseRedirect('/evline_task/feedback_step1/')

    if Paragraph.objects.filter(novel=novel).count()==0:
        Novel_Data_Gen(novel_id)
    returned_data = Pick_Step1_task(novel_id)
    paragraph_id = returned_data['paragraph_id']
    Task_id = returned_data['Task_id']
    total_paragraphs = list(Paragraph.objects.filter(novel=novel).values('paragraph_string'))
    #print(total_paragraphs)
    paragraphs = Paragraph.objects.filter(novel = novel, paragraph_id__in = range(paragraph_id-4,  paragraph_id+6))
    summary_sentences = Summary_Sentence.objects.filter(novel=novel)
    texts = {
        'total_paragraphs' : total_paragraphs,
        'paragraphs' : paragraphs,
        'range' : range(paragraph_id-4,paragraph_id+6),
        'center_paragraph_id' : paragraph_id,
        'next_paragraph_id' : paragraph_id+1,
        'summary_sentences' : summary_sentences,
        'Task_id' : Task_id,
    }
    return render(request, 'evline_task/step1.html', texts)

def step1_aggregate(request, passwd, novel_id):
    result = Step1_Aggregate(novel_id)
    if passwd =='N1kixlab':
        if result == False:
            return HttpResponse("not sufficient data. Crowdsource more")
        else:
            return HttpResponse("Aggregation complete")
    else:
        return HttpResponse("Password not correct")

def step2(request,novel_id):
    novel = Novel.objects.get(title = novel_id)
    if request.method=='POST':
        step2form = Step2Form(request.POST)
        if step2form.is_valid():
            Turker_id = step2form.cleaned_data['Turker_id']
            previous_num = step2form.cleaned_data['previous_num']
            next_num = step2form.cleaned_data['next_num']
            confidence = step2form.cleaned_data['confidence']
            summary_id = step2form.cleaned_data['summary_id']
            sentence = Summary_Sentence.objects.get(novel = novel, summary_id = summary_id)
            prev_chunk = Chunk.objects.get(novel = novel, chunk_id = previous_num)
            next_chunk = Chunk.objects.get(novel = novel, chunk_id = next_num)
            step2task = Step2_Task(Turker_id=Turker_id, novel = novel, prev_chunk = prev_chunk, next_chunk = next_chunk, confidence = confidence, sentence = sentence)
            step2task.save()
            filtered_marker = TaskMarker_Step2.objects.filter(novel = novel, Task_id2 = step2form.cleaned_data['Task_id'])
            if filtered_marker.count()>0:
                taskmarker = filtered_marker[0]
                taskmarker.Done=True
                taskmarker.Turker_id = Turker_id
                taskmarker.save()
            else:
                taskmarker = TaskMarker_Step1(novel = novel, Turker_id = Turker_id, Task_id2 = step2form.cleaned_data['Task_id'], Done=True, Start_Time = datetime.datetime.now(), marked_task = Possible_Tasks_Step2.objects.get(novel=novel, pts_id=step2form.cleaned_data['pts_id']))
                taskmarker.save()
            messages.add_message(request, messages.INFO, Turker_id)
            return HttpResponseRedirect('/evline_task/feedback_step2/')
    #TODO make work distributor
    returned_data = Pick_Step2_task(novel_id)
    summary_sentences = Summary_Sentence.objects.filter(novel = novel)
    chunk1 = returned_data['chunk1']
    chunk1_set = Paragraph.objects.filter(novel=novel, paragraph_id__in = range(chunk1.begin_paragraph, chunk1.end_paragraph+1))
    chunk2 = returned_data['chunk2']
    chunk2_set = Paragraph.objects.filter(novel=novel, paragraph_id__in = range(chunk2.begin_paragraph, chunk2.end_paragraph+1))
    summary_sentence = chunk1.summary_sentence
    texts={
        'summary_sentences' : summary_sentences,
        'summary_sentence' : summary_sentence,
        'chunk1_id' : chunk1.chunk_id,
        'chunk2_id' : chunk2.chunk_id,
        'chunk1_set' : chunk1_set,
        'chunk2_set' : chunk2_set,
        'Task_id' : returned_data['Task_id'],
        'pts_id' : returned_data['pts_id'],
    }
    return render(request, 'evline_task/step2.html', texts)

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

def feedback_step2(request):
    if request.method=="POST":
        feedback1form = Feedback1Form(request.POST)
        if feedback1form.is_valid():
            Turker_id = feedback1form.cleaned_data['Turker_id']
            feedback = feedback1form.cleaned_data['step1feedback']
            feedbackmodel = Feedback_Step2(feedback = feedback, Turker_id = Turker_id)
            feedbackmodel.save()
            return HttpResponseRedirect('/evline_task/end/'+Turker_id)
    storage = get_messages(request)
    for message in storage:
        turker_id = message
        break
    print(turker_id)
    return render(request, 'evline_task/feedback.html', {'Turker_id': turker_id})
