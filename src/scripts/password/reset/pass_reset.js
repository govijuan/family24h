/*----------------------------------------------------------------------------*\
    $Ajax Password Recovery  
\*----------------------------------------------------------------------------*/
function passwordRecovery() {
  "use strict";

  var email = document.pass_reset_form.email.value;

  // API's config 
  var endpoint = "/user-forgot-password/email";

  $.ajax({
    url: api_url + endpoint,
    type: "POST",
    crossDomain: true,
    data: "&email=" + email,
    statusCode: {
      200: function(data_server) {
        $(".form__field").hide();
        $(".success").show("slow");
      },
      400: function(data_server) { 
        $(".form__field").hide();
        $(".fail").show("slow");
      }
    }
  });
}
