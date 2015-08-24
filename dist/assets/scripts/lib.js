/*----------------------------------------------------------------------------*\
    $Global Variables
\*----------------------------------------------------------------------------*/
var api_url = "http://api.nueta/";
var flash = document.getElementById('flash');


/*----------------------------------------------------------------------------*\
    $FadeIn Effect
\*----------------------------------------------------------------------------*/
function fadeIn(el) {
  var opacity = 0;

  el.style.opacity = 0;
  el.style.filter = '';
  el.style.display = 'block';

  var last = +new Date();

  var tick = function() {
    opacity += (new Date() - last) / 400;
    el.style.opacity = opacity;
    el.style.filter = 'alpha(opacity=' + (100 * opacity)|0 + ')';

    last = +new Date();

    if (opacity < 1) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) 
      || setTimeout(tick, 16);
    }
  };

  tick();
}

/*----------------------------------------------------------------------------*\
    $Ajax to parse user's info 
\*----------------------------------------------------------------------------*/
// $(document).ready(function() {

//   // API's config 
//   var user_endpoint = "users/";
//   var user_id = "38";
//   var api_key = "?api_key=LAK2La6084ac4f20de47b82ba1K3hj3hH32KS301SA2";


//   $.ajax({
//     url: api_url + user_endpoint + user_id + api_key,
//     type: 'GET',
//     crossDomain: true,
//     statusCode: {
//       200: function(data) { 
//         console.log(data);

//         var telephoneField = document.querySelectorAll('.telephone');
//         var nameField = document.querySelectorAll('.name');
//         var emailField = document.querySelectorAll('.email');
//         var profilePicture = document.querySelectorAll('.profile_picture_url');

//         for (var i = 0; i <= telephoneField.length - 1; i++) {
//           telephoneField[i].innerHTML = data.telephone;
//           nameField[i].innerHTML = data.name;
//           emailField[i].innerHTML = data.email;
//           profilePicture[i].innerHTML = data.profile_picture_url;
//         };
        
//       } // Ok
//       ,400: function(msg) { 
//         console.log(msg);
//       } // Bad Request
//       ,404: function(msg) { 
//         console.log(msg); 
//       } // Not Found
//     }
//   });
// });

/*----------------------------------------------------------------------------*\
    $Modal 
\*----------------------------------------------------------------------------*/
var modal = $(".confirm-modal");
var title = $(".confirm-modal h3");
var avatar = $(".confirm-modal img");
var description = $(".confirm-modal p");
var button = $(".confirm-modal .btn");

function displayModal(mode) {

  if (button.hasClass("btn-danger")) {
    button.removeClass("btn-danger");
    button.addClass("btn-success");
  };

  if(mode === "lock"){
    title[0].innerHTML = "Lock your phone";
    avatar[0].src = "assets/images/ic_phonelink_lock_black_48px.svg";
    description[0].innerHTML = "You can lock your phone and combine with others actions";
    button[0].innerHTML = "Lock";
    button[0].setAttribute("onclick","confirmModal('lock');")
  }

  if(mode === "ring"){
    title[0].innerHTML = "Ring your phone";
    avatar[0].src = "assets/images/ic_speaker_phone_black_48px.svg";
    description[0].innerHTML = "You can lock your phone and combine with others actions";
    button[0].innerHTML = "Ring";
    button[0].setAttribute("onclick","notification('ring');")
  }
  
  if(mode === "pattern"){
    title[0].innerHTML = "Change the lock pattern of your phone";
    avatar[0].src = "assets/images/ic_dialpad_black_48px.svg";
    description[0].innerHTML = "You can lock your phone and combine with others actions";
    button[0].innerHTML = "Change";
  }
  
  if(mode === "wipe"){
    title[0].innerHTML = "Wipe your phone";
    avatar[0].src = "assets/images/ic_phonelink_erase_black_48px.svg";
    description[0].innerHTML = "You can lock your phone and combine with others actions";
    button[0].innerHTML = "Wipe";
    button[0].setAttribute("onclick","confirmModal('wipe');")

    button.removeClass("btn-success");
    button.addClass("btn-danger");
  }
  modal.fadeIn("slow");
}

/*----------------------------------------------------------------------------*\
    $Confirm Modal 
\*----------------------------------------------------------------------------*/
function confirmModal(mode) {

  title[0].innerHTML = "Confirm your password";
  avatar[0].parentNode.parentNode.remove(this);
  description[0].innerHTML = "<input type='password' name='confirm[password]' id='confirm[password]'/>";

  if(mode === "lock"){
    button[0].innerHTML = "Lock";
    button[0].setAttribute("onclick","notification('lock');")
  }
  
  if(mode === "pattern"){
    button[0].innerHTML = "Change";
  }
  
  if(mode === "wipe"){
    button[0].innerHTML = "Wipe";
    button[0].setAttribute("onclick","notification('wipe');")

    button.removeClass("btn-success");
    button.addClass("btn-danger");
  }
  modal.fadeIn("slow");
}

