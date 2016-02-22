/*----------------------------------------------------------------------------*\
    $Ajax Password Recovery  
\*----------------------------------------------------------------------------*/
function passwordRecovery() {
  "use strict";

  var email = document.pass_reset_form.email.value;

  // API's config 
  var endpoint = "/user-forgot-password/email";
  
  if (email == ""){
    $(".alert").html("Por favor informe o email de cadastro.");
    $(".alert").removeClass("alert-success");
    $(".alert").addClass("alert-danger");
    return false;
  }

  $.ajax({
    url: api_url + endpoint,
    type: "POST",
    crossDomain: true,
    data: "&email=" + email,
    complete: function(e, xhr, settings){
        if(e.status === 200){
          $(".alert").html("Email enviado com sucesso. <br />Cheque a sua pasta de SPAM.");
          $(".alert").removeClass("alert-danger");
          $(".alert").addClass("alert-success");
          $("form")[0].reset();
        }
    },
    error: function(xhr, status, error){
        $(".alert").html("Ocorreu um problema ao enviar sua requisição. <br/ > Tente novamente em alguns minutos. (" + xhr.status + ")");
        $(".alert").removeClass("alert-success");
        $(".alert").addClass("alert-danger");
    }
  });
}
