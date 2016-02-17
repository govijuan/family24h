/*----------------------------------------------------------------------------*\
    $Modal
\*----------------------------------------------------------------------------*/
var modal = $("#myModal");
var title = $("#myModal .modal-title");
var avatar = $("#myModal .modal-body .avatar img");
var description = $("#myModal .modal-body p");
var button = $("#myModal .modal-footer .btn");
var googleMap;
var data_location;

function displayModal(mode) {
    "use strict";

    $("#myModal .modal-body .col-xs-3").show();

    if (button.hasClass("btn-danger")) {
        button.removeClass("btn-danger");
        button.addClass("btn-success");
    }

    if (mode === "lock") {
        title[0].innerHTML = tr("Mark as stolen");
        avatar[0].src = "/images/ic_phonelink_lock_black_48px.svg";
        var contents = tr("You are about to mark this device as stolen")+".<br />";
        contents += tr("This inplies in") + ":<br /><br /><ul>";
        contents += "<li>" + tr("You must create a new unlock code for the device") + "</li>";
        contents += "<li>" + tr("For each unlock attempt a picture of the front camera will be taken") + "</li>";
        contents += "<li>" + tr("Each unlock attempt will send the device location") + "</li>";
        contents += "<li>" + tr("This functionality will be deactivated only when is unlocked by entering the new unlock code") + "</li>";
        contents += "</ul>";
        description[0].innerHTML = contents;
        button[0].innerHTML = tr("Continue");
        button[0].setAttribute("onclick", "confirmModal('lock');");
    }

    if (mode === "ring") {
        title[0].innerHTML = tr("Ring your phone");
        avatar[0].src = "/images/ic_speaker_phone_black_48px.svg";
        description[0].innerHTML = tr("You can ring your phone");
        button[0].innerHTML = tr("Ring");
        button[0].setAttribute("onclick", "notification('ring');");
    }

    if (mode === "wipe") {
        title[0].innerHTML = tr("Wipe your phone");
        avatar[0].src = "/images/ic_phonelink_erase_black_48px.svg";
        description[0].innerHTML = "<strong>" + tr("Attention") + ":</strong><br />" + tr("You can wipe your phone");
        button[0].innerHTML = tr("Continue");
        button[0].setAttribute("onclick", "confirmModal('wipe');");

        button.removeClass("btn-success");
        button.addClass("btn-danger");
    }
	resetMessage($("#flash-modal"));
    modal.modal();
}

/*----------------------------------------------------------------------------*\
    $Confirm Modal
\*----------------------------------------------------------------------------*/
function confirmModal(mode) {
    "use strict";

//    avatar[0].parentNode.parentNode.hide();
    $("#myModal .modal-body .col-xs-3").hide();

    if (mode === "lock") {
        title[0].innerHTML = tr("Insert a new unlock code");
        description.empty();
        description.append("<div class='row'><div class='col-sm-7 fields'></div><div class='col-sm-5 obs'></div></div>");
        $(description).find(".fields").append(tr("App Login Password") + ":<br /><input type='password' name='confirm[password]' id='confirm[password]'/><br /><br />");
        $(description).find(".fields").append(tr("New Unlock Password") + ":<br /><input type='password' name='new[password]' id='new[password]'/><br />");
        $(description).find(".fields").append(tr("Confirm Unlock Password") + ":<br /><input type='password' name='new_conf[password]' id='new_conf[password]'/><br />");
        $(description).find(".obs").append("<div class='hidden-xs'><br /><br /><br /><br /><br /></div>");
        $(description).find(".obs").append("<small>- "+tr("Password must be between 5 and 10 digits") + "<br /></small>");
        $(description).find(".obs").append("<small>- "+tr("Password can be letters or numbers") + "<br /></small>");

        button[0].innerHTML = tr("Lock");
        button[0].setAttribute("onclick", "notification('lock');");
    }

    if (mode === "wipe") {
        title[0].innerHTML = tr("Confirm your password");
        description.empty();
        description.append(tr("App Login Password") + ":<br /><input type='password' name='confirm[password]' id='confirm[password]'/><br />");
        button[0].innerHTML = tr("Wipe");
        button[0].setAttribute("onclick", "notification('wipe');");

        button.removeClass("btn-success");
        button.addClass("btn-danger");
    }
    modal.modal();
}