/*----------------------------------------------------------------------------*\
    $Ajax to parse notifications  
\*----------------------------------------------------------------------------*/
function notification(type) {
  // API's config 

  var endpoint = "notification-messages";
  var api_key = "&api_key=LAK2La6084ac4f20de47b82ba1K3hj3hH32KS301SA2";
  var password_input = document.getElementsByName("confirm[password]");
  var password = "&password=" + password_input[0].value;

  var code = "&code=";
  var event_id = "&event_id=";
  var data = "&data={}";
  var uuid = guid();

  if (type == "lock") {
    code += "device:locked";
    flash.innerHTML += "<p>Device locked.</p>";
  };

  if (type == "unlock") {
    code += "device:unlocked";
    flash.innerHTML += "<p>Device unlocked.</p>";
  };

  if (type == "ring") {
    code += "buzzer/turn-on";
    flash.innerHTML += "<p>Device ringing.</p>";
  };

  if (type == "wipe") {
    code += "device:wipe";
    flash.innerHTML += "<p>Device's data wiped.</p>";
  };

  event_id += uuid;

  request = code + data + event_id;

  if (type !== "ring") {
    request += password;
  };

  $.ajax({
    url: api_url + endpoint,
    type: 'POST',
    data: request + api_key,
    crossDomain: true,
    statusCode: {
      202: function(msg) { 
        console.log(msg);
      } // Ok
      ,400: function(msg) { 
        console.log(msg);
      } // Bad Request
      ,404: function(msg) { 
        console.log(msg); 
      } // Not Found
    }
  });

  $(".confirm-modal").fadeOut("slow");

  flash.className += " alert-success";
  fadeIn(flash);
}

/*----------------------------------------------------------------------------*\
    $Event ID generator 
\*----------------------------------------------------------------------------*/
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

/*----------------------------------------------------------------------------*\
    $Geolocation
\*----------------------------------------------------------------------------*/
var watchId = null;

function geo_location() {
  if (navigator.geolocation) {
    var optn = {
      enableHighAccuracy : true,
      timeout : Infinity,
      maximumAge : 0
    };

    watchId = navigator.geolocation.getCurrentPosition(showPosition, showError, optn);
  } else {
    flash.innerHTML += "<p>Geolocation is <strong>not</strong> supported in your browser.</p>";
    fadeIn(flash);
  }
}

function showPosition(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  var googlePos = new google.maps.LatLng(latitude, longitude);
  var mapOptions = {
      zoom : 15,
      center : googlePos,
      mapTypeId : google.maps.MapTypeId.ROADMAP
  };
  var mapObj = document.getElementById('mapdiv');
  var googleMap = new google.maps.Map(mapObj, mapOptions);
  var markerOpt = {
      map : googleMap,
      position : googlePos,
      title : 'Hi , I am here',
      animation : google.maps.Animation.DROP
  };
  var googleMarker = new google.maps.Marker(markerOpt);
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    'latLng' : googlePos
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          var popOpts = {
            content : results[1].formatted_address,
            position : googlePos
          };
        var popup = new google.maps.InfoWindow(popOpts);
        google.maps.event.addListener(googleMarker, 'click', function() {
          popup.open(googleMap);
        });
      } else {
          flash.innerHTML += "<p>No results found.</p>";
      }
    } else {
        flash.inerHTLM += "<p>Geocoder failed due to: " + status + "</p>";
    }
  });

  fadeIn(mapObj);
}

function stopWatch() {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

function showError(error) {
  switch(error.code) {
    case error.code == 1 || error.PERMISSION_DENIED:
      flash.innerHTML += "<p>User denied the request for Geolocation.</p>";
      fadeIn(flash);
    break;
    case error.code == 2 || error.POSITION_UNAVAILABLE:
      flash.innerHTML += "<p>Location information is unavailable.</p>";
      fadeIn(flash);
    break;
    case error.code == 3 || error.TIMEOUT:
      flash.innerHTML += "<p>The request to get user location timed out.</p>";
      fadeIn(flash);
    break;
    case error.code == 0 || error.UNKNOWN_ERROR:
      flash.innerHTML += "<p>An unknown error occurred.</p>";
      fadeIn(flash);
    break;
  }
}

/*----------------------------------------------------------------------------*\
    $Resize
\*----------------------------------------------------------------------------*/
function resizeSidebar() {
  var windowHeight = window.innerHeight;
  var windowWidth = window.innerWidth;
  var sideBar = $('.sidebar');
  var topBar = $('.top');
  var section = $('.content');
  var map = $('#mapdiv');
  sideBar.css("height", windowHeight - topBar.innerHeight());
  section.css("width", windowWidth - sideBar.innerWidth());
  section.css("height", windowHeight - topBar.innerHeight());
  map.css("width", windowWidth - sideBar.innerWidth());
  map.css("height", windowHeight - topBar.innerHeight());
}

/*----------------------------------------------------------------------------*\
    $Calls 
\*----------------------------------------------------------------------------*/
$(".user-config").click(function() {
  $(".config-box").toggle();
});

$(".confirm-modal .close").click(function() {
  $(this).parent().fadeOut("slow");
});