/*******************************************************************************
* Global Variables
*******************************************************************************/
var err = document.getElementById('flash');

/*******************************************************************************
* Fade In effect
*******************************************************************************/
// function fadeIn(el) {
//   var opacity = 0;

//   el[0].style.opacity = 0;
//   el[0].style.filter = '';
//   el[0].style.display = 'block';

//   var last = +new Date();

//   var tick = function() {
//     opacity += (new Date() - last) / 400;
//     el[0].style.opacity = opacity;
//     el[0].style.filter = 'alpha(opacity=' + (100 * opacity)|0 + ')';

//     last = +new Date();

//     if (opacity < 1) {
//       (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
//     }
//   };

//   tick();
// }

/*******************************************************************************
* Ajax function to parse JSONP
*******************************************************************************/
$(document).ready(function() {

  // API's config 
  var url = 'http://api.nueta/';
  var webFunctions_endpoint = "notification-messages"
  var user_endpoint = "users/";
  var user_id = "38";
  var api_key = "?api_key=LAK2La6084ac4f20de47b82ba1K3hj3hH32KS301SA2";


  $.ajax({
    url: url+user_endpoint+user_id+api_key,
    type: 'GET',
    crossDomain: true,
    statusCode: {
      200: function(data) { console.log(data);

        var telephoneField = document.querySelector('.telephone');
        var nameField = document.querySelector('.name');
        var emailField = document.querySelector('.email');
        var profilePicture = document.querySelector('.profile_picture_url');
        // var userID = document.querySelector('.user_id');
        // var type = document.querySelector('.type');
        // var gender = document.querySelector('.gender');

        // var fadeInFields = document.getElementsByClassName('field');
        
        telephoneField.innerHTML = data.telephone;
        nameField.innerHTML = data.name;
        emailField.innerHTML = data.email;
        profilePicture.innerHTML = data.profile_picture_url;
        // userID.innerHTML = data.id;
        // type.innerHTML = data.type;
        // gender.innerHTML = data.gender;

        // if (endereco.style.display != 'block') {
        //   fadeIn(fadeInFields);
        // };

        // err.innerHTML += "<p>"+ data.name +"</p>";
      } // Ok
      ,400: function(msg) { 
        console.log(msg);
      } // Bad Request
      ,404: function(msg) { 
        console.log(msg); 
      } // Not Found
    }
  });
});

/*******************************************************************************
* Geoloc
*******************************************************************************/
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
    err.innerHTML += "<p>Geolocation is <strong>not</strong> supported in your browser.</p>";
    fadeIn(err);
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
          err.innerHTML += "<p>No results found.</p>";
      }
    } else {
        err.inerHTLM += "<p>Geocoder failed due to: " + status + "</p>";
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
      err.innerHTML += "<p>User denied the request for Geolocation.</p>";
      fadeIn(err);
    break;
    case error.code == 2 || error.POSITION_UNAVAILABLE:
      err.innerHTML += "<p>Location information is unavailable.</p>";
      fadeIn(err);
    break;
    case error.code == 3 || error.TIMEOUT:
      err.innerHTML += "<p>The request to get user location timed out.</p>";
      fadeIn(err);
    break;
    case error.code == 0 || error.UNKNOWN_ERROR:
      err.innerHTML += "<p>An unknown error occurred.</p>";
      fadeIn(err);
    break;
  }
}

/*******************************************************************************
* Resize
*******************************************************************************/
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

/*******************************************************************************
* Modal
*******************************************************************************/
function displayModal(mode) {

  // var modal = document.getElementsByClassName("confirm-modal");
  var modal = $(".confirm-modal");

  var title = $(".confirm-modal h3");
  var avatar = $(".confirm-modal img");
  var description = $(".confirm-modal p");
  var button = $(".confirm-modal .btn");

  if (button.hasClass("btn-danger")) {
    button.removeClass("btn-danger");
    button.addClass("btn-success");
  };

  if(mode == "lock"){
    title[0].innerHTML = "Lock your phone";
    avatar[0].src = "assets/images/ic_phonelink_lock_black_48px.svg";
    description[0].innerHTML = "You can lock your phone and combine with others actions";
    button[0].innerHTML = "Lock";
  }

  if(mode == "ring"){
    title[0].innerHTML = "Ring your phone";
    avatar[0].src = "assets/images/ic_speaker_phone_black_48px.svg";
    description[0].innerHTML = "You can lock your phone and combine with others actions";
    button[0].innerHTML = "Ring";
  }
  
  if(mode == "pattern"){
    title[0].innerHTML = "Change the lock pattern of your phone";
    avatar[0].src = "assets/images/ic_dialpad_black_48px.svg";
    description[0].innerHTML = "You can lock your phone and combine with others actions";
    button[0].innerHTML = "Change";
  }
  
  if(mode == "wipe"){
    title[0].innerHTML = "Wipe your phone";
    avatar[0].src = "assets/images/ic_phonelink_erase_black_48px.svg";
    description[0].innerHTML = "You can lock your phone and combine with others actions";
    button[0].innerHTML = "Wipe";

    button.removeClass("btn-success");
    button.addClass("btn-danger");
  }
  modal.fadeIn("slow");
}

$(".confirm-modal .close").click(function() {
    $(this).parent().fadeOut("slow");
  });