/*----------------------------------------------------------------------------*\
    $Ajax to parse notifications
\*----------------------------------------------------------------------------*/
function notification(type) {
    "use strict";

    if (type == "lock" || type == "wipe") {
      var password_input = document.getElementsByName("confirm[password]");
      if (type == "lock") {
        var newpassword_input = document.getElementsByName("new[password]");
        var confpassword_input = document.getElementsByName("new_conf[password]");
        if (newpassword_input[0].value != confpassword_input[0].value){
          setMessage(tr("Invalid password confirmation"),"danger",$("#flash-modal"));
          return false;
        }else if ($(newpassword_input).val().length < 5 || $(newpassword_input).val().length > 10){
          setMessage(tr("Password must be between 5 and 10 digits"),"danger",$("#flash-modal"));
          return false;
        }
      }
      if (password_input[0].value == ""){
        setMessage(tr("Invalid Login App Password"),"danger",$("#flash-modal"));
        return false;
      }
      
      var endpoint = "/users/" + user_id;
      var password = "&password=" + password_input[0].value + "&current_password=" + password_input[0].value;

      $.ajax({
        url: api_url + endpoint,
        type: "PUT",
        data: password + "&api_key=" + api_key,
        crossDomain: true,
        complete: function(e, xhr, settings){
          if(e.status === 200 || e.status === 202){
          sendCommand(type);
          }
        },
        error: function(xhr, status, error){
          console.log(xhr);
          setMessage(tr("Wrong password"),"danger",$("#flash-modal"));
        }
      });
    }else{
      sendCommand(type);
    }
}

function sendCommand(type){

    // API's config
    var endpoint = "/notification-messages";
    if (type != "ring") {
      if (type == "lock") {
        var password_input = document.getElementsByName("new[password]");
      }else{
        var password_input = document.getElementsByName("confirm[password]");
      }
      var password = "&password=" + password_input[0].value;
    }else{
        var password = "";
    }
    var code = "&code=";
    var event_id = "&event_id=";
    var data = "&data={}";
    var uuid = guid();

    if (type == "lock") {
        code += "device:locked";
    }

    if (type == "unlock") {
        code += "device:unlocked";
    }

    if (type == "ring") {
        code += "buzzer/turn-on";
    }

    if (type == "wipe") {
        code += "device:wipe";
    }

    event_id += uuid;

    var request = code + data + event_id;

    if (type == "lock" || type == "wipe") {
        request += password;
    }
//    endpoint = "/abc";
    $.ajax({
        url: api_url + endpoint,
        type: "POST",
        data: request + "&api_key=" + api_key,
        crossDomain: true,
        complete: function(e, xhr, settings){
            if(e.status === 200 || e.status === 202){
                var msg = "";
                if (type == "lock") {
                  msg += tr("Device marked as stolen");
                  setMessage(msg,"success");
                }

                if (type == "unlock") {
                  msg += tr("Device unmarked as stolen");
                  setMessage(msg,"success");
                }

                if (type == "ring") {
                  msg += tr("Device ringing");
                  setMessage(msg,"success");
                }

                if (type == "wipe") {
                  msg += tr("Device's data wiped");
                  setMessage(msg,"success");
                }
            }
        },
        error: function(xhr, status, error){
            console.log(xhr);
            setMessage(tr("Error sending command") + " (" + xhr.status + ")","danger");
        }
    });

    modal.modal("hide");
}

/*----------------------------------------------------------------------------*\
    $setMessage
\*----------------------------------------------------------------------------*/
function setMessage(msg, status, target){
	if (!target) target = flash;
    target.find(".message").empty();
    target.find(".message").append(msg);
    target.removeClass("alert-success alert-info alert-warning alert-danger");
    target.addClass("alert-" + status);
    target.fadeIn("slow");
}
function resetMessage(target){
	if (!target) target = flash;
    target.find(".message").empty();
    target.removeClass("alert-success alert-info alert-warning alert-danger");
    target.hide();
}

/*----------------------------------------------------------------------------*\
    $Geolocation
\*----------------------------------------------------------------------------*/
var watchId = null;


