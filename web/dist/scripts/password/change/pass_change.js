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

  
  if (secret_key == "" || email == ""){
    $(".alert").html("Requisição inválida. Por verifique se o link fornecido está correto.");
    $(".alert").removeClass("alert-success");
    $(".alert").addClass("alert-danger");
    return false;
  }else if (password == ""){
    $(".alert").html("Por favor informe a nova senha.");
    $(".alert").removeClass("alert-success");
    $(".alert").addClass("alert-danger");
    return false;
  }else if (password != password_confirm){
    $(".alert").html("Confirmação de senha inválida.");
    $(".alert").removeClass("alert-success");
    $(".alert").addClass("alert-danger");
    return false;
  }
  
  $.ajax({
    url: api_url + endpoint,
    type: "POST",
    crossDomain: true,
    data: request,
    complete: function(e, xhr, settings){
        if(e.status === 200){
          $(".alert").html("Sua senha foi alterada com sucesso");
          $(".alert").removeClass("alert-danger");
          $(".alert").addClass("alert-success");
          $("form")[0].reset();
          $(".form__field").hide();
          $(".row-btn .btn1").hide();
          $(".row-btn .btn2").removeClass("col-sm-6").addClass("col-sm-12");
        }
    },
    error: function(xhr, status, error){
        $(".alert").html("Erro ao alterar senha (" + xhr.status + ")");
        $(".alert").removeClass("alert-success");
        $(".alert").addClass("alert-danger");
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