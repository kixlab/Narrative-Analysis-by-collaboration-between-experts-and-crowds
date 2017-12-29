from django import template
register = template.Library()

@register.filter
def para_string(List, i):
    return List[int(i)].paragraph_string

@register.filter
def index(List, i):
    return List[int(i)]
