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

var browse_relation_data = true;
var border_data_displayed = false;
var border_data_html;
var border_data_id;

var chunk_data_displayed=false;
var paragraph_data_displayed=false;
var chunk_data_html;
var paragraph_data_html;
var chunk_data_id;
var paragraph_data_id;

var sel_color = "rgba(255, 165, 86, 0.5)"
var sub_sel_color = 'rgba(198, 198, 198, 0.5)'

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
  initialize_border_mouseover()
  $(".original_text").on('scroll', function(){
    jsPlumb.repaintEverything()
    if(chunk_init!=null){
      onscroll_adjustment_original_text_chunk();
    }
    if(paragraph_init!=null){
      onscroll_adjustment_original_text_paragraph();
    }
  })
  $(".summary_box").on('scroll', function(){
    jsPlumb.repaintEverything()
    if(summary_init!=null){
      onscroll_adjustment_summary_chunk();
    }

  })
  turn_on_buttons_set_up()
})
jsPlumb.bind("ready", function(){
  jsPlumb.importDefaults({
  ConnectionsDetachable:false,
  deleteEndpointsOnDetach:false,
})
  window.onresize = function(event){
    jsPlumb.repaintEverything()
  }
});

turn_on_buttons_set_up = function(){
  $("#chunk-summary").on('click', function(){
    $('#linkage_dropdown').text("Chunk-Summary")
      initial_draw_chunk_to_sentence()
      turn_off_paragraph()
  })
  $("#paragraph-summary").on('click', function(){
    $('#linkage_dropdown').text("Paragraph-Summary")
      initial_draw_paragraph_to_sentence()
      turn_off_chunk()
  })
  $("#no-link").on('click', function(){
    $('#linkage_dropdown').text("Don't show link result")
      turn_off_paragraph()
      turn_off_chunk()
      $(".chunk").css("border-left", "solid 3px transparent")
  })

  $("#aggregated-chunks").on("click", function(){
    $("#split_dropdown").text("Aggregated Chunks")
    split_disappear();
    chunk_border_show()
  })
  $("#split-result").on("click", function(){
    $("#split_dropdown").text("Split Result")
    show_split();
  })
  $("#no-visualization").on("click", function(){
    $("#split_dropdown").text("No Visualization")
    split_disappear();
  })
  $("#relation-data").on("click", function(){
    $("#mouseover_dropdown").text("Relation Data")
    $("#data_description").empty()
    $(".paragraph_border").css("background-color", "black")
    browse_relation_data = true;
    if(chunk_on){
      if(chunk_data_id != null){
        $("#"+chunk_data_id).css("background-color",sel_color)
        $("#data_description").html(chunk_data_html)
      }
      if(paragraph_data_id != null){
        $("#"+paragraph_data_id).css("background-color", sub_sel_color)
      }
    }else if(paragraph_on){
      if(chunk_data_id != null){
        $("#"+chunk_data_id).css("background-color",sub_sel_color)
      }
      if(paragraph_data_id != null){
        $("#data_description").html(paragraph_data_html)
        $("#"+paragraph_data_id).css("background-color", sel_color)
      }
    }
  })
  $("#split-data").on("click", function(){
    $("#data_description").empty()
    $("#mouseover_dropdown").text("Split Data")
    browse_relation_data = false;
    if(chunk_data_id != null){
      $("#"+chunk_data_id).css("background-color", 'transparent')
    }
    if(paragraph_data_id != null){
      $("#"+paragraph_data_id).css("background-color", 'transparent')
    }
    if(border_data_id != null){
      $("#"+border_data_id).css("background-color", '#17a2b8')
      $("#data_description").html(border_data_html)
    }

  })
}

