from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.contrib import messages
from django.contrib.messages import get_messages
from .models import *
from .database_manage import *#Novel_Data_Gen, Pick_Step1_task, Pick_Step2_task, temporary_for_data_exploration, TaskMarker_Step2
from .forms import Step1Form, Feedback1Form, Step2Form
import json
# Create your views here.

def step1_split_find(request, novel_id):
    novel = Novel.objects.get(title = novel_id)
    # when the form is submitted
    if request.method=='POST':
        # retrieve the form
        step1form = Step1Form(request.POST)
        if step1form.is_valid():
            # retrieve items in the form
            Turker_id = step1form.cleaned_data['Turker_id']
            Task_id = step1form.cleaned_data['Task_id']
            border_input = json.loads(step1form.cleaned_data['border_input'])
            non_border_input = step1form.cleaned_data['non_border_input']
            quiz = step1form.cleaned_data['quiz']
            beginning_id = step1form.cleaned_data['beginning_id']
            ending_id = step1form.cleaned_data['ending_id']
            refer_paragraph_id = step1form.cleaned_data['refer_paragraph_id']
            summary = step1form.cleaned_data['summary']
            quiz_right=(novel.quiz_answer == quiz)
            # store the information only when they got right on the question.
            if quiz_right:
                for key in border_input:
                    # get the paragraph object to refer to in the split data
                    para=Paragraph.objects.get(novel=novel, paragraph_id = key)
                    # save the data for split case
                    step1_split = Step1_Split(Turker_id = Turker_id,
                                        confidence = border_input[key]['confidence'],
                                        reasoning = border_input[key]['reasoning'],
                                        novel = novel,
                                        context_begin_paragraph = beginning_id,
                                        context_end_paragraph = ending_id,
                                        refer_paragraph = para,
                                        )
                    step1_split.save()
                # save the data for no split case
                refer_paragraph=Paragraph.objects.get(novel=novel, paragraph_id = refer_paragraph_id)
                if len(border_input) ==0 :
                    step1_no_split = Step1_No_Split(Turker_id = Turker_id,
                                        refer_paragraph = refer_paragraph,
                                        reasoning = non_border_input,
                                        novel = novel,
                                        context_begin_paragraph = beginning_id,
                                        context_end_paragraph = ending_id)
                    step1_no_split.save()
                summary = Step1_Summary(Turker_id = Turker_id,
                                        summary = summary,
                                        refer_paragraph = refer_paragraph,
                                        novel = novel,
                                        context_begin_paragraph = beginning_id,
                                        context_end_paragraph = ending_id)
                summary.save()
                # check the taskmarker as done
                filtered_marker, created = TaskMarker_Step1_split_find.objects.get_or_create(novel = novel, Task_id = step1form.cleaned_data['Task_id'], Task_Paragraph = refer_paragraph)
                filtered_marker.Done = True
                filtered_marker.Turker_id = Turker_id
                filtered_marker.save()
                messages.add_message(request, messages.INFO, Turker_id)
                return HttpResponseRedirect('/evline_task/feedback_step1/')
            else:
                # when crowd workers could not make the answer
                return HttpResponse("You could not make the answer")
        else:
            return HttpResponse("Not returned")
    if Paragraph.objects.filter(novel=novel).count()==0:
        Novel_Data_Gen(novel_id)
    returned_data = Pick_Step1_split_find_task(novel_id)
    paragraph_id = returned_data['paragraph_id']
    Task_id = returned_data['Task_id']
    total_paragraphs = list(Paragraph.objects.filter(novel=novel).values('paragraph_string'))
    #print(total_paragraphs)
    print(range(paragraph_id,  paragraph_id+HALF_PER_WORKER*2))
    paragraphs = Paragraph.objects.filter(novel = novel, paragraph_id__in = range(paragraph_id,  paragraph_id+HALF_PER_WORKER*2))
    summary_sentences = Summary_Sentence.objects.filter(novel=novel)
    texts = {
        'total_paragraphs' : total_paragraphs,
        'HALF_PER_WORKER':HALF_PER_WORKER,
        'paragraphs' : paragraphs,
        'refer_paragraph_id' : paragraphs[0].paragraph_id,
        'range' : range(paragraph_id, paragraph_id+HALF_PER_WORKER*2),
        'beginning_id' : max(paragraph_id-HALF_PER_WORKER,0),
        'ending_id' : min(paragraph_id+HALF_PER_WORKER*3-1, len(total_paragraphs)-1),
        'summary_sentences' : summary_sentences,
        'quiz_question': novel.quiz_question,
        'quiz_options' : json.loads(novel.quiz_options),
        'quiz_answer' : novel.quiz_answer,
        'Task_id' : Task_id,
    }
    return render(request, 'evline_task/step1_split_find.html', texts)

def step1_split_verify(request, novel_id):
    texts={

    }
    return render(request, 'evline_task/step1_split_verify.html', texts)

def step1_aggregate(request, passwd, novel_id):
    result = Step1_Visualize(novel_id)
    if passwd =='N1kixlab':
        if result == False:
            return HttpResponse("not sufficient data. Crowdsource more")
        else:
            print(result['relation_results_paragraph'])
            return render(request, 'evline_task/step1_visualize.html', result)
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
                taskmarker = TaskMarker_Step2(novel = novel, Turker_id = Turker_id, Task_id2 = step2form.cleaned_data['Task_id'], Done=True, Start_Time = datetime.datetime.now(), marked_task = Possible_Tasks_Step2.objects.get(novel=novel, pts_id=step2form.cleaned_data['pts_id']))
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
            print(feedback1form)
            Turker_id = feedback1form.cleaned_data['Turker_id']
            feedback = feedback1form.cleaned_data['step1feedback']
            helpfulness = int(feedback1form.cleaned_data['helpfulness'])
            understandability = int(feedback1form.cleaned_data['understandability'])
            feedbackmodel = Feedback_Step1(feedback = feedback, Turker_id = Turker_id, Helpfulness = helpfulness, Understandability = understandability)
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
            helpfulness = int(feedback1form.cleaned_data['helpfulness'])
            understandability = int(feedback1form.cleaned_data['understandability'])
            feedbackmodel = Feedback_Step2(feedback = feedback, Turker_id = Turker_id, Helpfulness = helpfulness, Understandability = understandability)
            feedbackmodel.save()
            return HttpResponseRedirect('/evline_task/end/'+Turker_id)
    storage = get_messages(request)
    for message in storage:
        turker_id = message
        break
    print(turker_id)
    return render(request, 'evline_task/feedback.html', {'Turker_id': turker_id})
