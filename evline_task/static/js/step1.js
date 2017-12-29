var is_split=false;
var can_end=false;
var cur_selected;
var cur_attention;

//tutorial related
var tutoindex;
var tutoAdone=false;
var tutoBdone=false;
var tutorialA = [
  'In this task, you will first decide whether there is a temporal leap in between two parts of a novel.',
  'First you will read the summary and grasp the overall story line of the novel.',
  'Then you will read a part of the novel,',
  'and guess whether there is a temporal leap in between those two colored parts of the novel.',
  'If you cannot understand the context, you can expand the text and learn more about the novel.',
  'Also if you are lost in the text and want to find the colored parts again, hit SCROLL BACK.',
  'If you are done with guessing, make your decision, whether there is a temporal leap in between colored texts, or not.'
]
var tutorialAkeyword = 'temporal leap'
var tutorialAkeyword_explanation = 'A temporal leap happens when a story is flowing in reverse order or going back and forth between past and future events.'

var tutorialB = [
  'In this stage, you will be relating the summary and the text you read.',
  'You will choose which sentence of the summary best describes the text with colored background(text labeled A and B).',
  'You will choose the sentence by directly clicking them',
  'If you choose one, proceed with the proceed button. You can also go to previous step if you want to change your task.',
  'You will do the task for both of text A and B.'
]

