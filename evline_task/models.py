from django.db import models

# Create your models here.

#Main Novel object which contains full text and summary
class Novel(models.Model):
    original_text = models.TextField(default = "")
    summary = models.TextField(default = "")
    title = models.TextField(default = "")
    def __str__(self):
        return self.title

#Paragraph object which contains string of each paragraph
class Paragraph(models.Model):
    novel = models.ForeignKey(Novel)
    paragraph_id = models.IntegerField(default = -1)
    paragraph_string = models.TextField(default="")
    def __str__(self):
        return self.novel.title+"_paragraph_"+str(self.paragraph_id)

#Summary Sentence object which contains string
class Summary_Sentence(models.Model):
    novel = models.ForeignKey(Novel)
    summary_id = models.IntegerField(default = -1)
    sentence_string = models.TextField(default="")
    def __str__(self):
        return self.novel.title+"_summary_sentence_"+str(self.summary_id)

#Chunk object aggregated from the paragraphs
class Chunk(models.Model):
    novel = models.ForeignKey(Novel)
    summary_sentence = models.ForeignKey(Summary_Sentence, null = True, blank=True)
    chunk_id = models.IntegerField(default = -1)
    begin_paragraph = models.IntegerField(default = -1)
    end_paragraph = models.IntegerField(default = -1)
    def __str__(self):
        return self.novel.title+"_Chunk_"+ str(self.chunk_id)

#result of task, Step1A
    #task of seeing whether the paragraph this object is referring to and the next paragraph are
    #temporally detached
class Step1_Task_A(models.Model):
    Turker_id = models.CharField(default="", max_length=30)
    is_separate = models.BooleanField(default = False)
    refer_paragraph = models.ForeignKey(Paragraph)
    confidence = models.IntegerField(default = 0)
    novel = models.ForeignKey(Novel)
    context_begin_paragraph = models.IntegerField(default = -1)
    context_end_paragraph = models.IntegerField(default = -1)
    def __str__(self):
        return self.novel.title+"_step1A_on_"+str(self.refer_paragraph.paragraph_id)

#result of task, Step1B
    #task of seeing in which summary sentence the paragraph is being explained
class Step1_Task_B(models.Model):
    Turker_id = models.CharField(default="", max_length=30)
    sentence = models.ForeignKey(Summary_Sentence)
    refer_paragraph = models.ForeignKey(Paragraph)
    confidence = models.IntegerField(default = 0)
    novel = models.ForeignKey(Novel)
    context_begin_paragraph = models.IntegerField(default = -1)
    context_end_paragraph = models.IntegerField(default = -1)
    def __str__(self):
        return self.novel.title+"_step1B_on_"+str(self.refer_paragraph.paragraph_id)
#result of task, Step2
    #task of deciding the order of 2 chunks
class Step2_Task(models.Model):
    Turker_id = models.CharField(default="", max_length=30)
    sentence = models.ForeignKey(Summary_Sentence)
    confidence = models.IntegerField(default = 0)
    novel = models.ForeignKey(Novel)
    prev_chunk = models.ForeignKey(Chunk, related_name='prev_chunk')
    next_chunk = models.ForeignKey(Chunk, related_name='next_chunk')
    def __str__(self):
        return self.novel.title+"_sum_sen_"+str(self.sentence.summary_id)+"_prev_"+str(self.prev_chunk.chunk_id)+"_next_"+str(self.next_chunk.chunk_id)

class Feedback_Step1(models.Model):
    feedback = models.TextField(default="")
    Turker_id= models.TextField(default="")
    Helpfulness = models.IntegerField(default = 0)
    Understandability =models.IntegerField(default = 0)
    def __str__(self):
        return self.Turker_id

class Feedback_Step2(models.Model):
    feedback = models.TextField(default="")
    Turker_id= models.TextField(default="")
    Helpfulness = models.IntegerField(default = 0)
    Understandability =models.IntegerField(default = 0)
    def __str__(self):
        return self.Turker_id

class TaskMarker_Step1(models.Model):
    novel = models.ForeignKey(Novel)
    Turker_id = models.CharField(default = "", max_length = 30)
    Task_id = models.CharField(default = "", max_length = 30)
    Done = models.BooleanField(default = False)
    Start_Time = models.DateTimeField()
    Task_Paragraph = models.ForeignKey(Paragraph)
    def __str__(self):
        return self.Task_id +"_"+ str(self.Task_Paragraph.paragraph_id)+"_"+str(self.Start_Time)

class Possible_Tasks_Step2(models.Model):
    novel = models.ForeignKey(Novel)
    pts_id =models.IntegerField(default=-1)
    sentence = models.ForeignKey(Summary_Sentence)
    chunk1 = models.ForeignKey(Chunk, related_name='chunk1')
    chunk2 = models.ForeignKey(Chunk, related_name='chunk2')
    def __str__(self):
        return self.novel.title+"_sentence"+str(self.sentence.summary_id)+"_chunk"+str(self.chunk1.chunk_id)+", "+str(self.chunk2.chunk_id)

class TaskMarker_Step2(models.Model):
    novel = models.ForeignKey(Novel)
    Turker_id = models.CharField(default = "", max_length = 30)
    Task_id2 = models.CharField(default = "", max_length = 30)
    Done = models.BooleanField(default = False)
    Start_Time = models.DateTimeField()
    marked_task = models.ForeignKey(Possible_Tasks_Step2, null=True)
    def __str__(self):
        return self.Task_id2+"_"+str(self.marked_task.sentence.summary_id)+"_chunk"+str(self.marked_task.chunk1.chunk_id)+", "+str(self.marked_task.chunk2.chunk_id)
