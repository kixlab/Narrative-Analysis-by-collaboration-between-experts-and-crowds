from django import template
register = template.Library()

@register.filter
def para_string(List, i):
    return List[int(i)].paragraph_string

@register.filter
def index(List, i):
    return List[int(i)]

@register.filter
def weight(List, i):
    return List[int(i)]['weight']

@register.filter
def inlist(List, i):
    return i in List
@register.filter
def find_index(List, val):
    return List.index(val)
