/*----------------------------------------------------------------------------*\
    $Validation 
\*----------------------------------------------------------------------------*/
function validate(element) {
  
  var email_error = document.querySelector(".email_return");
  var pass_error = document.querySelector(".password_return");

  if (element.value == null || element.value == "") {

    console.log(element.value);

    if (element.name == "email") {

      if (email_error.innerHTML == "") {
        email_error.innerHTML += "Campo requerido";
      };

      if (element.parentNode.classList != "error") {
        document.login_form.email.parentNode.className += " error";
      }
    };

    if (element.name == "password") {

      if (pass_error.innerHTML == "") {
        pass_error.innerHTML += "Campo requerido";
      };
      document.login_form.password.parentNode.className += " error";
    };
  } else {

    if (document.login_form.email.parentNode.classList.contains("error")) {
        email_error.innerHTML = "";
        document.login_form.email.parentNode.className = "form__field";
    };

    if (document.login_form.password.parentNode.classList.contains("error")) {
      pass_error.innerHTML = "";
      document.login_form.password.parentNode.className = "form__field";
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
  var endpoint = "login";

  $.ajax({
    url: api_url + endpoint,
    type: 'POST',
    crossDomain: true,
    data: "&email=" + user + "&password=" + pass,
    statusCode: {
      200: function(data_server) { 
        // console.log(data_server);
        window.location = "dashboard.html"; 
      }
      ,400: function(data_server) { 
        // console.log('teste');
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
  var endpoint = "/user-forgot-password/email";

  $.ajax({
    url: api_url + endpoint,
    type: 'POST',
    crossDomain: true,
    data: "&email=" + email,
    statusCode: {
      200: function(data_server) {
        // window.location = "dashboard.html"; 
      }
      ,400: function(data_server) { 
      }
    }
  });
}

/*----------------------------------------------------------------------------*\
    $Ajax Password Change  
\*----------------------------------------------------------------------------*/
function passwordChange() {
  var email = queryVariable("email");
  var secret_key = queryVariable("key");

  var password = document.login_form.password.value;
  var password_confirm = document.login_form.password_confirm.value;

  var enviar = document.getElementsByTagName("button");

  // API's config 
  var endpoint = "/user-forgot-password/reset-password";

  var request = "&email=" + email + 
                "&password=" + password + 
                "&password_confirm=" + password_confirm +
                "&secret_key=" + secret_key;

  // while(password.value !== password_confirm.value || 
  //       password.value === null || 
  //       password.value === "" ||
  //       password_confirm.value === null || 
  //       password_confirm.value === "") {
  //   enviar[0].removeAttribute("disabled");    
  // }


  $.ajax({
    url: api_url + endpoint,
    type: 'POST',
    crossDomain: true,
    data: request,
    statusCode: {
      200: function(data_server) {
        // window.location = "dashboard.html"; 
      }
      ,400: function(data_server) { 
      }
    }
  });
}

function queryVariable(param) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
         var pair = vars[i].split("=");
         if(pair[0] == param){return pair[1];}
  }
  return(false);
}