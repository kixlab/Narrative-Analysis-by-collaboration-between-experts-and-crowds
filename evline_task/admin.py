from django.contrib import admin
from .models import Novel, Paragraph, Summary_Sentence, Step1_Task_A, Step1_Task_B, Feedback_Step1, Chunk, Step2_Task, TaskMarker_Step1
from .models import TaskMarker_Step2, Possible_Tasks_Step2
# Register your models here.
admin.site.register(Novel)
admin.site.register(Summary_Sentence)
admin.site.register(Paragraph)
admin.site.register(Step1_Task_A)
admin.site.register(Step1_Task_B)
admin.site.register(Feedback_Step1)
admin.site.register(Chunk)
admin.site.register(Step2_Task)
admin.site.register(TaskMarker_Step1)
admin.site.register(TaskMarker_Step2)
admin.site.register(Possible_Tasks_Step2)
