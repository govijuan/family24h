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
        api_key='';
        window.location = "/login";
      },
      400: function(data) {
        api_key='';
        window.location = "/login";
      },
      403: function(data) {
        api_key='';
        window.location = "/login";
      }
    }
  });
})();