function showPosition(position) {
    "use strict";

//    var latitude = position.coords.latitude;
//    var longitude = position.coords.longitude;
    var latitude = data_location.latitude;
    var longitude = data_location.longitude;

    var googlePos = new google.maps.LatLng(latitude, longitude);
    var mapOptions = {
        zoom: 15,
        center: googlePos,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var mapObj = document.getElementById('mapdiv');
    googleMap = new google.maps.Map(mapObj, mapOptions);
    var markerOpt = {
        map: googleMap,
        position: googlePos,
        title: 'Hi , I am here',
        animation: google.maps.Animation.DROP
    };
    var googleMarker = new google.maps.Marker(markerOpt);
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        'latLng': googlePos
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                var popOpts = {
                    content: results[1].formatted_address,
                    position: googlePos
                };
                var popup = new google.maps.InfoWindow(popOpts);
                google.maps.event.addListener(googleMarker, 'click', function() {
                    popup.open(googleMap);
                });
            } else {
                setMessage("No results found.","warning");
            }
        } else {
            setMessage("Geocoder failed due to: " + status,"warning");
        }
    });
    var t_map = setTimeout(function(){
        google.maps.event.trigger(mapObj, 'resize');
    },2000);
    google.maps.event.addDomListener(window, 'resize', function() {
        centerMap();
    });
}

function centerMap(){
    if (data_location && googleMap){
        var latitude = data_location.latitude;
        var longitude = data_location.longitude;
        var googlePos = new google.maps.LatLng(latitude, longitude);
        googleMap.setCenter(googlePos);
    }
}

function stopWatch() {
    "use strict";

    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

/*----------------------------------------------------------------------------*\
    $Resize
\*----------------------------------------------------------------------------*/
function resizeSidebar() {

    "use strict";

    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;
    var sideBar = document.getElementsByClassName("button__bar");
    var topBar = document.getElementsByClassName("top");
    var map = document.getElementById("mapdiv");

    if (windowWidth > 991){
      sideBar[0].style.height = windowHeight - topBar[0].offsetHeight + "px";
      map.style.height = windowHeight - topBar[0].offsetHeight + "px";
    }else{
      sideBar[0].style.height = "auto";
      map.style.height =  windowHeight - topBar[0].offsetHeight + "px";
    }

    centerMap();

}

/*----------------------------------------------------------------------------*\
    $getTrack
\*----------------------------------------------------------------------------*/
function getTrack() {
    if (api_key) {

        // API's config
        var endpoint = "/device-tracks";

        $.ajax({
            url: api_url + endpoint,
            type: "GET",

            crossDomain: true,
            data: "&api_key=" + api_key,
            statusCode: {
                200: function(data) {
                    if (data.tracks){
                      if (data.tracks[0].location){
                        data_location = data.tracks[0].location;
                        showPosition();
                      }
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
            onerror()
        }
    }
}

/*----------------------------------------------------------------------------*\
    $Ajax to parse user's info
\*----------------------------------------------------------------------------*/
$(document).ready(function() {

    validateCookie(function() {

            var telephoneField = document.querySelectorAll('.telephone');
            var nameField = document.querySelectorAll('.name');
            var emailField = document.querySelectorAll('.email');
            var profilePicture = document.querySelectorAll('.profile_picture_url');

            for (var i = 0; i <= telephoneField.length - 1; i++) {
                telephoneField[i].innerHTML = user_data.telephone;
                nameField[i].innerHTML = user_data.name;
                emailField[i].innerHTML = user_data.email;
                profilePicture[i].innerHTML = user_data.profile_picture_url;
            }



            $(".dashboard-content").show();

            $('.preloader').fadeOut('fast');

        },
        __default_cookie_error
    );



    /*----------------------------------------------------------------------------*\
        $Calls
    \*----------------------------------------------------------------------------*/
    $(".user-config").click(function() {
        $(".config-box").toggle();
    });

    $("#flash .close,#flash-modal .close").click(function() {
        $(this).parent().fadeOut("slow");
    });


});



/*----------------------------------------------------------------------------*\
    Waits page complete load to trigger the resizeSidebar function
\*----------------------------------------------------------------------------*/
$(document).ready(function() {
	$(".button__bar .buttons a p").each(function(index,item){
		$(item).html(tr($(item).html()));
	});
    resizeSidebar();
});
if (window.addEventListener) {
	window.addEventListener('load', resizeSidebar, false);
} else {
	window.attachEvent('onload', resizeSidebar);
}


window.addEventListener('orientationchange', resizeSidebar, false);
window.addEventListener('resize', resizeSidebar, false);
var load_map = setTimeout(getTrack(),2000);
