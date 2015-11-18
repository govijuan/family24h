/*----------------------------------------------------------------------------*\
    $Ajax Password Change  
\*----------------------------------------------------------------------------*/
function passwordChange() {
  "use strict";

  var email = queryVariable("email");
  var secret_key = queryVariable("key");

  var password = document.pass_change_form.password.value;
  var password_confirm = document.pass_change_form.password_confirm.value;

  var enviar = document.getElementsByTagName("button");

  // API's config 
  var endpoint = "/user-forgot-password/reset-password";

  var request = "&email=" + email + 
                "&password=" + password + 
                "&password_confirm=" + password_confirm +
                "&secret_key=" + secret_key;

  $.ajax({
    url: api_url + endpoint,
    type: "POST",
    crossDomain: true,
    data: request,
    statusCode: {
      200: function(data_server) {
      },
      400: function(data_server) { 
      }
    }
  });
}

function queryVariable(param) {
  "use strict";
  
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
         var pair = vars[i].split("=");
         if(pair[0] == param){return pair[1];}
  }
  return(false);
}

// Self invoking anonymous function to see if the email and/or key are querystring
// If yes, shows only password fields.
// If not, shows code and email fields.
(function () {
  "use strict";

  var currentPage = document.querySelector("section[role='password_change']");

  var email = queryVariable("email");
  var secret_key = queryVariable("key");

  if (currentPage) {  
    if(email === false){
      var email_field = document.querySelector("form[name='pass_change_form'] .email");
      email_field.style.display = "block";
    }

    if(secret_key === false){
      var codigo_field = document.querySelector("form[name='pass_change_form'] .codigo");
      codigo_field.style.display = "block";
    }
  }
}) ();