$(document).ready(function(){
  $("#tutorial_modal").modal({backdrop:'static', keyboard: false})
  initialize_button()
  $("#scroll_back").on("click", function(){
    adjust_scroll_height('original_text', cur_attention)
  })
  $("#see_previous").on("click", function(){
    console.log("h")
    expand_previous()
  })
  $("#see_next").on("click", function(){
    expand_next()
  })
})
//initialize all the buttons...
initialize_button = function(){
  if(!tutoAdone){
    tutoAdone = Show_tuto(tutoAdone, tutorialA, 'Step1_A_', tutorialAkeyword, tutorialAkeyword_explanation)
  }
  $("#tuto_show").off("click").on("click", function(){
    Show_tuto(tutoAdone, tutorialA, 'Step1_A_',tutorialAkeyword, tutorialAkeyword_explanation)
  })

  cur_attention = 'paragraph_A'
  adjust_scroll_height('original_text', 'paragraph_A')
  $(".sum_sen").off("click").off("mouseout").off("mouseover").css("background-color", "transparent")
  $("#paragraph_A").css("background-color", "#cedaed").tooltip("show")
  $("#paragraph_B").css("background-color", "#ceede6").tooltip("show")
  $("#task_title_text").text("Decide whether there is a temporal leap in between two parts of the novel with background color")
  $(".prompt").empty().append("<p>You are going to read a summary of a novel, and a part of the novel’s original text. In the original text, there are paragraph A. and B., each with a background color. After reading them, you will answer the following question : In between  A. and B. in the text below, is there any temporal leap?</p>")
  .append("<p>*  example of temporal leap : a story in reverse order or going back and forth between past and future events.</p>")
  $(".sum_sen").off("click")
  $("#yes_prev").text("There is a temporal leap").removeClass("btn-danger").addClass("btn-success")
  .off("click").on("click", function(){
    // make  popup modal
    show_modal(true, false);
  })
  $("#no_next").text("There is no temporal leap").removeClass("btn-success").addClass("btn-danger")
  .off("click").on("click", function(){
    //make popup modal
    show_modal(false, true);
  })
}
show_modal = function(is_split_impending, can_end_impending){
  //say about the decision and change input type
  if(!is_split && !can_end){
    $("#modal_proceed").attr('type', 'button').text('Proceed')
    if(is_split_impending){
      $("#decision_text").text("You decided that there is a temporal leap between text A and B.")
    }else if(!is_split_impending){
      $("#decision_text").text("You decided that there is no temporal leap between text A and B.")
    }
  }else if(is_split && !can_end){
    $("#modal_proceed").attr('type', 'button').text('Proceed')
    $("#decision_text").text("You decided that the following sentence best expresses the content in text A.")
    $("#decision_text").append("<p>"+$("#"+cur_selected.toString()).text()+"</p>")
  }else if(is_split && can_end){
    $("#modal_proceed").attr('type', 'submit').text('Submit')
    $("#decision_text").text("You decided that the following sentence best expresses the content in text B.")
    $("#decision_text").append("<p>"+$("#"+cur_selected.toString()).text()+"</p>")
  }else if(!is_split && can_end){
    $("#modal_proceed").attr('type', 'submit').text('Submit')
    $("#decision_text").text("You decided that the following sentence best expresses the content in text A and B.")
    $("#decision_text").append("<p>"+$("#"+cur_selected.toString()).text()+"</p>")
  }
  //initialize proceed button -disabled
  $("#modal_proceed").prop('disabled',true)
  $("input[name=likert]").off("click").on('click', function(){
    $(this).off("click")
    $("#modal_proceed").prop('disabled',false)
  })
  // deal with the button click
  $("#confidence_modal").modal('show')
  $("#modal_proceed").off("click").on("click", function(){
    var checked = $("input:radio[name=likert]:checked").val()
    if(checked != undefined){
      // store input
      if(!is_split && !can_end){
        $("input[name=is_split]").prop("checked", is_split_impending)
        $("input[name=is_split_confidence]").val(parseInt(checked))
        $("input[name=begin1]").val(beginning_id)
        $("input[name=end1]").val(ending_id)
      }else if(is_split && !can_end){
        // TODO store input
        $("input[name=sentence_for_A]").val(cur_selected)
        $("input[name=sentence_for_A_confidence]").val(parseInt(checked))
        $("input[name=begin2_A]").val(beginning_id)
        $("input[name=end2_A]").val(ending_id)
      }else if(is_split && can_end){
        // TODO store input
        $("input[name=sentence_for_B]").val(cur_selected)
        $("input[name=sentence_for_B_confidence]").val(parseInt(checked))
        $("#turker_id_input").val(Math.random().toString(36).substring(5))
        $("input[name=begin2_B]").val(beginning_id)
        $("input[name=end2_B]").val(ending_id)
      }else if (!is_split && can_end){
        // TODO store input
        $("input[name=sentence_for_A]").val(cur_selected)
        $("input[name=sentence_for_A_confidence]").val(parseInt(checked))
        $("input[name=sentence_for_B]").val(cur_selected)
        $("input[name=sentence_for_B_confidence]").val(parseInt(checked))
        $("#turker_id_input").val(Math.random().toString(36).substring(5))
        $("input[name=begin2_A]").val(beginning_id)
        $("input[name=end2_A]").val(ending_id)
        $("input[name=begin2_B]").val(beginning_id)
        $("input[name=end2_B]").val(ending_id)
      }
      is_split = is_split_impending;
      can_end = can_end_impending
      //reset input
      $("input[name=likert]").prop("checked", false)
      $("#confidence_modal").modal('hide')
      get_position_in_summary()
    }else{
      alert("Select one option.")
    }
  })
}
get_position_in_summary = function(){
  if(!tutoBdone){
    tutoBdone = Show_tuto(tutoBdone, tutorialB, 'Step1_B_')
  }
  $("#tuto_show").off("click").on("click", function(){
    Show_tuto(tutoBdone, tutorialB, 'Step1_B_')
  })
  //TODO change all the explanations
    //hightlight texts only
    console.log(cur_selected)
  cur_selected = -1
  if(is_split && !can_end){
    //split case + getting the position of A in the summary
      // data should not be returned
    $("#paragraph_A").css("background-color", "#cedaed").tooltip('show')
    $("#paragraph_B").css("background-color", "transparent")
    cur_attention = 'paragraph_A'
    adjust_scroll_height('original_text', 'paragraph_A')
    $("#task_title_text").text("Which sentence of the summary is explaining the blue part of the original text?")
    $(".prompt").empty().append("<p>From the summary and the original text that you read, you might have grasped which sentences of the summary is explaining the parts of the original text. Now, decide which sentence of the summary best explains the event that includes the part of the text highlighted in blue, the text A.</p>")
    .append("<p>You can select one of the sentences in the summary by clicking it.</p>")
    }else if(is_split && can_end){
    //split case + getting the position of B in the summary
      // data should be returned
    $("#paragraph_A").css("background-color", "transparent")
    $("#paragraph_B").css("background-color", "#ceede6").tooltip('show')
    cur_attention = 'paragraph_B'
    adjust_scroll_height('original_text', 'paragraph_B')
    $("#task_title_text").text("Which sentence of the summary is explaining the green part of the original text?")
    $(".prompt").empty().append("<p>From the summary and the original text that you read, you might have grasped which sentences of the summary is explaining the parts of the original text. Now, decide which sentence of the summary best explains the event that includes the part of the text highlighted in green, the text B.</p>")
    .append("<p>You can select one of the sentences in the summary by clicking it.</p>")
  }else{
    //non split case
      // data should be returned
    $("#paragraph_A").css("background-color", "#cedaed").tooltip('show')
    $("#paragraph_B").css("background-color", "#ceede6").tooltip('show')
    cur_attention = 'paragraph_A'
    adjust_scroll_height('original_text', 'paragraph_A')
    $("#task_title_text").text("Which sentence of the summary is explaining highlighted parts of the original text?")
    $(".prompt").empty().append("<p>From the summary and the original text that you read, you might have grasped which sentences of the summary is explaining the parts of the original text. Now, decide which sentence of the summary best explains the event that includes parts of the text, which are highlighted, the text A and B.</p>")
    .append("<p>You can select one of the sentences in the summary by clicking it.</p>")
  }


  //enable summary and button selection
  summary_buttonize()
  $("#yes_prev").text("Previous step").removeClass("btn-success").addClass("btn-danger").off("click")
  .on("click", function(){
    //go to previous status
    if(is_split && !can_end){
      is_split = false;
      initialize_button();
    }else if(is_split && can_end){
      can_end = false;
      get_position_in_summary();
    }else{
      can_end = false;
      initialize_button();
    }

  })
  $("#no_next").text("Proceed").removeClass("btn-danger").addClass("btn-success").off("click")
  .on("click", function(){
    //show pop up for collecting rating
    if(cur_selected==-1){
      alert("Select one sentence from the summary")
    }else{
      if(can_end){
        show_modal(is_split, can_end)
      }else{
        show_modal(true,true)
      }

    }
  })
}

