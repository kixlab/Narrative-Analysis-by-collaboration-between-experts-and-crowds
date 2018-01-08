from .models import Novel, Paragraph, Summary_Sentence, Step1_Task_A, Step1_Task_B, TaskMarker_Step1, Chunk, Possible_Tasks_Step2, TaskMarker_Step2
from nltk.tokenize import sent_tokenize
import datetime
from django.db.models import Count, Sum, When, Q, F, Case, IntegerField, FloatField
from django.db.models.functions import Cast
import random
import string
def Novel_Data_Gen(novel_id):
    #get novel objects
    novel = Novel.objects.get(title = novel_id)
    #split original text in to paragraphs and split original summary into sentences
    ########### TODO make it reflect the paragraph structure
    first_split = novel.original_text.split("\r\n")
    for idx, para in enumerate(first_split):
        if para =='':
            first_split[idx-1]=first_split[idx-1]+"\r\n"
    ##############
    split_paragraphs = [para for para in first_split if para !='']
    split_sentences = sent_tokenize(novel.summary)
    #save them
    for idx, split_paragraph in enumerate(split_paragraphs):
        paragraph_model = Paragraph(novel = novel, paragraph_id=idx, paragraph_string = split_paragraph)
        paragraph_model.save()
        print(idx, split_paragraph)
    for idx, split_sentence in enumerate(split_sentences):
        sentence_model = Summary_Sentence(novel = novel, summary_id=idx, sentence_string = split_sentence)
        sentence_model.save()
        print(idx, split_sentence)

def Step1_task_extractor(novel, time_limit=30):
    #remove deprecated tasks
    TaskMarker_Step1.objects.filter(novel=novel, Done=False, Start_Time__lte = datetime.datetime.now()-datetime.timedelta(minutes=time_limit)).delete()
    #find paragraphs # of works done
    already_marked = TaskMarker_Step1.objects.filter(novel=novel).values('Task_Paragraph__paragraph_id').annotate(done_count = Sum(Case(When(Done=True, then=1), When(Done=False, then=0), output_field=IntegerField()))).annotate(count = Count('Task_Paragraph')).order_by('count')
    print(already_marked)
    paragraphs = Paragraph.objects.filter(novel = novel)
    #find paragraphs without any work done
    unmarked = paragraphs.exclude(paragraph_id = paragraphs.count()-1).exclude(paragraph_id__in = [q['Task_Paragraph__paragraph_id'] for q in already_marked])
    #if any work do not have a mark
    if unmarked.count() >0 :
        #deploy task on it
        return unmarked[0]
    #else
    else:
        #get the work that is least done
        already_marked_not_done = already_marked.filter(done_count__lt=5)
        if already_marked_not_done.count()>0:
            return paragraphs.get(paragraph_id = already_marked_not_done[0]['Task_Paragraph__paragraph_id'])
        print("all done")
        return paragraphs.get(paragraph_id = already_marked[0]['Task_Paragraph__paragraph_id'])

def Pick_Step1_task(novel_id):
    #get novel objects
    novel = Novel.objects.get(title=novel_id)
    #pick one *work*
    paragraph = Step1_task_extractor(novel)
    print(paragraph)
    #generate Task id, and mark the task
    Task_id = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(6))
    taskmarker = TaskMarker_Step1(novel=novel, Task_id = Task_id, Done=False, Start_Time = datetime.datetime.now(), Task_Paragraph=paragraph)
    taskmarker.save()
    data ={
        'Task_id' : Task_id,
        'paragraph_id' : paragraph.paragraph_id
    }
    return data

