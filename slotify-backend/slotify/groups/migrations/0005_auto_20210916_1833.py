# Generated by Django 3.2.7 on 2021-09-16 18:33

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('groups', '0004_alter_group_members'),
    ]

    operations = [
        migrations.AddField(
            model_name='tag',
            name='is_exclusive_to_groups',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='group',
            name='members',
            field=models.ManyToManyField(through='groups.Membership', to=settings.AUTH_USER_MODEL),
        ),
    ]
