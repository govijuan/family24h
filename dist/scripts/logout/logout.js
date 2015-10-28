var api_url = "http://familyhomol.eokoe.com";
var user_id = getCookie("family_id"); 
var api_key = getCookie("family_key");

/*----------------------------------------------------------------------------*\
    $Logout 
\*----------------------------------------------------------------------------*/
(function () {
  "use strict";

  // API's config 
  var endpoint = "/logout";

  $.ajax({
    url: api_url + endpoint,
    type: "POST",
    crossDomain: true,
    data: "?&api_key=" + api_key,
    statusCode: {
      200: function(data) { 
        window.location = "/";
      },
      400: function(data) { 
        window.location = "/dashboard";
      },
      403: function(data) { 
        window.location = "/dashboard";
      }   
    }
  }); 
})();

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