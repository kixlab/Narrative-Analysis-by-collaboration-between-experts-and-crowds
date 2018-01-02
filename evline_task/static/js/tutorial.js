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