def Step1_Visualize(novel_id, required_worker = 5):
    novel = Novel.objects.get(title=novel_id)
    Step1A_count = Step1_Task_A.objects.filter(novel= novel).values('refer_paragraph__paragraph_id').annotate(count = Count('refer_paragraph')).filter(count__gte=required_worker).count()
    if Step1A_count == Paragraph.objects.filter(novel = novel).count()-1:
        paragraphs = Paragraph.objects.filter(novel=novel)
        paragraphs = paragraphs.exclude(paragraph_id = paragraphs.count()-1)
        paragraph_split = (paragraphs.values('step1_task_a__refer_paragraph__paragraph_id').annotate(total_sum = 10*Count('step1_task_a')).annotate(split_sum = Sum(Case(When(step1_task_a__is_separate=True, then=5+F('step1_task_a__confidence')),When(step1_task_a__is_separate=False, then= 5-F('step1_task_a__confidence')), output_field=IntegerField()))).order_by('step1_task_a__refer_paragraph__paragraph_id'))
        paragraph_split = paragraph_split.annotate(split_sum_f=Cast('split_sum', FloatField())).annotate(total_sum_f=Cast('total_sum', FloatField())).annotate(weight = F('split_sum_f')/F('total_sum_f'))
        print(paragraph_split)
        splits=[]
        for one_split in paragraph_split:
            para_num = one_split['step1_task_a__refer_paragraph__paragraph_id']
            if one_split['weight']>0.5:
                if para_num not in splits:
                    splits.append(para_num)
        splits.append(paragraphs.count())
        cur_begin = 0
        relation_results_chunk = []
        for idx, split in enumerate(splits):
            #apply summary_sentence for each chunks
            taskb = Step1_Task_B.objects.filter(novel=novel,refer_paragraph__paragraph_id__in=range(cur_begin, split+1)).values('sentence__summary_id').annotate(sentence_sum = Sum('confidence'), sen_count=Count('confidence')).order_by('-sentence_sum')
            relation_results_chunk.append(list(taskb))
            cur_begin = split + 1
        total_paragraphs = Paragraph.objects.filter(novel=novel)
        relation_results_paragraph =[]
        for paragraph in total_paragraphs:
            taskb = Step1_Task_B.objects.filter(novel=novel, refer_paragraph = paragraph).values('sentence__summary_id').annotate(sentence_sum = Sum('confidence'), sen_count= Count('confidence')).order_by('-sentence_sum')
            relation_results_paragraph.append(list(taskb))
            print(taskb)
        splits = list(splits)
        total_paragraphs = total_paragraphs.values('paragraph_string')
        summary_sentences = Summary_Sentence.objects.filter(novel=novel)
        print(paragraph_split)
        data = {
            'total_paragraphs': total_paragraphs,
            'summary_sentences': summary_sentences,
            'relation_results_chunk':relation_results_chunk,
            'relation_results_paragraph':relation_results_paragraph,
            'paragraph_split': paragraph_split,
            'splits': splits,
        }
        return data
    else:
        return False

