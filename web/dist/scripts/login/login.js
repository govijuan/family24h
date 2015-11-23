
/*----------------------------------------------------------------------------*\
    $Validation
\*----------------------------------------------------------------------------*/
function validate(element) {
    "use strict";

    var email_error = document.querySelector(".email_return");
    var pass_error = document.querySelector(".password_return");

var ok = 1;
    if (element.value === null || element.value === "") {

        if (element.name == "email") {

            if (email_error.innerHTML === "") {
                email_error.innerHTML += "Campo requerido";
                ok =0;
            }

            if (element.parentNode.classList != "error") {
                document.login_form.email.parentNode.className += " error";
            }
        }

        if (element.name == "password") {

            if (pass_error.innerHTML === "") {
                pass_error.innerHTML += "Campo requerido";
                ok =0;
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

    return ok;
}


/*----------------------------------------------------------------------------*\
    $Ajax Login
\*----------------------------------------------------------------------------*/
function getCredentials(e) {
    "use strict";

    e.stopPropagation();

    if (validate(document.login_form.email) + validate(document.login_form.password) == 2){
        var username = document.login_form.email.value;
        var password = document.login_form.password.value;
        login(username, password);
    }
    return false;
}

function login(user, pass) {
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
                setCookie(data_server.id, data_server.api_key);
                window.location = "/dashboard";
            },
            400: function(data_server) {
                alert("Erro ao fazer login");
            }
        }
    });
}



$('form.login_form').on('submit', getCredentials);


validateCookie(
    function() {
        window.location = "/dashboard";
    },
    function() {
        var elm = $("form.login_form");

        if (elm[0]) {
            elm.removeClass('hide');
        } else {
            window.location = "/login";
        }

    }

);
