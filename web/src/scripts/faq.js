/*----------------------------------------------------------------------------*\
    $Global Variables
\*----------------------------------------------------------------------------*/

/*----------------------------------------------------------------------------*\
    session handler
\*----------------------------------------------------------------------------*/
function loadFAQ() {
    "use strict";

    var data = {
            "items": [{
                "id": 1,
                "question": "Question 1?",
                "answer": "Answer 1",
                "group": "Group 1"
                }, {
                "id": 2,
                "question": "Question 2?",
                "answer": "Answer 2",
                "group": "Group 1"
                }, {
                "id": 3,
                "question": "Question 3?",
                "answer": "Answer 3",
                "group": "Group 1"
                }, {
                "id": 4,
                "question": "Question 4?",
                "answer": "Answer 4",
                "group": "Group 2"
                }, {
                "id": 5,
                "question": "Question 5?",
                "answer": "Answer 5",
                "group": "Group 2"
                }, {
                "id": 6,
                "question": "Question 6?",
                "answer": "Answer 6",
                "group": "Group 3"
                }, {
                "id": 7,
                "question": "Question 7?",
                "answer": "Answer 7",
                "group": "Group 3"
                }, {
                "id": 8,
                "question": "Question 8?",
                "answer": "Answer 8",
                "group": "Group 3"
                }, {
                "id": 9,
                "question": "Question 9?",
                "answer": "Answer 9",
                "group": "Group 3"
                }, {
                "id": 10,
                "question": "Question 10?",
                "answer": "Answer 10",
                "group": "Group 4"
            }]
    };
    buildFAQ(data)
}

function buildFAQ(data){
    $(".faq-list").empty();
    var contents = "<ul>";
    data.items.sort(function(a, b){
        if(a.group < b.group) return -1;
        if(a.group > b.group) return 1;
        return 0;
    });
    var group = "",
        group_content = "";
    $.each(data.items, function(index,item){
        if (group != item.group){
            contents += "<li class='group' group-id='" + item.group + "'><h3 class='group'>" + item.group + "</h3></li>";
            group = item.group;
        }
        contents += "<li><div class='item' group-id='" + item.group + "'><div class='question'>" + item.question + "</div><div class='answer'>" + item.answer + "</div></div></li>";
    });
    contents += "</ul>";
    $(".faq-list").append(contents);

    $(".faq-list li .question").on("click", function(e){
        $(this).next(".answer").slideToggle();
        $(this).toggleClass("active");
    });
    $(".help #busca").on("keyup", function(e){
        var text = $(this).val();
        $(".faq-list .item").hide();
        $('.faq-list .item').each(function(){
            if($(this).find(".question").text().toUpperCase().indexOf(text.toUpperCase()) != -1 || $(this).find(".answer").text().toUpperCase().indexOf(text.toUpperCase()) != -1){
                $(this).show();
            }
        });
        $('.faq-list li.group').each(function(index,item){
            var contador = $(".faq-list .item[group-id='"+$(item).attr("group-id")+"']:visible").length;
            if (contador > 0){
                $(item).show();
            }else{
                $(item).hide();
            }
        });
        if ($(".faq-list .item:visible").length <= 5){
            $(".faq-list").removeClass("multi-column");
            if ($(".faq-list .item:visible").length <= 0){
                $(".faq-list .no-results").remove();
                $(".faq-list").append("<div class='no-results'>Nenhum resultado encontrado</div>");
            }
        }else{
            $(".faq-list").removeClass("multi-column").addClass("multi-column");
            $(".faq-list .no-results").remove();
        }
    });
}