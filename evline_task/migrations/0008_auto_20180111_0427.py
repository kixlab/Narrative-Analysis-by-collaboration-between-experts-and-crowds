# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-01-11 04:27
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('evline_task', '0007_auto_20180108_0950'),
    ]

    operations = [
        migrations.AddField(
            model_name='novel',
            name='quiz_answer',
            field=models.TextField(default=''),
        ),
        migrations.AddField(
            model_name='novel',
            name='quiz_options',
            field=models.TextField(default=''),
        ),
        migrations.AddField(
            model_name='novel',
            name='quiz_question',
            field=models.TextField(default=''),
        ),
    ]