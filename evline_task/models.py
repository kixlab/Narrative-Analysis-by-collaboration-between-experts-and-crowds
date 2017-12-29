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

class Feedback_Step1(models.Model):
    feedback = models.TextField(default="")
    Turker_id= models.TextField(default="")
    def __str__(self):
        return self.Turker_id
