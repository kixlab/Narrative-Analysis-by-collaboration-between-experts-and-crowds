var tuto_done = false;
var tutotext = ['tuto text']
var tutoimgname='Step1_A_'
$(document).ready(function(){
  tuto_done = Show_tuto(tuto_done, tutotext, tutoimgname)
  initialize_layout();
  initialize_button();
})

initialize_layout = function(){

  $(".summary_box").removeClass("col-sm-6").addClass("col-sm-4")
  $(".original_text").removeClass("col-sm-6").addClass("col-sm-8")
  $(".origin_contents").addClass("row")
  $(".contents").css("margin-top", function(){
    return 0;
  }).css("height", function(){
    return $(this).parent().outerHeight()-39
  }).css("overflow-y", "scroll")
  $(".heading").css("position", "relative").css("width","initial").addClass("row")
  $(".submit_box").addClass("row")
  $("#modal_proceed").text("Submit").attr("type", "submit")
  $("input[name=Task_id]").val(Task_id)
  $("input[name=pts_id]").val(pts_id)
  $("input[name=summary_id]").val(summary_id)
}

initialize_button=function(){
  $(".decision").on('click', function(){
    var _id = $(this).attr('id')
    if(_id=="A_happen"){
      $('input[name=previous_num]').val(chunk1_id)
      $('input[name=next_num]').val(chunk2_id)
    }else{
      $('input[name=previous_num]').val(chunk2_id)
      $('input[name=next_num]').val(chunk1_id)
    }
    $("#confidence_modal").modal("show")
  })
  $("#tuto_show").on("click", function(){
    Show_tuto(tuto_done, tutotext, tutoimgname)
  })
  $("#modal_proceed").on("click", function(){
    var checked = $("input:radio[name=likert]:checked").val()
    $("input[name=confidence]").val(checked)
    $("input[name=Turker_id]").val(Math.random().toString(36).substring(5))
  })
}
