/*----------------------------------------------------------------------------*\
    $Validation 
\*----------------------------------------------------------------------------*/
function validate(element) {

  if (this.value == null || this.value == "") {

    if (element == "email") {
      console.log('email'); 
      if (document.querySelector(".email_return").innerHTML == "") {
        document.querySelector(".email_return").innerHTML += "Campo requerido";
      };
      document.login_form.email.parentNode.className += " error";
    };


    if (element == "pass") {
      console.log('pass');
      if (document.querySelector(".password_return").innerHTML == "") {
        document.querySelector(".password_return").innerHTML += "Campo requerido";
      };
      document.login_form.password.parentNode.className += " error";
    };
  }
}

/*----------------------------------------------------------------------------*\
    $Ajax Login  
\*----------------------------------------------------------------------------*/
function getCredentials() {
  var username = document.login_form.email.value;
  var password = document.login_form.password.value;

  login(username,password);
}

function login(user,pass) {

  // API's config 
  var endpoint = "login"

  $.ajax({
    url: api_url + endpoint,
    type: 'POST',
    crossDomain: true,
    data: "&email=" + user + "&password=" + pass,
    statusCode: {
      200: function(data_server) { 
        console.log(data_server);
        window.location = "dashboard.html"; 
      }
      ,400: function(data_server) { 
        console.log('teste');

      }
    }
  });
}

/*----------------------------------------------------------------------------*\
    $Ajax Password Recovery  
\*----------------------------------------------------------------------------*/
function passwordRecovery() {
  var email = document.login_form.email.value;

  // API's config 
  var endpoint = "/user-forgot-password/email"

  $.ajax({
    url: api_url + endpoint,
    type: 'POST',
    crossDomain: true,
    data: "&email=" + email,
    statusCode: {
      200: function(data_server) { 
        console.log(data_server);
        // window.location = "dashboard.html"; 
      }
      ,400: function(data_server) { 
      }
    }
  });
}