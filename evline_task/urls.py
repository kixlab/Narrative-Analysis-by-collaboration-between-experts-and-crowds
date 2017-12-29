from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^step1/(?P<novel_id>\w+)/$', views.step1, name='step1'),
    url(r'^feedback_step1/$', views.feedback_step1, name='feedback_step1'),
    url(r'^end/(?P<turker_id>\w+)/$', views.end, name='end'),
]
