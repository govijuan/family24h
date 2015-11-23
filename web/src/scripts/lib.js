/*----------------------------------------------------------------------------*\
    $Global Variables
\*----------------------------------------------------------------------------*/
var api_url = "http://familyhomol.eokoe.com";
var flash = $("#flash");

var user_id = getCookie("family_id");
var api_key = getCookie("family_key");
var user_data = {};

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
            onerror(data)
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
    var expires = exp.setTime(exp.getTime() + (1000 * 60 * 60 * 24 * 30)); //set it 30 days ahead
    var idCookie = document.cookie = "family_id=" + escape(id) + "; path=/; expires=" + expires + ";";
    var keyCookie = document.cookie = "family_key=" + escape(api_key) + "; path=/; expires=" + expires + ";";
}