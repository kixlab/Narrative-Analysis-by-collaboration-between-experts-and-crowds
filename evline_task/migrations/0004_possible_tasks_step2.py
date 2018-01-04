# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-01-02 06:19
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('evline_task', '0003_auto_20180102_0616'),
    ]

    operations = [
        migrations.CreateModel(
            name='Possible_Tasks_Step2',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('chunk1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chunk1', to='evline_task.Chunk')),
                ('chunk2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chunk2', to='evline_task.Chunk')),
                ('novel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='evline_task.Novel')),
                ('sentence', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='evline_task.Summary_Sentence')),
            ],
        ),
    ]