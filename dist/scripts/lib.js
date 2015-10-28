/*----------------------------------------------------------------------------*\
    $Global Variables
\*----------------------------------------------------------------------------*/
var api_url = "http://familyhomol.eokoe.com";
var flash = document.getElementById("flash");
// var user_id = getCookie("family_id"); 
// var api_key = getCookie("family_key");

/*----------------------------------------------------------------------------*\
    $FadeIn Effect
\*----------------------------------------------------------------------------*/
function fadeIn(el) {
  "use strict";

  var opacity = 0;

  el.style.opacity = 0;
  el.style.filter = "";
  el.style.display = "block";

  var last = +new Date();

  var tick = function() {
    opacity += (new Date() - last) / 400;
    el.style.opacity = opacity;
    el.style.filter = "alpha(opacity=" + (100 * opacity)|0 + ")";

    last = +new Date();

    if (opacity < 1) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
    }
  };

  tick();
}