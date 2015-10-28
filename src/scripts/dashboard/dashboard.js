(function validateCookie() {
  "use strict";

  // API's config 
  var endpoint = "/users";
  var user_id = "/" + getCookie("family_id"); 
  var api_key = getCookie("family_key");
  console.log(user_id);
  console.log(api_key);

  $.ajax({
    url: api_url + endpoint + user_id,
    type: "GET",
    crossDomain: true,
    data: "&api_key=" + api_key
  });
})();

function getCookie (name) {
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