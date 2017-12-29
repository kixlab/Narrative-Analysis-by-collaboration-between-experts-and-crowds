from .models import Novel, Paragraph, Summary_Sentence, Step1_Task_A, Step1_Task_B
from nltk.tokenize import sent_tokenize
def Novel_Data_Gen(novel_id):
    #get novel objects
    novel = Novel.objects.get(title = novel_id)
    #split original text in to paragraphs and split original summary into sentences
    ########### TODO make it reflect the paragraph structure
    first_split = novel.original_text.split("\r\n")
    for idx, para in enumerate(first_split):
        if para =='':
            first_split[idx-1]=first_split[idx-1]+"\r\n"
    ##############
    split_paragraphs = [para for para in first_split if para !='']
    split_sentences = sent_tokenize(novel.summary)
    #save them
    for idx, split_paragraph in enumerate(split_paragraphs):
        paragraph_model = Paragraph(novel = novel, paragraph_id=idx, paragraph_string = split_paragraph)
        paragraph_model.save()
        print(idx, split_paragraph)
    for idx, split_sentence in enumerate(split_sentences):
        sentence_model = Summary_Sentence(novel = novel, summary_id=idx, sentence_string = split_sentence)
        sentence_model.save()
        print(idx, split_sentence)

def Pick_Step1_task(novel_id):
    #get novel objects
    novel = Novel.objects.get(title=novel_id)
    #pick one *work*
    #TODO algorithm for this!
    paragraphs = Paragraph.objects.filter(novel = novel)
    paragraphs = paragraphs.exclude(paragraph_id = paragraphs.count()-1)
    #return paragraphs.order_by('?')[0].paragraph_id
    return 153


def temporary_for_data_exploration():
    novel = Novel.objects.get(title='Hardfeelings')
    paragraph = Paragraph.objects.get(novel=novel, paragraph_id = 153)
    task_a = Step1_Task_A.objects.filter(novel=novel, refer_paragraph = paragraph)
    print(task_a.filter(is_separate=True).count())