summary_buttonize=function(){
  $(".sum_sen").css("background-color", "transparent").off("mouseover").on("mouseover", function(){
    $(this).css("background-color", "#eeeeee")
  }).off("mouseout").on("mouseout", function(){
    $(this).css("background-color", "transparent")
  }).off("click").on("click", function(){
    cur_selected = parseInt($(this).attr("id"))
    summary_buttonize()
    $(this).off("mouseout").on("mouseout", function(){
      $(this).css("background-color", "#dddddd")
    })
    $(this).css("background-color", "#dddddd").off("click").on("click", function(){
      cur_selected = -1;
      summary_buttonize()
    })
  })
}

adjust_scroll_height=function(container_id, object_id){
  //console.log($("#"+object_id).outerHeight())
  //console.log($("."+container_id).scrollTop())
  //console.log($("."+container_id).offset().top)
  //console.log($("#"+object_id).offset().top)
  $("."+container_id).animate({
    scrollTop: $("."+container_id).scrollTop()+$("#"+object_id).offset().top-$("."+container_id).offset().top-39
  }, 500)
}
expand_previous = function(){
  if(beginning_id<=0){
    alert("You already reached the first part of the whole text.")
  }else{
    beginning_id--;
    $("#text_content").prepend("<p style='color:grey'>"+total_paragraphs[beginning_id]['paragraph_string']+"</p>")
  }
}
expand_next = function(){
  if(ending_id>=total_paragraphs.length-1){
    alert("You already reached the last part of the whole text.")
  }else{
    ending_id++;
    $("#text_content").append("<p style='color:grey'>"+total_paragraphs[ending_id]['paragraph_string']+"</p>")
  }
}

Show_tuto=function(tutodone,tutotext,tutoimgname, keyword = false, keyword_explanation =false){
  $("#tutorial_modal").modal("show")
  tutoindex=0;
  if(!tutodone){
    $("#tuto_close").css("display", 'none')
  }else{
    $("#tuto_close").css("display", '')
  }
  $("#tuto_prev").prop("disabled", true)
  apply_tuto_content(tutotext[tutoindex], tutoimgname+tutoindex.toString(), keyword, keyword_explanation)
  $("#tuto_next").off('click').on('click', function(){
    if(tutoindex==0){
      $("#tuto_prev").prop("disabled", false)
    }
    tutoindex++;
    if(tutoindex>=tutotext.length){
      //end tutorial
      $("#tutorial_modal").modal("hide")
    }else{
      apply_tuto_content(tutotext[tutoindex], tutoimgname+tutoindex.toString(), keyword, keyword_explanation)
    }
  })
  $("#tuto_prev").off('click').on('click', function(){
    tutoindex--;
    if(tutoindex<=0){
      $("#tuto_prev").prop("disabled", true)
    }
    apply_tuto_content(tutotext[tutoindex], tutoimgname+tutoindex.toString(), keyword, keyword_explanation)
  })
  return true;

}
