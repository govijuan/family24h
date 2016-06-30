/*----------------------------------------------------------------------------*\
    $Global Variables
\*----------------------------------------------------------------------------*/
var api_url = "http://familyhomol.eokoe.com";
var flash = $("#flash");

var user_id = getCookie("family_id");
var api_key = getCookie("family_key");
var user_data = {};


/*TRADUTOR*/
$.tr.dictionary(myDictionary);
$.tr.language('pt_BR');
var tr = $.tr.translator();

/*----------------------------------------------------------------------------*\
    session handler
\*----------------------------------------------------------------------------*/
function validateCookie(onsuccess, onerror) {
    "use strict";

    if (api_key) {

        // API's config
        var endpoint = "/users";

        $.ajax({
            url: api_url + endpoint + "/" + user_id,
            type: "GET",

            crossDomain: true,
            data: "&api_key=" + api_key,
            statusCode: {
                200: function(data) {
                    user_data = data;

                    if (onsuccess) {
                        onsuccess(data)
                    }

                },
                400: function(data) {
                    api_key = '';
                    if (onerror) {
                        onerror(data)
                    }

                },
                403: function(data) {
                    api_key = '';
                    if (onerror) {
                        onerror(data)
                    }
                }
            }
        });
    } else {
        if (onerror) {
            onerror()
        }
    }

}

function __default_cookie_error (){
    alert('Erro de sessão');
    api_key = '';
    window.location = "/login";
}

/*----------------------------------------------------------------------------*\
    $Event ID generator
\*----------------------------------------------------------------------------*/
function guid() {
    "use strict";

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

/*----------------------------------------------------------------------------*\
    get cookie
\*----------------------------------------------------------------------------*/
function getCookie(name) {
    var dc = document.cookie;
    var cname = name + "=";

    if (dc.length > 0) {
        begin = dc.indexOf(cname);
        if (begin != -1) {
            begin += cname.length;
            end = dc.indexOf(";", begin);
            if (end == -1) end = dc.length;
            return unescape(dc.substring(begin, end));
        }
    }
    return null;
}

/*----------------------------------------------------------------------------*\
    set cookie
\*----------------------------------------------------------------------------*/
function setCookie(id, api_key) {
    var exp = new Date(); //set new date object
    var expires = new Date(exp.getTime() + (30 * 86400000)); //set it 30 days ahead
    var idCookie = escape(id);
    document.cookie = "family_id=" + escape(id) + "; path=/; expires=" + expires + ";";
    var keyCookie = escape(api_key);
    document.cookie = "family_key=" + escape(api_key) + "; path=/; expires=" + expires + ";";
}


/*----------------------------------------------------------------------------*\
    send contact form
\*----------------------------------------------------------------------------*/
function sendContact() {
    $("#contactForm .alert").html("");
    $("#contactForm .alert").removeClass("alert-success");
    $("#contactForm .alert").removeClass("alert-danger");

  if ($("#contactForm #name").val() == ""){
    $("#contactForm .alert").html(tr("Please inform your Name"));
    $("#contactForm .alert").removeClass("alert-success");
    $("#contactForm .alert").addClass("alert-danger");
    return false;
  }else if ($("#contactForm #email").val() == ""){
    $("#contactForm .alert").html(tr("Please inform your Email"));
    $("#contactForm .alert").removeClass("alert-success");
    $("#contactForm .alert").addClass("alert-danger");
    return false;
  }else if (!validateEmail($("#contactForm #email").val())){
    $("#contactForm .alert").html(tr("Email invalid"));
    $("#contactForm .alert").removeClass("alert-success");
    $("#contactForm .alert").addClass("alert-danger");
    return false;
  }else if ($("#contactForm #message").val() == ""){
    $("#contactForm .alert").html(tr("Please inform your Message"));
    $("#contactForm .alert").removeClass("alert-success");
    $("#contactForm .alert").addClass("alert-danger");
    return false;
  }
  
  var contact_url = "http://contato.family24h.com/mail";
  
  var request = "";
  
  request += "name=" + escape($("#contactForm #name").val());
  request += "&email=" + escape($("#contactForm #email").val());
  request += "&message=" + escape($("#contactForm #message").val());
  
  $.ajax({
      url: contact_url,
      type: "POST",
      data: request,
      crossDomain: true,
      complete: function(e, xhr, settings){
          if(e.status === 200 || e.status === 202){
            var retorno = JSON.parse(e.responseText);
            if (retorno.success == "yes"){
              $("#contactForm .alert").html(tr("Your message has been sent. Thank You."));
              $("#contactForm .alert").addClass("alert-success");
              $("#contactForm .alert").removeClass("alert-danger");
            }else{
              $("#contactForm .alert").html(tr("Error sending message. Please try again later."));
              $("#contactForm .alert").removeClass("alert-success");
              $("#contactForm .alert").addClass("alert-danger");
            }
          }
      },
      error: function(xhr, status, error){
          console.log(xhr);
          $("#contactForm .alert").html(tr("Error sending message. Please try again later.") + " (" + xhr.status + ")");
          $("#contactForm .alert").removeClass("alert-success");
          $("#contactForm .alert").addClass("alert-danger");
      }
  });
}
function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}