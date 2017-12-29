from django.contrib import admin
from .models import Novel, Paragraph, Summary_Sentence, Step1_Task_A, Step1_Task_B, Feedback_Step1
# Register your models here.
admin.site.register(Novel)
admin.site.register(Summary_Sentence)
admin.site.register(Paragraph)
admin.site.register(Step1_Task_A)
admin.site.register(Step1_Task_B)
admin.site.register(Feedback_Step1)
