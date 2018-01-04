var summary_init= null
var summary_end = null
var summary_count
var chunk_on = false
var chunk_init = null
var chunk_end = null
var chunk_already_drawn = false
var paragraph_on = false
var paragraph_init = null
var paragraph_end = null
var paragraph_already_drawn = false
// TODO make paragraph scroll
// TODO make edges switchable / turn offable
// TODO make time leap visualization turn offable
$(document).ready(function(){
  summary_count = $(".summary_box").find(".contents").children().length
  $("body").css("overflow-y","hidden")
  initial_draw_chunk_to_sentence()
  //initial_draw_paragraph_to_sentence()
  initialize_chunk_mouseover()
  initialize_summary_mouseover()
  initialize_paragraph_mouseover()
  $(".original_text").on('scroll', function(){
    if(chunk_on){
      onscroll_adjustment_original_text_chunk();
    }
    if(paragraph_on){

    }
  })
  $(".summary_box").on('scroll', function(){
    if(chunk_on){
      onscroll_adjustment_summary_chunk();
    }
    if(paragraph_on){

    }
  })
})
jsPlumb.bind("ready", function(){
  jsPlumb.importDefaults({
  ConnectionsDetachable:false,
  deleteEndpointsOnDetach:false,
})
});

initialize_chunk_mouseover = function(){
  for(i in relation_results_chunk){
    $("#chunk_"+i.toString()).on("mouseover", function(){
      if(chunk_on){
        var id = $(this).attr("id")
        jsPlumb.select({source:id}).setPaintStyle({
          stroke:"black"
        })
        //TODO statistics shown?
    }
  }).on("mouseout", function(){
    if(chunk_on){
      var id = $(this).attr("id")
      jsPlumb.select({source:id}).setPaintStyle({
        stroke:"rgba(0,0,0,0.3)"
      })
    }
  })
  }
}
initialize_paragraph_mouseover = function(){
  for(i in relation_results_paragraph){
    $("#paragraph_"+i.toString()).on("mouseover", function(){
      if(paragraph_on){
        var id = $(this).attr("id")
        jsPlumb.select({source:id}).setPaintStyle({
          stroke:"black"
        })
        //TODO statistics shown?
    }
  }).on("mouseout", function(){
    if(paragraph_on){
      var id = $(this).attr("id")
      jsPlumb.select({source:id}).setPaintStyle({
        stroke:"rgba(0,0,0,0.3)"
      })
    }
  })
  }
}
initialize_summary_mouseover = function(){
  for(var i=0; i<summary_count; i++){
    $("#sum_sen_"+i.toString()).on("mouseover", function(){
      var id = $(this).attr("id")
      jsPlumb.select({target:id}).setPaintStyle({
        stroke:"black"
      })
      //TODO statistics shown?
  }).on("mouseout", function(){
    var id = $(this).attr("id")
    jsPlumb.select({target:id}).setPaintStyle({
      stroke:"rgba(0,0,0,0.3)"
    })
  })
  }
}

initial_draw_chunk_to_sentence = function(){
  //initially generate edges
  chunk_on = true;
  chunk_init = null
  chunk_end = null
  if(!chunk_already_drawn){
    for(i in relation_results_chunk){
      sen_count_sum = 0
      for(j in relation_results_chunk[i]){
        sen_count_sum = sen_count_sum + relation_results_chunk[i][j]['sen_count']
      }
      for(j in relation_results_chunk[i]){
        console.log(i)
        relation = relation_results_chunk[i][j]
        console.log(relation['sentence__summary_id'])
        jsPlumb.setContainer($("body"))
        jsPlumb.connect({
          Container: "body",
          source: "chunk_"+i.toString(),
          target: "sum_sen_"+relation['sentence__summary_id'],
          anchor:["Left","Right"],
          connector: 'Straight',
          endpoint: 'Blank',
          paintStyle: {strokeWidth: parseFloat(relation['sentence_sum'])/parseFloat(sen_count_sum), stroke: 'rgba(0,0,0,0.3)'},
        })
      }
    }
  }else{
    for(i in relation_results_chunk){
      jsPlumb.select({source:"chunk_"+i.toString()}).setPaintStyle({
        stroke:'black'
      }).setVisible(true)
    }
  }

  //initially generate the data structure to know how many chunks are in the screen
  var original_offset = $(".original_text").offset().top
  var original_outerheight = $(".original_text").outerHeight()
  for(i in relation_results_chunk){
    var chunk_top = $("#chunk_"+i.toString()).offset().top
    var chunk_height = $("#chunk_"+i.toString()).outerHeight()
    if(original_offset+39<chunk_top+chunk_height/2 && original_offset+original_outerheight>chunk_top+chunk_height/2){
      //push chunks in the visible row
      if(chunk_init==null){
        chunk_init = parseInt(i)
      }
      chunk_end = parseInt(i)
    }else{
      //
      jsPlumb.select({source:"chunk_"+i.toString()}).setVisible(false)
    }
  }

  //initially generate the data structure to know how many summarys are in the screen
  initial_summary()
}