initialize_chunk_mouseover = function(){
  for(i in relation_results_chunk){
    $("#chunk_"+i.toString()).on("mouseover", function(){
      if(chunk_on && browse_relation_data){
        $(this).css("background-color", sel_color)
        var id = $(this).attr("id")
        jsPlumb.select({source:id}).setPaintStyle({
          stroke:"black"
        })
        //TODO statistics shown?

          var _id = parseInt(id.substring(6))
          $("#data_description").empty()
          for(j in relation_results_chunk[_id]){
            var average_confidence = parseFloat(relation_results_chunk[_id][j]['sentence_sum'])/parseFloat(relation_results_chunk[_id][j]['sen_count'])
            $("#data_description").append("<div><u>"+$("#sum_sen_"+relation_results_chunk[_id][j]['sentence__summary_id'].toString()).text()+"</u></div>")
            .append("<div>number of votes : "+relation_results_chunk[_id][j]['sen_count'].toString()+" / average of crowd confidence: "+average_confidence.toFixed(2)+"</div>")
          }

    }
  }).on("mouseout", function(){
    if(chunk_on&& browse_relation_data){
      var id = $(this).attr("id")
      jsPlumb.select({source:id}).setPaintStyle({
        stroke:"rgba(0,0,0,0.3)"
      })
      if(!chunk_data_displayed){
        $(this).css("background-color", "transparent")
        $("#data_description").empty()
      }else{
        if($(this).attr("id")!=chunk_data_id){
          $(this).css("background-color", "transparent")
        }
        $("#data_description").html(chunk_data_html)
      }
    }
  }).on("click", function(){
      if(chunk_on&& browse_relation_data){
        if(!chunk_data_displayed){
          chunk_data_displayed = true;
          chunk_data_html = $("#data_description").html()
          chunk_data_id = $(this).attr("id")
        }else{
          if(chunk_data_id == $(this).attr("id")){
            chunk_data_displayed=false;
            chunk_data_id = null;
          }else{
            chunk_data_html = $("#data_description").html()
            $("#"+chunk_data_id).css("background-color", "transparent")
            chunk_data_id = $(this).attr("id")
          }
        }
      }
    })
  }
}
initialize_paragraph_mouseover = function(){
  for(i in relation_results_paragraph){
    $("#paragraph_"+i.toString()).on("mouseover", function(){
      if(paragraph_on&& browse_relation_data){
        var id = $(this).attr("id")
        $(this).css("background-color", sel_color)
        jsPlumb.select({source:id}).setPaintStyle({
          stroke:"black",
        })
        //TODO statistics shown?

          var _id = parseInt(id.substring(10))
          $("#data_description").empty()
          for(j in relation_results_paragraph[_id]){
            var average_confidence = parseFloat(relation_results_paragraph[_id][j]['sentence_sum'])/parseFloat(relation_results_paragraph[_id][j]['sen_count'])
            $("#data_description").append("<div><u>"+$("#sum_sen_"+relation_results_paragraph[_id][j]['sentence__summary_id'].toString()).text()+"</u></div>")
            .append("<div>number of votes : "+relation_results_paragraph[_id][j]['sen_count'].toString()+" / average of crowd confidence: "+average_confidence.toFixed(2)+"</div>")
          }

    }
  }).on("mouseout", function(){
    if(paragraph_on&& browse_relation_data){
      var id = $(this).attr("id")
      jsPlumb.select({source:id}).setPaintStyle({
        stroke:"rgba(0,0,0,0.3)",
      })
      if(!paragraph_data_displayed){
        $(this).css("background-color", "transparent")
        $("#data_description").empty()
      }else{
        if($(this).attr("id")!=paragraph_data_id){
          $(this).css("background-color", "transparent")
        }
        $("#data_description").html(paragraph_data_html)
      }
    }
  }).on("click", function(){
      if(paragraph_on&& browse_relation_data){
        if(!paragraph_data_displayed){
          paragraph_data_displayed = true;
          paragraph_data_html = $("#data_description").html()
          paragraph_data_id = $(this).attr("id")
          console.log(paragraph_data_html)
        }else{
          if(paragraph_data_id == $(this).attr("id")){
            paragraph_data_displayed=false;
            paragraph_data_id = null;
          }else{
            paragraph_data_html = $("#data_description").html()
            $("#"+paragraph_data_id).css("background-color", "transparent")
            paragraph_data_id = $(this).attr("id")
          }
        }
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
initialize_border_mouseover = function(){
  $(".paragraph_border").on("mouseover", function(){
    if(!browse_relation_data){
      $("#data_description").html($(this).attr("id"))
      $(this).css("background-color", function(){
        if($(this).css("visibility")=="visible"){
          return "#17a2b8";
        }else{
          return "black;"
        }
      })
    }
  }).on("mouseout", function(){
    if(!browse_relation_data){
      if(border_data_id != $(this).attr('id')){
        $(this).css("background-color", function(){
          if($(this).css("visibility")=="visible"){
            return "black";
          }
        })
      }
      $("#data_description").html(border_data_html)
    }
  }).on("click", function(){
    if(!browse_relation_data){
      if(!border_data_displayed){
        border_data_html = $(this).attr("id");
        border_data_id = $(this).attr("id");
        border_data_displayed =true;
      }else{
        if(border_data_id == $(this).attr("id")){
          border_data_html = null;
          border_data_id = null;
          border_data_displayed =false;
        }else{
          border_data_html = $("#data_description").html()
          $("#"+border_data_id).css("background-color", "black")
          border_data_id = $(this).attr("id")
        }
      }
    }
  })
}
initial_draw_chunk_to_sentence = function(){
  //initializing data description
  if(paragraph_data_id != null){
    $("#"+paragraph_data_id).css("background-color", sub_sel_color)
  }
  if(chunk_data_id != null){
    $("#"+chunk_data_id).css("background-color",sel_color)
  }
  $("#data_description").html(chunk_data_html)
  //initially generate edges
  $(".chunk").css("border-left", "solid 3px black")
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
        relation = relation_results_chunk[i][j]
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
    chunk_already_drawn = true
  }else{
    for(i in relation_results_chunk){
      jsPlumb.select({source:"chunk_"+i.toString()}).setPaintStyle({
        stroke:'rgba(0,0,0,0.3)'
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
      //$("#chunk"+i.toString()).removeClass("edge_invisible")
      if(chunk_init==null){
        chunk_init = parseInt(i)
      }
      chunk_end = parseInt(i)
    }else{
      //
      //$("#chunk"+i.toString()).addClass("edge_invisible")
      jsPlumb.select({source:"chunk_"+i.toString()}).setVisible(false)
    }
  }

  //initially generate the data structure to know how many summarys are in the screen
  initial_summary()
}

initial_draw_paragraph_to_sentence = function(){
  //initializing data description
  if(chunk_data_id != null){
    $("#"+chunk_data_id).css("background-color",sub_sel_color)
  }
  if(paragraph_data_id != null){
    $("#"+paragraph_data_id).css("background-color",sel_color)
  }
  $("#data_description").html(paragraph_data_html)


  $(".paragraph").css("border-left", "solid 3px black")
  paragraph_on = true;
  paragraph_init = null;
  paragraph_end = null;
  if(!paragraph_already_drawn){
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
          //connector: 'Straight',
          connector:["Straight",],
          endpoint: 'Blank',
          paintStyle: {strokeWidth: parseFloat(relation['sentence_sum'])/parseFloat(sen_count_sum), stroke: 'rgba(0,0,0,0.3)'},
        })
      }
    }
    paragraph_already_drawn = true
  }else{
    for(i in relation_results_paragraph){
      jsPlumb.select({source:"paragraph_"+i.toString()}).setPaintStyle({
        stroke:'rgba(0,0,0,0.3)'
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
  initial_summary()
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
      jsPlumb.select({target:"sum_sen_"+i.toString()}).setVisible(false)
    }
  }
}

turn_off_chunk=function(){
  chunk_on =false;
  $(".chunk").css("border-left", "solid 0px transparent")
  for(i in relation_results_chunk){
    jsPlumb.select({source:"chunk_"+i.toString()}).setVisible(false)
  }
}

turn_off_paragraph=function(){
  paragraph_on =false;
  $(".paragraph").css("border-left", "solid 0px transparent")
  for(i in relation_results_paragraph){
    jsPlumb.select({source:"paragraph_"+i.toString()}).setVisible(false)
  }
}

onscroll_adjustment_original_text_chunk = function(){
  var original_offset = $(".original_text").offset().top
  var original_outerheight = $(".original_text").outerHeight()
  var chunk_first_top = $("#chunk_"+chunk_init.toString()).offset().top
  var chunk_first_height = $("#chunk_"+chunk_init.toString()).outerHeight()
  var chunk_last_top = $("#chunk_"+chunk_end.toString()).offset().top
  var chunk_last_height = $("#chunk_"+chunk_end.toString()).outerHeight()
  if(original_offset+39>chunk_first_top+chunk_first_height/2){
    jsPlumb.select({source:"chunk_"+chunk_init.toString()}).each(function(connection){
      var num = parseInt(connection.target.id.substring(8))
      if(num>=summary_init && num<=summary_end){
        connection.setVisible(false)
      }
    })
    chunk_init = chunk_init+1
  }else{
    if(chunk_init!=0){
      var chunk_ffirst_top = $("#chunk_"+(chunk_init-1).toString()).offset().top
      var chunk_ffirst_height = $("#chunk_"+(chunk_init-1).toString()).outerHeight()
      if(original_offset+39<chunk_ffirst_top+chunk_ffirst_height/2){
        if(chunk_on){
          jsPlumb.select({source:"chunk_"+(chunk_init-1).toString()}).each(function(connection){
            var num = parseInt(connection.target.id.substring(8))
            if(num>=summary_init && num<=summary_end){
              connection.setVisible(true)
            }
          })
        }
        chunk_init = chunk_init-1
      }
    }
  }
  if(original_offset+original_outerheight<chunk_last_top+chunk_last_height/2){
    jsPlumb.select({source:"chunk_"+chunk_end.toString()}).each(function(connection){
      var num = parseInt(connection.target.id.substring(8))
      if(num>=summary_init && num<=summary_end){
        connection.setVisible(false)
      }
    })
    chunk_end = chunk_end-1
  }else{
    if(chunk_end!=relation_results_chunk.length-1){
      var chunk_flast_top = $("#chunk_"+(chunk_end+1).toString()).offset().top
      var chunk_flast_height = $("#chunk_"+(chunk_end+1).toString()).outerHeight()
      if(original_offset+original_outerheight>chunk_flast_top+chunk_flast_height/2){
        if(chunk_on){
          jsPlumb.select({source:"chunk_"+(chunk_end+1).toString()}).each(function(connection){
            var num = parseInt(connection.target.id.substring(8))
            if(num>=summary_init && num<=summary_end){
              connection.setVisible(true)
            }
          })
        }
        chunk_end = chunk_end+1
      }
    }
  }
}

onscroll_adjustment_original_text_paragraph = function(){
  var original_offset = $(".original_text").offset().top
  var original_outerheight = $(".original_text").outerHeight()
  var paragraph_first_top = $("#paragraph_"+paragraph_init.toString()).offset().top
  var paragraph_first_height = $("#paragraph_"+paragraph_init.toString()).outerHeight()
  var paragraph_last_top = $("#paragraph_"+paragraph_end.toString()).offset().top
  var paragraph_last_height = $("#paragraph_"+paragraph_end.toString()).outerHeight()
  if(original_offset+39>paragraph_first_top+paragraph_first_height/2){
    jsPlumb.select({source:"paragraph_"+paragraph_init.toString()}).each(function(connection){
      var num = parseInt(connection.target.id.substring(8))
      if(num>=summary_init && num<=summary_end){
        connection.setVisible(false)
      }
    })
    paragraph_init = paragraph_init+1
  }else{
    if(paragraph_init!=0){
      var paragraph_ffirst_top = $("#paragraph_"+(paragraph_init-1).toString()).offset().top
      var paragraph_ffirst_height = $("#paragraph_"+(paragraph_init-1).toString()).outerHeight()
      if(original_offset+39<paragraph_ffirst_top+paragraph_ffirst_height/2){
        if(paragraph_on){
          jsPlumb.select({source:"paragraph_"+(paragraph_init-1).toString()}).each(function(connection){
            var num = parseInt(connection.target.id.substring(8))
            if(num>=summary_init && num<=summary_end){
              connection.setVisible(true)
            }
          })
        }
        paragraph_init = paragraph_init-1
      }
    }
  }
  if(original_offset+original_outerheight<paragraph_last_top+paragraph_last_height/2){
    jsPlumb.select({source:"paragraph_"+paragraph_end.toString()}).each(function(connection){
      var num = parseInt(connection.target.id.substring(8))
      if(num>=summary_init && num<=summary_end){
        connection.setVisible(false)
      }
    })
    paragraph_end = paragraph_end-1
  }else{
    if(paragraph_end!=relation_results_paragraph.length-1){
      var paragraph_flast_top = $("#paragraph_"+(paragraph_end+1).toString()).offset().top
      var paragraph_flast_height = $("#paragraph_"+(paragraph_end+1).toString()).outerHeight()
      if(original_offset+original_outerheight>paragraph_flast_top+paragraph_flast_height/2){
        if(paragraph_on){
          jsPlumb.select({source:"paragraph_"+(paragraph_end+1).toString()}).each(function(connection){
            var num = parseInt(connection.target.id.substring(8))
            if(num>=summary_init && num<=summary_end){
              connection.setVisible(true)
            }
          })
        }
        paragraph_end = paragraph_end+1
      }
    }
  }
}

onscroll_adjustment_summary_chunk = function(){

  var summary_offset = $(".summary_box").offset().top
  var summary_outerheight = $(".summary_box").outerHeight()
  var sumsen_first_top = $("#sum_sen_"+summary_init.toString()).offset().top
  var sumsen_first_height = $("#sum_sen_"+summary_init.toString()).outerHeight()
  var sumsen_last_top = $("#sum_sen_"+summary_end.toString()).offset().top
  var sumsen_last_height = $("#sum_sen_"+summary_end.toString()).outerHeight()
  if(summary_offset+39>sumsen_first_top+sumsen_first_height/2){
    jsPlumb.select({target:"sum_sen_"+summary_init.toString()}).each(function(connection){
      if(chunk_on){
        if(connection.source.id.includes('chunk')){
          var num = parseInt(connection.source.id.substring(6))
          if(num>=chunk_init && num<=chunk_end){
            connection.setVisible(false)
          }
        }
      }else if(paragraph_on){
        if(connection.source.id.includes('paragraph')){
          var num = parseInt(connection.source.id.substring(10))
          if(num>=paragraph_init && num<=paragraph_end){
            connection.setVisible(false)
          }
        }
      }
    })
    summary_init = summary_init+1
  }else{
    if(summary_init!=0){
      var sumsen_ffirst_top = $("#sum_sen_"+(summary_init-1).toString()).offset().top
      var sumsen_ffirst_height = $("#sum_sen_"+(summary_init-1).toString()).outerHeight()
      if(summary_offset+39<sumsen_ffirst_top+sumsen_ffirst_height/2){
        jsPlumb.select({target:"sum_sen_"+(summary_init-1).toString()}).each(function(connection){
          if(chunk_on){
            if(connection.source.id.includes('chunk')){
              var num = parseInt(connection.source.id.substring(6))
              if(num>=chunk_init && num<=chunk_end){
                connection.setVisible(true)
              }
            }
          }else if(paragraph_on){
            if(connection.source.id.includes('paragraph')){
              var num = parseInt(connection.source.id.substring(10))
              if(num>=paragraph_init && num<=paragraph_end){
                connection.setVisible(true)
              }
            }
          }
        })
        summary_init = summary_init-1
      }
    }
  }
  if(summary_offset+summary_outerheight<sumsen_last_top+sumsen_last_height/2){
    jsPlumb.select({target:"sum_sen_"+summary_end.toString()}).each(function(connection){
      if(chunk_on){
        if(connection.source.id.includes('chunk')){
          var num = parseInt(connection.source.id.substring(6))
          if(num>=chunk_init && num<=chunk_end){
            connection.setVisible(false)
          }
        }
      }else if(paragraph_on){
        if(connection.source.id.includes('paragraph')){
          var num = parseInt(connection.source.id.substring(10))
          if(num>=paragraph_init && num<=paragraph_end){
            connection.setVisible(false)
          }
        }
      }
    })//.setPaintStyle({
      //"stroke":"transparent"
    //})
    summary_end = summary_end-1
  }else{
    if(summary_end!=summary_count-1){
      var sumsen_flast_top = $("#sum_sen_"+(summary_end+1).toString()).offset().top
      var sumsen_flast_height = $("#sum_sen_"+(summary_end+1).toString()).outerHeight()
      if(summary_offset+summary_outerheight>sumsen_flast_top+sumsen_flast_height/2){
        jsPlumb.select({target:"sum_sen_"+(summary_end+1).toString()}).each(function(connection){
          if(chunk_on){
            if(connection.source.id.includes('chunk')){
              var num = parseInt(connection.source.id.substring(6))
              if(num>=chunk_init && num<=chunk_end){
                connection.setVisible(true)
              }
            }
          }else if(paragraph_on){
            if(connection.source.id.includes('paragraph')){
              var num = parseInt(connection.source.id.substring(10))
              if(num>=paragraph_init && num<=paragraph_end){
                connection.setVisible(true)
              }
            }
          }
        })
        summary_end = summary_end+1
      }
    }
    console.log(summary_init)
    console.log(summary_end)
  }

}

chunk_border_show = function(){
  $(".chunk_border").css("visibility", "visible")
}

show_split = function(){
  $(".paragraph_border").css("visibility", "visible")
}

split_disappear = function(){
  $(".paragraph_border").css("visibility", "hidden")
}
