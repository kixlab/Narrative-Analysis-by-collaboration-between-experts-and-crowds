from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^step1_split_find/(?P<novel_id>\w+)/$', views.step1_split_find, name='step1_split_find'),
    url(r'^step1_split_verify/(?P<novel_id>\w+)/$', views.step1_split_verify, name='step1_split_verify'),
    url(r'^feedback_step1/$', views.feedback_step1, name='feedback_step1'),
    url(r'^step1_aggregate/(?P<passwd>\w+)/(?P<novel_id>\w+)/$', views.step1_aggregate, name='step1_aggregate'),
    url(r'^step2/(?P<novel_id>\w+)/$', views.step2, name='step2'),
    url(r'^feedback_step2/$', views.feedback_step2, name='feedback_step2'),
    url(r'^end/(?P<turker_id>\w+)/$', views.end, name='end'),
]