def Step1_Aggregate(novel_id, required_worker = 5):
    novel = Novel.objects.get(title=novel_id)
    Step1A_count = Step1_Task_A.objects.filter(novel= novel).values('refer_paragraph__paragraph_id').annotate(count = Count('refer_paragraph')).filter(count__gte=required_worker).count()
    #??? add 1B as safety measurement?
    #Step1B_count = Step1_Task_B.objects.filter(novel=novel).values('refer_paragraph__paragraph_id').annotate(count=Count('refer_paragraph'))
    print(Step1A_count)
    if Step1A_count == Paragraph.objects.filter(novel = novel).count()-1:
        #do aggregation
        #make chunks
        paragraphs = Paragraph.objects.filter(novel=novel)
        paragraphs = paragraphs.exclude(paragraph_id = paragraphs.count()-1)
        paragraph_split = paragraphs.values('step1_task_a__refer_paragraph__paragraph_id').annotate(split_sum = Sum(Case(When(step1_task_a__is_separate=True, then=F('step1_task_a__confidence')),When(step1_task_a__is_separate=False, then=-1 * F('step1_task_a__confidence')), output_field=IntegerField()))).order_by('step1_task_a__refer_paragraph__paragraph_id')
        splits=[]
        for one_split in paragraph_split:
            para_num = one_split['step1_task_a__refer_paragraph__paragraph_id']
            if one_split['split_sum']>0:
                if para_num not in splits:
                    splits.append(para_num)
        splits.append(paragraphs.count())
        cur_begin = 0
        print(paragraph_split)
        print(splits)
        ########################FOR RENEWING CHUNK -deletion
        Chunk.objects.all().delete()
        Possible_Tasks_Step2.objects.all().delete()
        ########################
        for idx, split in enumerate(splits):
            #apply summary_sentence for each chunks
            taskb = Step1_Task_B.objects.filter(refer_paragraph__paragraph_id__in=range(cur_begin, split+1)).values('sentence__summary_id').annotate(sentence_sum = Sum('confidence')).order_by('-sentence_sum')
            print(list(taskb))
            summary_sentence = Summary_Sentence.objects.get(novel=novel, summary_id=taskb[0]['sentence__summary_id'])
            #generate possible tasks for step 2
            new_chunk = Chunk(novel=novel, summary_sentence=summary_sentence, chunk_id = idx, begin_paragraph=cur_begin, end_paragraph=split)
            cur_begin = split+1
            new_chunk.save()
        pts_id=0
        #generate possible tasks
        summary_sentences = Summary_Sentence.objects.filter(novel=novel)
        for summary_sentence in summary_sentences:
            chunks_sen = Chunk.objects.filter(summary_sentence = summary_sentence)
            if chunks_sen.count()>1:
                for i in range(0, chunks_sen.count()):
                    for j in range(i+1, chunks_sen.count()):
                        pts2=Possible_Tasks_Step2(novel=novel, sentence=summary_sentence, pts_id= pts_id, chunk1=Chunk.objects.get(novel=novel, chunk_id=i), chunk2=Chunk.objects.get(novel=novel, chunk_id=j))
                        pts2.save()
                        pts_id = pts_id+1
        return True
    else:
        return False

def Step2_Task_extractor(novel, time_limit=30):
    #remove deprecated tasks
    TaskMarker_Step2.objects.filter(novel=novel, Done=False, Start_Time__lte = datetime.datetime.now()-datetime.timedelta(minutes=time_limit)).delete()
    #find how many tasks are done being done
    already_marked = TaskMarker_Step2.objects.filter(novel=novel).values('marked_task__pts_id').annotate(done_count = Sum(Case(When(Done=True, then=1), When(Done=False, then=0), output_field=IntegerField()))).annotate(count = Count('marked_task')).order_by('count')
    possible_tasks = Possible_Tasks_Step2.objects.filter(novel = novel)
    #find tasks that are not done at all
    unmarked = possible_tasks.exclude(pts_id__in = [q['marked_task__pts_id'] for q in already_marked])
    #if there is a task that is not done at all
    if unmarked.count() >0 :
        #deploy a work for that task without any task done
        return unmarked[0]
    #else
    else:
        #deploy a work for the task that has least work done
        already_marked_not_done = already_marked.filter(done_count__lt=5)
        if already_marked_not_done.count()>0:
            return paragraphs.get(pts_id = already_marked_not_done[0]['marked_task__pts_id'])
        print("all done")
        return possible_tasks.get(pts_id = already_marked[0]['marked_task__pts_id'])

def Pick_Step2_task(novel_id):
    novel = Novel.objects.get(title = novel_id)
    #pick *one* Chunk pair
    pts = Step2_Task_extractor(novel)
    Task_id = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(6))
    taskmarker = TaskMarker_Step2(novel=novel, Task_id2 = Task_id, Done=False, Start_Time = datetime.datetime.now(), marked_task=pts)
    taskmarker.save()
    data ={
        'pts_id' : pts.pts_id,
        'Task_id' : Task_id,
        'chunk1' : pts.chunk1,
        'chunk2' : pts.chunk2,
    }
    return data

def temporary_for_data_exploration():
    novel = Novel.objects.get(title='Hardfeelings')
    paragraph = Paragraph.objects.get(novel=novel, paragraph_id = 153)
    task_a = Step1_Task_A.objects.filter(novel=novel, refer_paragraph = paragraph)

    return (task_a.filter(is_separate=True).count())