initial_draw_paragraph_to_sentence = function(){
  paragraph_on = true;
  paragraph_init = null;
  paragraph_end = null;
  if(!chunk_already_drawn){
    for(i in relation_results_paragraph){
      sen_count_sum = 0
      for(j in relation_results_paragraph[i]){
        sen_count_sum = sen_count_sum + relation_results_paragraph[i][j]['sen_count']
      }
      console.log(sen_count_sum)
      for(j in relation_results_paragraph[i]){
        relation = relation_results_paragraph[i][j]

        jsPlumb.setContainer($("body"))
        jsPlumb.connect({
          Container: "body",
          source: "paragraph_"+i.toString(),
          target: "sum_sen_"+relation['sentence__summary_id'],
          anchor:["Left","Right"],
          connector: 'Straight',
          endpoint: 'Blank',
          paintStyle: {strokeWidth: parseFloat(relation['sentence_sum'])/parseFloat(sen_count_sum), stroke: 'rgba(0,0,0,0.3)'},
        })
      }
    }
  }else{
    for(i in relation_results_paragraph){
      jsPlumb.select({source:"paragraph_"+i.toString()}).setPaintStyle({
        stroke:'black'
      }).setVisible(true)
    }
  }

  //initially generate the data structure to know how many paragraphs are in the screen
  var original_offset = $(".original_text").offset().top
  var original_outerheight = $(".original_text").outerHeight()
  for(i in relation_results_paragraph){
    var paragraph_top = $("#paragraph_"+i.toString()).offset().top
    var paragraph_height = $("#paragraph_"+i.toString()).outerHeight()
    if(original_offset+39<paragraph_top+paragraph_height/2 && original_offset+original_outerheight>paragraph_top+paragraph_height/2){
      //push chunks in the visible row
      if(paragraph_init==null){
        paragraph_init = parseInt(i)
      }
      paragraph_end = parseInt(i)
    }else{
      //
      jsPlumb.select({source:"paragraph_"+i.toString()}).setVisible(false)
    }
  }
}

initial_summary = function(){
  summary_init = null
  summary_end = null
  var summary_offset = $(".summary_box").offset().top
  var summary_outerheight = $(".summary_box").outerHeight()
  for(var i=0; i<summary_count; i++){
    var sumsen_top = $("#sum_sen_"+i.toString()).offset().top
    var sumsen_height = $("#sum_sen_"+i.toString()).outerHeight()
    if(summary_offset+39<sumsen_top+sumsen_height/2 && summary_offset+summary_outerheight>sumsen_top+sumsen_height/2){
      //push chunks in the visible row
      if(summary_init==null){
        summary_init = parseInt(i)
      }
      summary_end = parseInt(i)
    }else{
      //
      jsPlumb.select({target:"sum_sen_"+i.toString()}).setPaintStyle({
        stroke:'transparent'
      })
    }
  }
}

