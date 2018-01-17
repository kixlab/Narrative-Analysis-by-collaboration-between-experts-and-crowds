from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(Novel)
admin.site.register(Summary_Sentence)
admin.site.register(Paragraph)
admin.site.register(Step1_Split)
admin.site.register(Step1_No_Split)
admin.site.register(Step1_Summary)
admin.site.register(Feedback_Step1)
admin.site.register(Chunk)
admin.site.register(Step2_Task)
admin.site.register(TaskMarker_Step1_split_find)
admin.site.register(TaskMarker_Step2)
admin.site.register(Possible_Tasks_Step2)
