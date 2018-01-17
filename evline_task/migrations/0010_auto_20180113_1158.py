# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-01-13 11:58
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('evline_task', '0009_auto_20180113_1109'),
    ]

    operations = [
        migrations.CreateModel(
            name='Step1_No_Split',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Turker_id', models.CharField(default='', max_length=30)),
                ('reasoning', models.TextField(default='')),
                ('context_begin_paragraph', models.IntegerField(default=-1)),
                ('context_end_paragraph', models.IntegerField(default=-1)),
                ('novel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='evline_task.Novel')),
                ('refer_paragraph', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='evline_task.Paragraph')),
            ],
        ),
        migrations.RemoveField(
            model_name='step1_split',
            name='is_separate',
        ),
        migrations.RemoveField(
            model_name='step1_summary',
            name='confidence',
        ),
        migrations.RemoveField(
            model_name='step1_summary',
            name='sentence',
        ),
        migrations.AddField(
            model_name='step1_summary',
            name='summary',
            field=models.TextField(default=''),
        ),
    ]