onscroll_adjustment_original_text_chunk = function(){
  jsPlumb.repaintEverything();
  var original_offset = $(".original_text").offset().top
  var original_outerheight = $(".original_text").outerHeight()
  var chunk_first_top = $("#chunk_"+chunk_init.toString()).offset().top
  var chunk_first_height = $("#chunk_"+chunk_init.toString()).outerHeight()
  var chunk_last_top = $("#chunk_"+chunk_end.toString()).offset().top
  var chunk_last_height = $("#chunk_"+chunk_end.toString()).outerHeight()
  if(original_offset+39>chunk_first_top+chunk_first_height/2){
    jsPlumb.select({source:"chunk_"+chunk_init.toString()}).setVisible(false)
    chunk_init = chunk_init+1
  }else{
    if(chunk_init!=0){
      var chunk_ffirst_top = $("#chunk_"+(chunk_init-1).toString()).offset().top
      var chunk_ffirst_height = $("#chunk_"+(chunk_init-1).toString()).outerHeight()
      if(original_offset+39<chunk_ffirst_top+chunk_ffirst_height/2){
        jsPlumb.select({source:"chunk_"+(chunk_init-1).toString()}).setVisible(true)
        chunk_init = chunk_init-1
      }
    }
  }
  if(original_offset+original_outerheight<chunk_last_top+chunk_last_height/2){
    jsPlumb.select({source:"chunk_"+chunk_end.toString()}).setVisible(false)
    chunk_end = chunk_end-1
  }else{
    if(chunk_end!=relation_results_chunk.length-1){
      var chunk_flast_top = $("#chunk_"+(chunk_end+1).toString()).offset().top
      var chunk_flast_height = $("#chunk_"+(chunk_end+1).toString()).outerHeight()
      if(original_offset+original_outerheight>chunk_flast_top+chunk_flast_height/2){
        jsPlumb.select({source:"chunk_"+(chunk_end+1).toString()}).setVisible(true)
        chunk_end = chunk_end+1
      }
    }
  }
}
onscroll_adjustment_summary_chunk = function(){
  jsPlumb.repaintEverything();
  var summary_offset = $(".summary_box").offset().top
  var summary_outerheight = $(".summary_box").outerHeight()
  var sumsen_first_top = $("#sum_sen_"+summary_init.toString()).offset().top
  var sumsen_first_height = $("#sum_sen_"+summary_init.toString()).outerHeight()
  var sumsen_last_top = $("#sum_sen_"+summary_end.toString()).offset().top
  var sumsen_last_height = $("#sum_sen_"+summary_end.toString()).outerHeight()
  if(summary_offset+39>sumsen_first_top+sumsen_first_height/2){
    jsPlumb.select({target:"sum_sen_"+summary_init.toString()}).setPaintStyle({
      "stroke": "transparent"
    })
    summary_init = summary_init+1
  }else{
    if(summary_init!=0){
      var sumsen_ffirst_top = $("#sum_sen_"+(summary_init-1).toString()).offset().top
      var sumsen_ffirst_height = $("#sum_sen_"+(summary_init-1).toString()).outerHeight()
      if(summary_offset+39<sumsen_ffirst_top+sumsen_ffirst_height/2){
        jsPlumb.select({target:"sum_sen_"+(summary_init-1).toString()}).setPaintStyle({
          "stroke":'rgba(0,0,0,0.3)'
        })
        summary_init = summary_init-1
      }
    }
  }
  if(summary_offset+summary_outerheight<sumsen_last_top+sumsen_last_height/2){
    jsPlumb.select({target:"sum_sen_"+summary_end.toString()}).setPaintStyle({
      "stroke":"transparent"
    })
    summary_end = summary_end-1
  }else{
    if(summary_end!=summary_count-1){
      var sumsen_flast_top = $("#sum_sen_"+(summary_end+1).toString()).offset().top
      var sumsen_flast_height = $("#sum_sen_"+(summary_end+1).toString()).outerHeight()
      if(summary_offset+summary_outerheight>sumsen_flast_top+sumsen_flast_height/2){
        jsPlumb.select({target:"sum_sen_"+(summary_end+1).toString()}).setPaintStyle({
          "stroke":"rgba(0,0,0,0.3)"
        })
        summary_end = summary_end+1
      }
    }
    console.log(summary_init)
    console.log(summary_end)
  }

}
