var api_url = "http://familyhomol.eokoe.com";
var user_id = getCookie("family_id"); 
var api_key = getCookie("family_key");
/*----------------------------------------------------------------------------*\
    $Validation 
\*----------------------------------------------------------------------------*/
function validate(element) {
  "use strict";

  var email_error = document.querySelector(".email_return");
  var pass_error = document.querySelector(".password_return");

  if (element.value === null || element.value === "") {

    if (element.name == "email") {

      if (email_error.innerHTML === "") {
        email_error.innerHTML += "Campo requerido";
      }

      if (element.parentNode.classList != "error") {
        document.login_form.email.parentNode.className += " error";
      }
    }

    if (element.name == "password") {

      if (pass_error.innerHTML === "") {
        pass_error.innerHTML += "Campo requerido";
      }

      document.login_form.password.parentNode.className += " error";
    }

  } else {

    if (document.login_form.email.parentNode.classList.contains("error")) {
        email_error.innerHTML = "";
        document.login_form.email.parentNode.className = "form__field";
    }

    if (document.login_form.password.parentNode.classList.contains("error")) {
      pass_error.innerHTML = "";
      document.login_form.password.parentNode.className = "form__field";
    }
  }
}

/*----------------------------------------------------------------------------*\
    $Ajax Login  
\*----------------------------------------------------------------------------*/
function getCredentials() {
  "use strict";

  var username = document.login_form.email.value;
  var password = document.login_form.password.value;
  login(username,password);
}

function login(user,pass) {
  "use strict";

  // API's config 
  var endpoint = "/login";

  $.ajax({
    url: api_url + endpoint,
    type: "POST",
    crossDomain: true,
    data: "&email=" + user + "&password=" + pass + "&is_mobile=0",
    statusCode: {
      200: function(data_server) { 
        var api_key = data_server.api_key;
        var id = data_server.id;
        setCookie(id, api_key);
        window.location = "/dashboard"; 
      },
      400: function(data_server) { 
      }
    }
  });
}

/*----------------------------------------------------------------------------*\
    $Cookie handling 
\*----------------------------------------------------------------------------*/
function validateCookie() {
  "use strict";

  // API's config 
  var endpoint = "/users";

  $.ajax({
    url: api_url + endpoint + "/" + user_id,
    type: "GET",
    crossDomain: true,
    data: "&api_key=" + api_key,
    statusCode: {
      200: function(data) { 
        window.location = "/dashboard";
      },
      400: function(data) { 
        $("#login").show();
      },
      403: function(data) { 
        $("#login").show();
      }   
    }
  }); 
}

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

function setCookie(id, api_key) {
  var exp = new Date();     //set new date object
  var expires = exp.setTime(exp.getTime() + (1000 * 60 * 60 * 24 * 30));     //set it 30 days ahead 
  var idCookie = document.cookie = "family_id=" + escape(id) + "; path=/; expires=" + expires +";";
  var keyCookie = document.cookie = "family_key=" + escape(api_key) + "; path=/; expires=" + expires +";";
}

/*----------------------------------------------------------------------------*\
    $Calls 
\*----------------------------------------------------------------------------*/
(function() {
  $("#login").hide();
  if (document.cookie.contains("family_id") && document.cookie.contains("family_key")) {
    validateCookie();
  } else {
    $("#login").show();
  }
})();