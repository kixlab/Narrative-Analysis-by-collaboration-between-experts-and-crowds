# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-12-28 14:08
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('evline_task', '0002_auto_20171228_0722'),
    ]

    operations = [
        migrations.CreateModel(
            name='Feedback_Step1',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('feedback', models.TextField(default='')),
                ('Turker_id', models.TextField(default='')),
            ],
        ),
    ]