/*----------------------------------------------------------------------------*\
    $Modal
\*----------------------------------------------------------------------------*/
var modal = $("#myModal");
var title = $("#myModal .modal-title");
var avatar = $("#myModal .modal-body .avatar img");
var description = $("#myModal .modal-body p");
var button = $("#myModal .modal-footer .btn");
var googleMap;
var markers = [];
var markerClusterer;
var popupIW = null;
var data_location;
var group_list, member_list, member_history, fences_list;
var group_id = null, member_id = null;
var members_alias = [];
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var calendarSet = false;
var drawingManager, fencePolygon;
var loading_message = false;
var bs_viewport;
var currentInvitesLength = 0;
var currGroupName = '';
var currGroupHeaderBG_URL = '';
String.prototype.upperfirst = function(){return this.charAt(0).toUpperCase() + this.slice(1);}

if (!String.prototype.render) {
  String.prototype.render = function(args) {
    var copy = this + '';
    for (var i in args) {
      copy = copy.replace(RegExp('\\$\\$' + i, 'g'), args[i]);
    }
    return copy;
  };
}

$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++){
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  },
  getUrlSub: function(){
    var hash = location.hash;
    var url_split = hash.split("#!");
    if (url_split.length > 1){
      var url_split_sub = url_split[1].split("/");
      if (url_split_sub.length > 1){
        var url_sub = url_split_sub[1];
      }else{
        var url_sub = url_split[1];
      }
      var url_split_sub = url_sub.split("?");
      if (url_split_sub.length > 1){
        var url_sub = url_split_sub[0];
      }else{
        var url_sub = url_split_sub;
      }

    }else{
      var url_sub = "";
    }
    return url_sub;
  },
  getIdFromUrl: function(url){
    var split_url = url.split("/");
    if (split_url.length > 0){
      return split_url[split_url.length-1];
    }else{
      return null;
    }
  },
  scrollTo: function(target,element){
    $(target).animate({scrollTop: $(element).offset().top},'slow');
  }
});


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

function forcePosition(target){
    if (!target) target = user_id;
    var endpoint = "/users/"+target+"/real-time-positions";
    setMessage(tr("Sending request"),"warning");
    $.ajax({
        url: api_url + endpoint +'?api_key=$$key'.render({
        key: api_key
        }),
        data: "&group_id=" + group_id,
        type: "POST",
        crossDomain: true,
        complete: function(e, xhr, settings){
          if(e.status === 200 || e.status === 202){
              var msg = "";
              msg += tr("Request successful sent");
              setMessage(msg,"success");
          }
        },
        error: function(xhr, status, error){
          setMessage(tr("Error sending request") + " (" + xhr.status + ")","danger");
        }
    });
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
function setAcceptInviteMessage(msg, target, icon){
	target.children().hide(600);
	target.append("<div class='invite-icon-clicked' style='display: none'>" + icon + "</div>");
	target.append("<div class='invite-accept-msg' style='display: none'>" + msg + "</div>");
	target.find(".invite-accept-msg, .invite-icon-clicked").show(600);
}
function setAcceptErrorMessage(msg, target){
	target.children().hide(500);
	target.append("<div class='invite-error-msg' style='display: none'>" + msg + "</div>");
	target.find(".invite-error-msg").show(500);
	target.find(".invite-error-msg").delay(1000).hide(500);
	target.find(".invite-error-msg").remove();
	target.children().show(500);
	target.removeClass("accept-invite-msg-target");
}
function checkIfCouterIsCero(targetCounter, currentInvitesLength){
	if(currentInvitesLength <= 0){
		targetCounter.hide();
		$(".sem-convites").html(tr("No invites found"));
	       $(".sem-convites").show();
	}
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

    var t_map = setTimeout(function(){
        google.maps.event.trigger(mapObj, 'resize');
    },2000);
    google.maps.event.addDomListener(window, 'resize', function() {
        centerMap();
    });
}

function centerMap(){
    if (data_location && googleMap){
      if (markers.length > 0){
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++) {
         bounds.extend(markers[i].getPosition());
        }
        googleMap.fitBounds(bounds);
      }else{
        var latitude = data_location.latitude;
        var longitude = data_location.longitude;
        var googlePos = new google.maps.LatLng(latitude, longitude);
        googleMap.setCenter(googlePos);
      }
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
    var sideBar = $(".left__bar");
    var topSideBar = $(".left__bar .fixed-top");
    var bottomSideBar = $(".left__bar .fixed-bottom");
    var topBar = $(".top");
    var bottomBar = $(".bottom__bar");
    var map = $(".map");

    if ($(".left__bar .list-members").length > 0){
      var listMembers = $(".left__bar .list-members");
      var listMembersTop = $(".left__bar .list-members-top");
      $(listMembers).animate({
        height: windowHeight - (topBar[0].offsetHeight + bottomBar[0].offsetHeight + listMembersTop[0].offsetHeight + topSideBar[0].offsetHeight + bottomSideBar[0].offsetHeight) + "px"
      },"fast", function(){
        //$('.left__bar .list-members').jScrollPane();
      });
    }
    if ($(".left__bar .list-fences").length > 0){
      var listFences = $(".left__bar .list-fences");
      var listFencesTop = $(".left__bar .list-fences-top");
      var listFencesBottom = $(".left__bar .list-fences-bottom");
      $(listFences).animate({
        height: windowHeight - (topBar[0].offsetHeight + bottomBar[0].offsetHeight + listFencesTop[0].offsetHeight + listFencesBottom[0].offsetHeight + topSideBar[0].offsetHeight + bottomSideBar[0].offsetHeight) + "px"
      },"fast", function(){
        //$('.left__bar .list-fences').jScrollPane();
      });
    }
    if (windowWidth > 991){
      $(sideBar).animate({
        height: windowHeight - (topBar[0].offsetHeight + bottomBar[0].offsetHeight) + "px"
      },"fast");
      $(map).animate({
        height: windowHeight - (topBar[0].offsetHeight + bottomBar[0].offsetHeight) + "px"
      },"fast");
    }else{
      $(sideBar).css("height","auto");
      $(map).css("height", windowHeight - (topBar[0].offsetHeight + bottomBar[0].offsetHeight) + "px");
      //$(map).css("height", (windowHeight - topBar[0].offsetHeight) + "px");
    }

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

function initialize(callback,callback2){
  var endpoint = "/groups";
  $.ajax({
    type: 'GET',
    dataType: 'json',
    crossDomain: true,
    url: api_url + endpoint +'?api_key=$$key'.render({
        key: api_key
    }),
    success: function(data,status,jqXHR){
      if(jqXHR.status == 200){
        group_list = data.groups;
        $(".left__bar .fixed-top .contents").empty();//anterior
        $(".top-right-groups-wrap").empty();//novo
        $(".left__bar .fixed-top .contents").append("<div class='group-select'><select id='group-list'></select></div>");//anterior
        $(".top-right-groups-wrap").append("<div class='group-i-in-h glyphicon glyphicon-group-icon'></div>");
        $(".top-right-groups-wrap").append("<div class='group-in-header'></div>");//novo
        $(".top-right-groups-wrap").append("<div class ='users-groups-arrow glyphicon glyphicon-menu-down'></div>");
        $(".left__bar .left-contents").empty();//anterior
        $(".left__bar .left-contents").append("<div class='group-info'></div>");
        $(".left__bar .fixed-bottom").remove();
        $(".left__bar .group-info").after("<div class='fixed-bottom'></div>");
        //$(".groups-content-header").append("");//novo
        $(".group-in-header .nome-grupo-atual").remove();
        $(".groups-listing-container").append("<ul class='group-list-in-g-content'></ul>");
        
        $.each(group_list, function(index,item){
          if (index == 0 && $.getUrlVar("g") == undefined || $.getUrlVar("g") == item.id){
            if ($(".left__bar .group-info .info").length > 0) $(".left__bar .group-info .info").remove();
            $(".left__bar .group-info").append("<div class='info' id=''></div>");
            $(".left__bar .group-info .info").append("<div class='created-by item'><small>" + tr("Created by") + "</small><br />" + item.created_by.name + "</div>");
            $(".left__bar .group-info .info").append("<div class='members item'><a href='#' id='loadMembersMenu'>" + tr("Group members") + "</a></div>");
            $(".left__bar .group-info .info").append("<div class='members item'><a href='#' id='loadInvites'>" + tr("Manage invitations") + "</a></div>");//antiga
            $(".invites-box .invites-list .convites-title").html(tr("Invites"));
            grupoAtual = "<div class='grupo-atual-txt'>" + tr("Grupo Atual") + "</div>";
            $(".group-in-header").append(grupoAtual + "<div class='nome-grupo-atual' item-id='" + item.id + "'>" + item.data.name + "</div>");//novo
            $(".curr-group-info-in-h").prepend("<div class='curr-group-in-h-txt'>" + item.data.name + "</div>");
            if( item.data.group_picture_url != undefined){
	            $(".groups-content-header").attr("style", "background-image: url(" + item.data.group_picture_url + "); background-size: 90% auto; background-position: 40% 30%;");
	          }else{
	            $(".groups-content-header").attr("style", "background-image: url(/images/bg-grupos.jpg)");	            
            }
            group_id = item.id;
            var endpoint = "/groups/"+group_id+"/members";
            $.ajax({
              type: 'GET',
              dataType: 'json',
              crossDomain: true,
              url: api_url + endpoint +'?api_key=$$key'.render({
                  key: api_key
              }),
              success: function(data,status,jqXHR){
                if(jqXHR.status == 200){
                  member_list = data.members;
                  if ($.getUrlVar("u") != undefined){
                    $.each(member_list, function(i,member){
                      if ($.getUrlVar("u") == member.user_id){
                        group_id = item.id;
                        $("#group-list").val(group_id);
                      }
                    });
                  }
                  callback(callback2);
                }
              },
              error: function(data){

              }
            });
            
          }
          $(".group-icons-wrap").append("<div class='group-icon-in-info-h group-click glyphicon glyphicon-group-icon' group-id='" + item.id + "' title='" + item.data.name + "'></div>");
          $(".group-list-in-g-content").append("<li class='group-click' group-id='" + item.id + "'><div class='group-icon glyphicon glyphicon-group-icon'></div><div class='group-name-txt'>" + item.data.name + "</div>");
         
          var selected = "";//anterior
          var selecterLi = ""//novo
          var grupoAtual = ""
          if ($.getUrlVar("g") == item.id){
            selected = " selected";//anterior
            
            //novo
          }
          $("#group-list").append("<option value='" + item.id + "' " + selected + ">"+item.data.name);//anterior
          
        });
        if(group_list.length > 3){ // se tem mais do que tres grupos fazer com que apareçam tres e o símbolo para carregar a lista completa de grupos embaixo no espaço de conteúdos dos grupos
		        	$(".groups-in-info-header-wrap .group-icon-in-info-h:nth-child(n + 4)").css("display", "none");
		        	//$(".groups-in-info-header-wrap").append("<div class='see-more-groups-in-h'>•••</div>");
        		}        		
        $("#group-list").change(function(){
          group_id = $('#group-list').find(":selected").val();
          location.hash = "#!/group?g=" + $('#group-list').find(":selected").val();
        });
        $(".group-click").bind("click", function(e){
	        var clickedGroupId = $(this).attr("group-id");
	        group_id = clickedGroupId;
	        location.hash = "#!/group?g=" + clickedGroupId;
	        //console.log(currGroupId);
        });
        $("#loadMembersMenu").unbind();
        $("#loadMembersMenu").bind("click", function(e){
           e.preventDefault();
           loadMembersMenu();
        });

        $("#loadInvites").unbind();
        $("#loadInvites").bind("click", function(e){
           e.preventDefault();
           loadInvites();
        });
        carregaConvites();
      }
    },
    error: function(data){

    }
  });
}

function carregaConvites(){
	$(".invites-list-ul li").remove();
	$(".invites-list-ul .invite-text-content span").each(function(){
		$(this).html(tr($(this).html()));
	});
	var endpoint = "/users/group-suggestions";
  $("#myModalInvites .modal-header h4.modal-title").text(tr("Invites"));
  $.ajax({
    type: 'GET',
    dataType: 'json',
    crossDomain: true,
    url: api_url + endpoint +'?api_key=$$key'.render({
        key: api_key
    }),
    success: function(data,status,jqXHR){
      lista_convites = data.suggestions;
      $(".user-invites .counter").html(lista_convites.length);
      currentInvitesLength = lista_convites.length;
       if (lista_convites.length > 0){
	       $(lista_convites).each(function(index,item){
						$(".invites-list-ul").append("<li code='" + item.code + "'><div class='invite-icon'><i class='glyphicon glyphicon-group-icon'></i></div><div class='invite-text-content'>" + tr("Group") + " " + item.group.name + " " + tr("invited you") + "<br><span class='reject-invite'>" + tr("Deny") + "</span><span class='accept-invite'>" + tr("Accept") + "</span></div></li>" );
	       });
	       $(".invites-list-ul li .invite-text-content .accept-invite").on("click",function(e){
		          var inviteCode = $(this).closest("li").attr("code");
		          $(this).closest("li").addClass("accept-invite-msg-target");
		          aceitaConvite(true, inviteCode);
		          console.log(currentInvitesLength);
		          $(".user-invites .counter").html(currentInvitesLength);
		          
		          
				  });
				  $(".invites-list-ul li .invite-text-content .reject-invite").on("click",function(e){
		          var inviteCode = $(this).closest("li").attr("code");
		          $(this).closest("li").addClass("accept-invite-msg-target");
		          aceitaConvite(false, inviteCode);
							$(".user-invites .counter").html(currentInvitesLength);
				  });
       }else{
	       $(".invites-list-ul li").hide();
	       $(".sem-convites").html(tr("No invites found"));
	       $(".sem-convites").show();
	       checkIfCouterIsCero($(".user-invites .counter"), lista_convites.length);
       }
    },
  	error: function(data){
	  	$(".invites-box .invites-list-ul li").hide();
	  	$(".sem-convites").html(tr("Error loading invites"));
	  	$(".sem-convites").show();
	  	
  	}
  	
	});
}

function loadInvites(){
	$("#myModalInvites .invites .item").not(":first").remove();//antiga
  $("#myModalInvites .invites .item").addClass("active");
  $("#myModalInvites .invites .item button").each(function(index,item){
    $(this).html(tr($(this).html()));
  });//antiga
	var endpoint = "/users/group-suggestions";
  $("#myModalInvites .modal-header h4.modal-title").text(tr("Invites"));
  $.ajax({
    type: 'GET',
    dataType: 'json',
    crossDomain: true,
    url: api_url + endpoint +'?api_key=$$key'.render({
        key: api_key
    }),
    success: function(data,status,jqXHR){
      invites_list = data.suggestions;

      /*if (invites_list.length <= 0){
        invites_list  = [
                      {
                         "code" : "706TE-7NDGJ",
                         "group" : {
                            "group_picture_url" : null,
                            "id" : 4,
                            "name" : "XXX Bar",
                            "position_visibility" : "admins"
                         },
                         "invited_at" : "2016-04-18T12:23:58",
                         "invited_by" : {
                            "name" : "Foo Bar1",
                            "profile_picture_url" : null
                         }
                      },
                      {
                         "code" : "706TE-7NDGJ",
                         "group" : {
                            "group_picture_url" : null,
                            "id" : 4,
                            "name" : "XXX Bar 2",
                            "position_visibility" : "admins"
                         },
                         "invited_at" : "2016-04-18T12:23:58",
                         "invited_by" : {
                            "name" : "Foo Bar2",
                            "profile_picture_url" : null
                         }
                      }
                   ];
      }*/
      if (invites_list.length > 0){
        $(invites_list).each(function(index,item){
          if (index > 0){ 
            var div_item = $($("#myModalInvites .invites .item")[0]).clone();
            $(div_item).removeClass("active");
            $("#myModalInvites .invites").append(div_item);
          }
          var div_item = $("#myModalInvites .invites .item:last-child");//antiga
          
          $(div_item).attr("code",item.code);//anitiga
          
          $(div_item).find(".invite-count").html(tr("Invite") + " " + (index+1) + tr(" of ") + invites_list.length );// antiga definindo a contagem de convites
          //$(".user-invites .counter").html(invites_list.length);// nova
          
          $(div_item).find(".group-info .caption-name").html(tr("Group Name"));
          $(div_item).find(".group-info .name").html(item.group.name);// antiga colocando nome do grupo do convite no lugar
          $(div_item).find(".group-info .caption-date").html(tr("Sent at"));
          $(div_item).find(".group-info .date").html(convertDate(item.invited_at));
          $(div_item).find(".caption-member").html(tr("Invited by"));
          $(div_item).find(".member-info .name").html(item.group.name);
        });
        if ($("#myModalInvites .invites .item").length > 1){
          $("#myModalInvites .modal-footer button").html(tr("Next"));
          $("#myModalInvites .modal-footer button").attr("onclick","nextInvite();");
        }else{
          $("#myModalInvites .modal-footer button").html(tr("Back"));
          $("#myModalInvites .modal-footer button").attr("onclick","closeInvites();");
        }
        $("#myModalInvites .invites .item .btn.accept-invite").on("click",function(e){
          acceptInvite(true);
        });
        $("#myModalInvites .invites .item .btn.deny-invite").on("click",function(e){
          acceptInvite(false);
        });
      }else{
        $("#myModalInvites .invites .item").hide();
        $("#myModalInvites .no-invites").html(tr("No invites found"));
        $("#myModalInvites .no-invites").show();
        $("#myModalInvites .modal-footer button").html(tr("Back"));
        $("#myModalInvites .modal-footer button").attr("onclick","closeInvites();");
      }
      $("#myModalInvites").modal();
    },
    error: function(data){
      $("#myModalInvites .invites .item").hide();
      $("#myModalInvites .no-invites").html(tr("Error loading invites"));
      $("#myModalInvites").modal();
      $("#myModalInvites .modal-footer button").html(tr("Back"));
      $("#myModalInvites .modal-footer button").attr("onclick","closeInvites();");
    }
  });

}

function nextInvite(){
  var total = $("#myModalInvites .invites .item").length;
  var new_active = 0;
  for (i = 0; i < total; i++){
    if ($($("#myModalInvites .invites .item")[i]).hasClass("active")){
      if (i+1 < total){
        new_active = i+1;
      }else{
        new_active = 0;
      }
    }
  }
  $("#myModalInvites .invites .item").removeClass("active");
  $($("#myModalInvites .invites .item")[new_active]).addClass("active");
}

function closeInvites(){
  $("#myModalInvites").modal("hide");
}

function acceptInvite(accept){

  if (accept){
    var method = "POST";
  }else{
    var method = "DELETE";
  }

  var endpoint = "/groups/invites/accept/";
  $.ajax({
    type: method,
    dataType: 'json',
    crossDomain: true,
    url: api_url + endpoint +'?api_key=$$key&code=$$code'.render({
        key: api_key,
        code: $("#myModalInvites .invites .item.active").attr("code")
        }),
    success: function(data,status,jqXHR){
      if (accept){
        msg = tr("Invite accepted");
      }else{
        msg = tr("Invite denied");
      }
      setMessage(msg,"success",$("#myModalInvites .flash-modal"));
      $("#myModalInvites .invites .item.active button").prop("disabled",true);
      
    },
    error: function(data){
      msg = tr("Error sending command");
      setMessage(msg,"danger",$("#myModalInvites .flash-modal"));
    }
  });

}


//Nova função para aceitarou não o convite a um Grupo
function aceitaConvite(accept, inviteCode){
	if(accept){
		var method = "POST";
	}else{
		var method = "DELETE";
	}
	var endpoint = "/groups/invites/accept/";
	$.ajax({
    type: method,
    dataType: 'json',
    crossDomain: true,
    url: api_url + endpoint +'?api_key=$$key&code=$$code'.render({
        key: api_key,
        code: inviteCode
        }),
    success: function(data,status,jqXHR){
      if (accept){
        msg = tr("Invite accepted");
        icon = "<i class='glyphicon glyphicon-ok-circle'></i>"
      }else{
        msg = tr("Invite denied");
        icon = "<i class='glyphicon glyphicon-ban-circle'></i>"
      }
      setAcceptInviteMessage(msg,$(".accept-invite-msg-target"), icon);
      currentInvitesLength = currentInvitesLength - 1;
      checkIfCouterIsCero($(".user-invites .counter"), currentInvitesLength);  
    },
    error: function(data){
      msg = tr("Error sending command");
      setAcceptErrorMessage(msg,$(".accept-invite-msg-target"));
    }
  }).done( function(){
	  $(".accept-invite-msg-target").delay(2500).hide(400, function(){
		  $(this).remove();
	  });
  });
}

function loadGroupMembers(callback){
  var endpoint = "/groups/"+group_id+"/members";
  $.ajax({
    type: 'GET',
    dataType: 'json',
    crossDomain: true,
    url: api_url + endpoint +'?api_key=$$key'.render({
        key: api_key
    }),
    success: function(data,status,jqXHR){
      if(jqXHR.status == 200){
        member_list = data.members;
        loadGroupPositions(loadGroupMarkers);
      }
    },
    error: function(data){

    }
  });
}

function updateCurrGroupInfo(group_id){
	getGroupNameFromId(group_id);
	$(".nome-grupo-atual").text(currGroupName);
	$(".curr-group-in-h-txt").text(currGroupName);
	if ( currGroupHeaderBG_URL !== null){
		$(".groups-content-header").css({"background-image": "url(" + currGroupHeaderBG_URL + ")",
																			"background-size": "90% auto",
																			"background-position": "40% 30%"
																		});
	}else{
		$(".groups-content-header").attr("style", "background-image: url(/images/bg-grupos.jpg)");
	}
	
}


function getGroupNameFromId(id){
	$.each(group_list, function (index, item) {
		if (id == item.id) {
			currGroupName = item.data.name;
			currGroupHeaderBG_URL = item.data.group_picture_url;
		}
	});
}
function loadMembersMenu(){
  $(".left__bar .group-info").hide();
  $(".left__bar .group-select").hide();
  $(".left__bar .list-members-top").remove();
  $(".left__bar .list-members").remove();
  $(".left__bar .fixed-top .contents").append("<div class='list-members-top'></div>");
  $(".left__bar .left-contents").append("<div class='list-members'><ul></ul></div>");
  $(".left__bar .list-members-top").append('<a href="#"><span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span> Voltar</a>');
  $(member_list).each(function(index,item){
    $(".left__bar .list-members ul").append("<li>" + item.name + "<a href='#' ref='" + item.user_id + "' class='context'><span class='glyphicon glyphicon-option-vertical' aria-hidden='true'></span></a>" + "</li>");
  });
  resizeSidebar();
  $(".left__bar .list-members ul li a.context").unbind();
  $(".left__bar .list-members ul li a.context").bind("click", function(e){
    e.preventDefault();
    $("#contextMenu ul li").remove();
    $("#contextMenu ul").append("<li><a href='#!/member?u=" + $(this).attr("ref") + "&g=" + group_id + "' tabindex='-1' class='history'>" + tr("View position history") + "</a></li>");
    $("#contextMenu ul").append("<li><a href='#' user-id='" + $(this).attr("ref") + "' tabindex='-1' class='force-position'>" + tr("Force position") + "</a></li>");
    $("#contextMenu").show();
    var offset = $(this).parent().offset();
    var li = $(this).parent();
    var li_index = $(".left__bar .list-members ul li").index($(li));
    var scroll = $(".left__bar .list-members").scrollTop();
    var hpos = $(".left__bar").width() - $("#contextMenu ul").width() - 20;
    $("#contextMenu").css({
      left: hpos,
      top: $(li).outerHeight() * (li_index+1) + $(".list-members-top").height() - scroll
    });
    $("#contextMenu .dropdown-menu").fadeIn("fast");
    $("#contextMenu ul li a.history").on("click", function(e){
      e.stopPropagation();
      $("#contextMenu").hide();
      if (checkIfMobile){
        $(".left__bar .group-toggle").trigger("click");
      }
    });
    $("#contextMenu ul li a.force-position").on("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      $("#contextMenu").hide();
      forcePosition($(this).attr("user-id"));
      if (checkIfMobile){
        $(".left__bar .group-toggle").trigger("click");
      }
    });
    return false;
  });
  $(".left__bar .list-members-top a").unbind();
  $(".left__bar .list-members-top a").bind("click", function(e){
    e.preventDefault();
    closeMembersMenu();
    return false;
  });
  $(".left__bar .fixed-bottom").remove();
  $(".left__bar .list-members").after("<div class='fixed-bottom'></div>");
}

function closeMembersMenu(){
  $(".left__bar .list-members-top").remove();
  $(".left__bar .list-members").remove();
  $(".left__bar .group-info").show();
  $(".left__bar .group-select").show();
}

function loadFencesMenu(){
  $(".left__bar .group-info").hide();
  $(".left__bar .group-select").hide();
  $(".left__bar .list-members-top").hide();
  $(".left__bar .list-members").hide();
  $(".left__bar .list-fences-top").remove();
  $(".left__bar .list-fences-bottom").remove();
  $(".left__bar .list-fences").remove();
  $(".left__bar .fixed-top .contents").append("<div class='list-fences-top'></div>");
  $(".left__bar .fixed-bottom").remove();
  $(".left__bar .left-contents").append("<div class='list-fences'><ul></ul></div><div class='fixed-bottom'></div>");
  $(".left__bar .fixed-bottom").append("<div class='list-fences-bottom'></div>");
  $(".left__bar .list-fences-top").append('<a href="#"><span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span> Voltar</a>');
  $(".left__bar .list-fences-bottom").append('<a href="#"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> ' + tr("New Fence") + '</a>');

  $(".left__bar .list-fences-bottom a").unbind();
  $(".left__bar .list-fences-bottom a").bind("click", function(e){
    e.preventDefault();
    newFence();
    if (checkIfMobile){
      $(".left__bar .group-toggle").trigger("click");
    }
    return false;
  });

  $.each(member_list,function(i,member){
    if (member.user_id == parseInt($.getUrlVar("u"))){
      member_id = member.id;
    }
  });

  var endpoint = "/virtual-fences?group_id="+group_id+"&member_id="+member_id;
  $.ajax({
    type: 'GET',
    dataType: 'json',
    crossDomain: true,
    url: api_url + endpoint +'&api_key=$$key'.render({
        key: api_key
    }),
    success: function(data,status,jqXHR){
      if(jqXHR.status == 200){
        fences_list = data.virtual_fences;

        $(fences_list).each(function(index,item){
          $(".left__bar .list-fences ul").append("<li>" + item.name + "<a href='#' ref='" + item.id + "' fence-type='" + item.type + "' class='context'><span class='glyphicon glyphicon-option-vertical' aria-hidden='true'></span></a>" + "</li>");
        });
        $(".left__bar .list-fences ul li a.context").unbind();
        $(".left__bar .list-fences ul li a.context").bind("click", function(e){
          e.preventDefault();
          $("#contextMenu ul li").remove();
          $("#contextMenu ul").append("<li><a href='#!/virtual-fences-delete?ref=" + $(this).attr("ref") + "&g=" + group_id + "&u=" + $.getUrlVar("u") + "' tabindex='-1'>" + tr("Delete") + "</a></li>");
          $("#contextMenu").show();
          var offset = $(this).parent().offset();
          var li = $(this).parent();
          var li_index = $(".left__bar .list-fences ul li").index($(li));
          var scroll = $(".left__bar .list-fences").scrollTop();
          var hpos = $(".left__bar").width() - $("#contextMenu ul").width() - 20;
          $("#contextMenu").css({
            left: hpos,
            top: $(li).outerHeight() * (li_index+1) + $(".list-fences-top").height() - scroll
          });
          $("#contextMenu .dropdown-menu").fadeIn("fast");
          $("#contextMenu ul li a").on("click", function(e){
            e.stopPropagation();
            $("#contextMenu").hide();
          });
          return false;
        });
        $(".left__bar .list-fences-top a").unbind();
        $(".left__bar .list-fences-top a").bind("click", function(e){
          e.preventDefault();
          closeFencesMenu();
          return false;
        });
        $(".left__bar .list-fences ul li").unbind();
        $(".left__bar .list-fences ul li").bind("click", function(e){
          $(".left__bar .list-fences ul li").removeClass("active");
          $(this).addClass("active");
          if (checkIfMobile){
            $(".left__bar .group-toggle").trigger("click");
          }
          loadFence();
        });
        if (checkIfMobile){
          $(".left__bar .group-toggle").trigger("click");
        }
        loadFencesMarkers();
        resizeSidebar();
      }
    },
    error: function(data){
      setMessage(tr("Error loading virtual fences"),"danger",$("#flash-modal"));
    }
  });

}

function closeFencesMenu(){
  $(".left__bar .list-fences-top").remove();
  $(".left__bar .list-fences").remove();
  $(".left__bar .group-info").show();
  $(".left__bar .group-select").show();
  $(".left__bar .fixed-bottom").empty();
  if (drawingManager){
    deleteShape();
    drawingManager.setMap(null);
  }
  location.hash = "";
}

function newFence(){
  if (drawingManager){
    deleteShape();
    drawingManager.setMap(null);
  }
  $(".left__bar .list-fences ul li").removeClass("active");
  $(".left__bar .list-fences ul").append("<li class='active'>" + tr("My New Fence") + "<a href='#' ref='' class='context hidden'><span class='glyphicon glyphicon-option-vertical' aria-hidden='true'></span></a>" + "</li>");
  loadFence();
}

function saveFencePopup(){
  $("#myModal .modal-header h4.modal-title").text(tr("Save virtual fence"));
  $("#myModal .modal-body .col-sm-3").hide();
  $("#myModal .modal-body p").empty();
  $("#myModal .modal-body p").append("<div class='fields'></div>");
  $("#myModal .modal-body p .fields").append(tr("Enter a name for your fence") + ":<br /><input type='text' id='fence-name'/><br /><br />");
  $("#myModal .modal-body p .fields").append(tr("Monitoring") + ":<br /><select id='fence-type'></select><br /><br />");
  $("#myModal .modal-body p .fields #fence-type").append("<option value='both'>" + tr("In and Out") + "</option>");
  $("#myModal .modal-body p .fields #fence-type").append("<option value='in'>" + tr("In") + "</option>");
  $("#myModal .modal-body p .fields #fence-type").append("<option value='out'>" + tr("Out") + "</option>");
  $("#myModal .modal-footer button").html(tr("Save"));
  $("#myModal .modal-footer button").attr("onclick","saveFence();");

  if ($(".left__bar .list-fences ul li.active").length > 0){
    $("#fence-name").val($(".left__bar .list-fences ul li.active").text());
    $("#fence-type").val($(".left__bar .list-fences ul li.active a").attr("fence-type"));
  }
  $("#myModal").modal();
}

function saveFence(){

  $.each(member_list,function(i,member){
    if (member.user_id == parseInt($.getUrlVar("u"))){
      member_id = member.id;
    }
  });

  var len = fencePolygon.getPath().getLength();
  var points = [];
  for (i = 0; i < len; i++){
    var coords = fencePolygon.getPath().getAt(i).toUrlValue(13).split(",");
    points.push({"longitude": coords[1],"latitude": coords[0]});
  }

  var fence_name = $("#fence-name").val();
  var fence_type = $("#fence-type option:selected").val();

  if (fence_name == ""){
    setMessage(tr("Please enter a name"),"danger",$("#flash-modal"));
    return false;
  }else{
    if ($(".left__bar .list-fences ul li.active").length > 0){
      if ($(".left__bar .list-fences ul li.active a").attr("ref") != ""){
        var fence_id = $(".left__bar .list-fences ul li.active a").attr("ref");
        var method = "PUT";
      }else{
        var fence_id = "";
        var method = "POST";
      }
      var endpoint = "/virtual-fences/"+fence_id;
      $.ajax({
          url: api_url + endpoint +'?api_key=$$key'.render({
          key: api_key
          }),
          data: "&group_id=" + group_id + "&member_id=" + member_id + "&name=" + fence_name + "&type=" + fence_type + "&points=" + JSON.stringify(points),
          type: method,
          crossDomain: true,
          complete: function(e, xhr, settings){
              var msg = "";
              msg += tr("Fence successful saved");
              setMessage(msg,"success");
              $("#myModal").modal("hide");
              deleteShape();
              $("#overmap .icons li.delete").hide();
              $("#overmap .icons li.save").hide();
              $("#overmap .icons li.edit").hide();
              loadFencesMenu();
          },
          error: function(xhr, status, error){
            setMessage(tr("Error saving") + " (" + xhr.status + ")","danger",$("#flash-modal"));
          }
      });
    }
  }
}

function deleteFence(){

  $.each(member_list,function(i,member){
    if (member.user_id == parseInt($.getUrlVar("u"))){
      member_id = member.id;
    }
  });

  var endpoint = "/virtual-fences/"+$.getUrlVar("ref");
  $.ajax({
    type: 'DELETE',
    dataType: 'json',
    crossDomain: true,
    url: api_url + endpoint +'?api_key=$$key'.render({
        key: api_key
        }),
    data: "&group_id=" + group_id + "&member_id=" + member_id,
    success: function(data,status,jqXHR){
      msg = tr("Fence deleted successful");
      setMessage(msg,"success");
      location.hash = "#!/virtual-fences?g=" + $.getUrlVar("g") + "&u=" + $.getUrlVar("u");
    },
    error: function(data){
      msg = tr("Error deleting");
      setMessage(msg,"danger");
      location.hash = "#!/virtual-fences?g=" + $.getUrlVar("g") + "&u=" + $.getUrlVar("u");
    }
  });
}

//drawingManager BEGIN

function loadFence(){
  if (drawingManager){
    drawingManager.setMap(null);
    if (fencePolygon){
      deleteShape(fencePolygon);
    }
  }

  var polyOptions = {
      fillColor: '#a000aa',
      strokeWeight: 0,
      fillOpacity: 0.45,
      editable: true
    };

  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: null,
    drawingControl: false,
    drawingControlOptions: {
      drawingModes: [google.maps.drawing.OverlayType.POLYGON]},
    polylineOptions: {
      editable: true
    },
    polygonOptions: polyOptions,
    map: googleMap
  });

  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
    if (e.type != google.maps.drawing.OverlayType.MARKER) {
      if (fencePolygon){
        deleteShape(fencePolygon);
      }
      // Switch back to non-drawing mode after drawing a shape.
      drawingManager.setDrawingMode(null);
      // Add an event listener that selects the newly-drawn shape when the user
      // mouses down on it.
      fencePolygon = e.overlay;
      fencePolygon.type = e.type;

      clearSelection();

      $("#overmap .icons li.edit").fadeOut("fast",function(){
        $("#overmap .icons li.delete").fadeIn();
        $("#overmap .icons li.save").fadeIn();
      });

//      google.maps.event.addListener(fencePolygon, 'click', function() {
//        setSelection();
//      });
    }
  });

  google.maps.event.addListener(googleMap, 'click', clearSelection);

  if ($(".left__bar .list-fences ul li.active").length > 0){
    if ($(".left__bar .list-fences ul li.active a").attr("ref") != ""){
      var fence_id = parseInt($(".left__bar .list-fences ul li.active a").attr("ref"));

      var newCoords = [];
      var latlng = [];
      $(fences_list).each(function(i,fence){
        if (fence_id == fence.id){
          $(fence.points).each(function(j,point){
            newCoords.push(new google.maps.LatLng(point.latitude, point.longitude));
          });
        }
      });
      if (newCoords.length > 0){
        fencePolygon = new google.maps.Polygon({
          path: newCoords,
          fillColor: '#a000aa',
          strokeWeight: 0,
          fillOpacity: 0.45
        });
        fencePolygon.setMap(googleMap);
        var latlngbounds = new google.maps.LatLngBounds();
        for (var i = 0; i < newCoords.length; i++) {
          latlngbounds.extend(newCoords[i]);
        }
        googleMap.fitBounds(latlngbounds);
        clearSelection();
      }
    }else{
      clearSelection();
      $("#overmap .icons li.delete").hide();
      $("#overmap .icons li.save").hide();
      $("#overmap .icons li.edit").fadeIn();
    }
  }

  $("#overmap .icons li.delete").fadeIn();
  $("#overmap .icons li.save").hide();

  $("#overmap .icons li.delete a").on("click", function(e){
    $("#overmap .icons li.save").hide();
    deleteShape();
    $(this).parent().fadeOut("fast",function(){
      $("#overmap .icons li.edit").fadeIn();
    });
  });

  $("#overmap .icons li.edit a").on("click", function(e){
    $("#overmap .icons li.save").hide();
    setSelection();
    $(this).parent().fadeOut();
  });

  $("#overmap .icons li.save a").on("click", function(e){
    saveFencePopup();
  });
}

function clearSelection() {
  if (fencePolygon) {
    fencePolygon.setEditable(false);
  drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
  }
  drawingManager.setDrawingMode(null);
}

function setSelection() {
  clearSelection();
  if (fencePolygon) fencePolygon.setEditable(true);
  drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
}

function deleteShape() {
  if (fencePolygon) {
    fencePolygon.setMap(null);
    fencePolygon = null;
  }
}
//drawingManager END

function loadGroupPositions(callback){
  var endpoint = "/device-tracks/?group_id="+group_id;
  $.ajax({
    type: 'GET',
    dataType: 'json',
    crossDomain: true,
    url: api_url + endpoint +'&api_key=$$key'.render({
        key: api_key
    }),
    success: function(data,status,jqXHR){
      if(jqXHR.status == 200){
	      //console.log(data);
        $.each(data.tracks, function(index,item){
          $.each(member_list,function(i,member){
            if (member.user_id == item.user_id){
              member.location = item.location;
              if (item.valid_time){
                member.valid_time = item.valid_time;
              }
              if (item.network){
                member.network = item.network;
              }
              if (item.other){
                member.other = item.other;
              }
            }
          });
        });
      }
      callback();
    },
    error: function(data){

    }
  });
}

function loadMemberPositions(callback){

  if (calendarSet){
    var date_set = $("#datepicker").datepicker("getDate");
    date_set = new Date(date_set).toString();
    date_set = date_set.split(" 00:00:00 ");
    var date_ini = new Date(date_set[0] + " " + $(".time-label .hour-ini").text() + ":00 " + date_set[1]);
    var date_end = new Date(date_set[0] + " " + $(".time-label .hour-end").text() + ":00 " + date_set[1]);

    var date_gmt0 = date_ini;
    date_ini = date_gmt0.getUTCFullYear() + "-" + ("0" + (date_gmt0.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + date_gmt0.getUTCDate()).slice(-2) + "T" + ("0" + date_gmt0.getUTCHours()).slice(-2) + ":" + ("0" + date_gmt0.getUTCMinutes()).slice(-2) + ":00";

    date_gmt0 = date_end;
    date_end = date_gmt0.getUTCFullYear() + "-" + ("0" + (date_gmt0.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + date_gmt0.getUTCDate()).slice(-2) + "T" + ("0" + date_gmt0.getUTCHours()).slice(-2) + ":" + ("0" + date_gmt0.getUTCMinutes()).slice(-2) + ":00";

    var endpoint = "/device-tracks?group_id="+group_id+"&user_id="+$.getUrlVar("u")+"&is_history=1&limit_rows=50";
    endpoint += "&valid_time_after=" + date_ini;
    endpoint += "&valid_time_before=" + date_end;
  }else{
    var endpoint = "/device-tracks?group_id="+group_id+"&user_id="+$.getUrlVar("u")+"&is_history=1&limit_rows=10";
  }

  $.ajax({
    type: 'GET',
    dataType: 'json',
    crossDomain: true,
    url: api_url + endpoint +'&api_key=$$key'.render({
        key: api_key
    }),
    success: function(data,status,jqXHR){
      if(jqXHR.status == 200){
        member_history = data.tracks;
      }
      callback();
    },
    error: function(data){

    }
  });
}


function generateAlias(name){
  var name_split = name.split(" ");
  var alias_tmp = "";
  $.each(name_split, function(index,item){
    var alias = item.charAt(0).toUpperCase();
    alias_tmp += alias;
  });

  var found = 0;
  var count = "";
  for (i = 0; i < 10; i++){
    for (j = 0; j < members_alias.length; j++){
      if (members_alias[j] == alias_tmp + count){
        if (count == "") count = 0;
        count = count + 1;
        break;
      }
    }
  }
  var alias = alias_tmp;
  if (count != ""){
    alias = alias_tmp + count;
  }
  members_alias.push(alias);
  return alias;
}

function loadGroupMarkers(){
  members_alias = [];
  $(".bottom__bar .contents").remove();
  $(".bottom__bar").append("<div class='contents'></div>");
  $(".bottom__bar .contents").append("<ul class='user-list'></ul>");//antiga
  $(".group-content .group-members-ul").remove();
  $(".group-content").append("<ul class='group-members-ul'></ul>");//nova
  $(".curr-group-info-in-h .curr-group-length-txt").remove();
  $(".curr-group-info-in-h").append("<div class='curr-group-length-txt'>" + member_list.length + " " + tr("members") + "</div>");//novo
  $.each(member_list,function(i,member){
    if (!member.alias){
      member.alias = generateAlias(member.name);
    }
    var position = {lat: member.location.latitude, lng: member.location.longitude};
    var markerOpt = {
        map: googleMap,
        position: position,
        title: member.name,
        labelContent: member.alias,
        labelAnchor: new google.maps.Point(15, 38),
        labelClass: "labels",
        labelInBackground: false,
        icon: pinSymbol('#32ccfe'),
        animation: google.maps.Animation.DROP,
        user_id: member.user_id
    };
    var googleMarker = new MarkerWithLabel(markerOpt);
    markers.push(googleMarker);
    var infoContent = "<div class='marker-info'>";
    if (member.profile_picture_url && member.profile_picture_url != ""){
      infoContent += "<div class='user-avatar'  style='background-image: url(" + member.profile_picture_url + ");'></div>";
    }
    infoContent += "<div class='user-info'><p><a href='#!/member?u=" + member.user_id + "&g=" + group_id + "'>" + member.name + "</a></p>";
    infoContent += "<p>" + member.location.human_address + "</p>";
    infoContent += "<p>" + convertDate(member.valid_time) + "</p>";
    if (member.other && member.other.battery){
      infoContent += "<p class='battery'>Bateria: " + member.other.battery.level + "%</p>";
    }
    if (member.network && member.network.network){
      if (member.network.network == "Wi-Fi"){
        infoContent += "<p class='network'>Rede: " + member.network.network + "&nbsp;(" + member.network.link_speed +  ")</p>";
      }else if (member.network.network == "3G" || member.network.network == "4G"){
        infoContent += "<p class='network'>Rede: " + member.network.network + "&nbsp;(" + member.network.signal +  ")</p>";
      }else{
        infoContent += "<p class='network'>Rede: offline</p>";
      }
    }
    infoContent += "</div></div>";
    googleMarker.addListener("click", function(){
      var popOpts = {
          content: infoContent,
          position: position
      };
      if (popupIW){
        popupIW.close();
      }
      popupIW = new google.maps.InfoWindow(popOpts);
      popupIW.open(googleMap, googleMarker);
      
      $(".usr-info-in-map-content").empty();
      $(".usr-info-in-map-content").append("<div class='mrkr-info-member-img' style=' background-image: url(" + member.profile_picture_url + ")'></div>");
      $(".usr-info-in-map-content").append('<div class="nome-usr">' + member.name + '</div>');
      $(".usr-info-in-map-content").append("<div class='posicao-usr'><div class='pos-title'><i class='glyphicon glyphicon-map-marker'></i> " + tr("Current Position") + "</div><div class='pos-info'>" + member.location.human_address + " <hr/></div></div>" );

      $(".usr-info-in-map-content").append("<div class='hora-data-usr'><i class='timestamp-cal-icon glyphicon glyphicon-calendar'></i> " + convertDateToHuman(member.valid_time, tr("en-EN")) + "h</div>" );
      $(".usr-info-in-map-content").append("<div class='hist-posicoes-wrap'><a class='hist-posicoes-link' href='#!/member?u=" + member.user_id + "&g=" + group_id + "'><i class='hist-pos-icon glyphicon glyphicon-th'></i>" + tr("Positions History") + "</a></div><div class='hist-pos-intrucao'>" + tr("Click here to see former position") + "</div>");
      $(".usr-info-in-map-wrap").addClass("visible-urs-info");
    });
    
    $(".close-member-marker-label-info").click(function(){
	    $(".usr-info-in-map-wrap").removeClass("visible-urs-info");
    });
    var userInfo = "";
    if (member.profile_picture_url && member.profile_picture_url != ""){
      userInfo += "<div class='user-avatar' style='background-image: url(" + member.profile_picture_url + ");'></div>";
    }
    userInfo += "<div class='user-info'>";
    userInfo += "<p class='name'><strong>" + member.name + "</strong>";
    userInfo += " <a  class='force-position' user-id='" + member.user_id + "' title='" + tr("Force position") + "' alt='" + tr("Force position") + "'><span class='glyphicon glyphicon-repeat' aria-hidden='true'></span></a></p>";
    userInfo += "<p class='address'>" + member.location.human_address + "</p>";
    userInfo += "<p class='timestamp'>" + convertDate(member.valid_time) + "</p>";
    userInfo += "</div>";

    $(".bottom__bar .contents .user-list").append("<li m-index='" + i + "'>" + userInfo + "</li>");//antiga
    $(".group-members-ul").append("<li>" + userInfo + "</li>")// nova
  });
  $(".user-list li a.force-position").on("click", function(e){
    e.preventDefault();
    forcePosition($(this).attr("user-id"));
  });

  $(".user-list li").unbind();
  $(".user-list li").bind("click", function(e){
    google.maps.event.trigger(markers[$(this).attr("m-index")], 'click');
    $(".user-list li").removeClass("active");
    $(this).addClass("active");
    $("user-list li").addClass("hidden");
    $("user-list li[m-index=" + $(this).attr("m-index") + "]").removeClass("hidden");
    var latLng = markers[$(this).attr("m-index")].getPosition();
    googleMap.setCenter(latLng);
/*
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(markers[$(this).attr("m-index")].getPosition());
    googleMap.fitBounds(bounds);
*/
  });

  if (markerClusterer) markerClusterer.clearMarkers();
  markerClusterer = new MarkerClusterer(googleMap, markers);

  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
   bounds.extend(markers[i].getPosition());
  }

  googleMap.fitBounds(bounds);

  resizeSidebar();

}

function loadFencesMarkers(){
  $(".bottom__bar .contents").addClass("closed");
  $.each(member_list,function(i,member){
    if (member.user_id == parseInt($.getUrlVar("u"))){
      if (!member.alias){
        member.alias = generateAlias(member.name);
      }
      var position = {lat: member.location.latitude, lng: member.location.longitude};
      var markerOpt = {
          map: googleMap,
          position: position,
          title: member.name,
          labelContent: member.alias,
          labelAnchor: new google.maps.Point(15, 38),
          labelClass: "labels",
          labelInBackground: false,
          icon: pinSymbol('#32ccfe'),
          animation: google.maps.Animation.DROP,
          user_id: member.user_id
      };
      var googleMarker = new MarkerWithLabel(markerOpt);
      markers.push(googleMarker);
      var infoContent = "<div><p><a href='#!/member?u=" + member.user_id + "&g=" + group_id + "'>" + member.name + "</a></p>";
      infoContent += "<p>" + member.location.human_address + "</p>";
      infoContent += "<p>" + convertDate(member.valid_time) + "</p></div>";
      if (member.other && member.other.battery){
        infoContent += "<p class='battery'>Bateria: " + member.other.battery.level + "%</p>";
      }
      if (member.network && member.network.network){
        if (member.network.network == "Wi-Fi"){
          infoContent += "<p class='network'>Rede: " + member.network.network + "&nbsp;(" + member.network.link_speed +  ")</p>";
        }else if (member.network.network == "3G" || member.network.network == "4G"){
          infoContent += "<p class='network'>Rede: " + member.network.network + "&nbsp;(" + member.network.signal +  ")</p>";
        }else{
          infoContent += "<p class='network'>Rede: offline</p>";
        }
      }
      googleMarker.addListener("click", function(){
        var popOpts = {
            content: infoContent,
            position: position
        };
        if (popupIW){
          popupIW.close();
        }
        popupIW = new google.maps.InfoWindow(popOpts);
        popupIW.open(googleMap, googleMarker);
      });
    }
  });

  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
   bounds.extend(markers[i].getPosition());
  }

  googleMap.fitBounds(bounds);

  resizeSidebar();

}

function sort_by_date(a, b) {
  return new Date(a.valid_time).getTime() - new Date(b.valid_time).getTime();
}

function loadMemberMarkers(){
  members_alias = [];
  $(".bottom__bar .contents").remove();
  $(".bottom__bar").append("<div class='contents'></div>");
  $(".bottom__bar .contents").append("<div class='user-history'><div class='info'></div><ul class='tabs'></ul><ul class='history'></ul></div>");
  
	$(".usr-info-in-map-wrap").empty();
	$(".usr-info-in-map-wrap").append("<span class='close close-member-marker-label-info'>x</span><div class='usr-info-in-map-content'></div>");
	$(".usr-info-in-map-content").append("<div class='member-history'><ul class='tabs'></ul></div>");
			$(".member-history").append("<ul class='history-info'></ul>");
  member_history.sort(sort_by_date);
  if (member_history.length > 5){
    $(".bottom__bar .contents .user-history ul.tabs").append("<li m-index='prev' class='arrow disabled'><span class='glyphicon glyphicon-menu-left' aria-hidden='true'></span></li>");//antiga
    $(".member-history ul.tabs").append("<li m-index='prev' class='arrow disabled'><span class='glyphicon glyphicon-menu-left' aria-hidden='true'></span></li>");//nova
   }
  
  $.each(member_history,function(i,track){
    var position = {lat: track.location.latitude, lng: track.location.longitude};
    var markerOpt = {
        map: googleMap,
        position: position,
        title: convertDate(track.valid_time),
        labelContent: (i+1),
        labelAnchor: new google.maps.Point(15, 38),
        labelClass: "labels",
        labelInBackground: false,
        icon: pinSymbol('#32ccfe'),
        animation: google.maps.Animation.DROP,
        _index: i
    };
    var googleMarker = new MarkerWithLabel(markerOpt);
    markers.push(googleMarker);
    var infoContent = "<div><p>" + track.location.human_address + "</p>";
    infoContent += "<p>" + convertDate(track.valid_time) + "</p></div>";
    if (track.other && track.other.battery){
      infoContent += "<p class='battery'>Bateria: " + track.other.battery.level + "%</p>";
    }
    if (track.network && track.network.network){
      if (track.network.network == "Wi-Fi"){
        infoContent += "<p class='network'>Rede: " + track.network.network + "&nbsp;(" + track.network.link_speed +  ")</p>";
      }else if (track.network.network == "3G" || track.network.network == "4G"){
        infoContent += "<p class='network'>Rede: " + track.network.network + "&nbsp;(" + track.network.signal +  ")</p>";
      }else{
        infoContent += "<p class='network'>Rede: offline</p>";
      }
    }
    googleMarker.addListener("click", function(){
      var popOpts = {
          content: infoContent,
          position: position
      };
      if (popupIW){
        popupIW.close();
      }
      popupIW = new google.maps.InfoWindow(popOpts);
      popupIW.open(googleMap, googleMarker);
      var _index = $(this)[0]._index;
      $(".user-history .tabs li.item").removeClass("active");
      $(".user-history .tabs li[m-index=" + _index + "]").addClass("active");
      $(".user-history .history li.item").addClass("hidden");
      $(".user-history .history li[m-index=" + _index + "]").removeClass("hidden");
      $

      var infoUser = "";//antiga
      var infoUserCardTop = "";//nova
      
      //$(".usr-info-in-map-content .member-history").remove();
			
      if (track.user_picture && track.user_picture != ""){
        infoUser += "<div class='user-avatar' style='background-image: url(" + track.user_picture + ");'></div>";//antiga
        infoUserCardTop += "<div class='mrkr-info-member-img' style='background-image: url(" + track.user_picture + ")'></div>";//nova
      }
      infoUser += "<div class='user-info'>";
      infoUser += "<p class='name'>" + track.user_name + "</p>";
      infoUser += "<p class='address'>" + track.location.human_address + "</p>";
      infoUser += "<p class='timestamp'>" + convertDate(track.valid_time,"dd/MM/yyyy") + "</p>";
      infoUser += "</div>";
      $(".user-history .info").html(infoUser);// carrega info por primeira vez
      infoUserCardTop += "<div class='nome-usr'>" + track.user_name + "</div>";
      infoUserCardTop += "<div class='posicao-usr'><div class='pos-title'><i class='glyphicon glyphicon-map-marker'></i>" + tr("Position") + "</div><div class='pos-info'>" + track.location.human_address + " <hr/></div></div>";
      infoUserCardTop += "<div class='hora-data-usr'><i class='timestamp-cal-icon glyphicon glyphicon-calendar'></i>" + convertDateToHuman(track.valid_time, tr("en-EN")) + "h</div><a class='alterar-data-hist'>" + tr("Alter") + "</a>";
      infoUserCardTop += "<div class='hist-posicoes-wrap'><a class='hist-posicoes-link' href='#!/member?u=" + track.user_id + "&g=" + group_id + "'><i class='hist-pos-icon glyphicon glyphicon-th'></i>" + tr("Positions History") + "</a></div>";
      $(".usr-info-in-map-content").prepend(infoUserCardTop);
    
      mountTabs();
    });

    var date_tmp = convertDate(track.valid_time).split(" ");
    if (i > 0){
      $(".bottom__bar .contents .user-history ul.tabs ").append("<li m-index='" + i + "' class='item'>" + date_tmp[1] + "</li>");//antiga
      $(".member-history ul.tabs").append("<li m-index='" + i + "' class='item'>" + date_tmp[1] + "</li>");//nova
    }else{
      $(".bottom__bar .contents .user-history ul.tabs").append("<li m-index='" + i + "' class='item active'>" + date_tmp[1] + "</li>");
      $(".member-history ul.tabs").append("<li m-index='" + i + "' class='item active'>" + date_tmp[1] + "</li>");
    }

    var itemInfo = "";//antiga
    var timeStampInfo = "";//nova
    if (track.other && track.other.battery){
      itemInfo += "<p class='battery'>Bateria: " + track.other.battery.level + "%</p>";//antiga
      timeStampInfo += "<div class='batery-info'><i class='glyphicon glyphicon-battery-state'></i><span class='batery-info-txt'>Nivel de bateria</span><span class='batery-info-nmbr'>" + track.other.battery.level + "%</span></div>";//nova
    }
    if (track.network && track.network.network){
      if (track.network.network == "Wi-Fi"){
        itemInfo += "<p class='network'>Rede: " + track.network.network + "&nbsp;(" + track.network.link_speed +  ")</p>";//antiga
        timeStampInfo += "<div class='network-info'><i class='glyphicon glyphicon-wifi'></i><span class='network-info-txt'>" + track.network.network + "</span><span class='network-info-nmbr'>" + track.network.link_speed + "</span></div>";//nova
      }else if (track.network.network == "3G" || track.network.network == "4G"){
        itemInfo += "<p class='network'>Rede: " + track.network.network + "&nbsp;(" + track.network.signal +  ")</p>";//antiga
        timeStampInfo += "<div class='network-info'><i class='glyphicon glyphicon-signal-quality'></i><span class='network-info-txt'>Wi-fi</span><span class='network-info-type'>" + track.network.network + "</span><span class='network-info-nmbr'>" + track.network.link_speed + "</span></div>";//nova
      }else{
        itemInfo += "<p class='network'>Rede: offline</p>";//antiga
        timeStampInfo += "<div class='network-info'><i class=''></i><span class='network-info-txt'>Rede offline</span></div>";//nova
      }
    }
    
    
    if (i > 0){
      $(".bottom__bar .contents .user-history ul.history").append("<li class='item hidden' m-index='" + i + "'>" + itemInfo + "</li>");//antiga
      $(".member-history .history-info").append("<li class='item hidden' m-index='" + i + "'>" + timeStampInfo + "</li>");//nova
    }else{
      $(".bottom__bar .contents .user-history ul.history").append("<li class='item' m-index='" + i + "'>" + itemInfo + "</li>");//antiga
      $(".member-history .history-info").append("<li class='item' m-index='" + i + "'>" + timeStampInfo + "</li>");//nova
    }

  });
  if (member_history.length > 5){
    $(".bottom__bar .contents .user-history ul.tabs").append("<li m-index='next' class='arrow'><span class='glyphicon glyphicon-menu-right' aria-hidden='true'></span></li>");
    $(".member-history ul.tabs").append("<li m-index='next' class='arrow'><span class='glyphicon glyphicon-menu-right' aria-hidden='true'></span></li>");
  }

  if (member_history.length <= 0){
    $(".user-history").append("<div class='no-results text-center'>" + tr("This member has no history position") + ".<br />" + tr("Use the calendar icon to choose a specific date") + ".</div>");
  }else{
    $(".user-history .no-results").remove();
  }

  var tabs_page_size = 5;
  if (member_history.length > tabs_page_size){
    $(".user-history .tabs li.item").hide();
    $(".member-history .tabs li.item").hide();
    for (i = 0; i < tabs_page_size; i++){
      $(".user-history .tabs li[m-index=" + i + "]").fadeIn();
      $(".member-history .tabs li[m-index=" + i + "]").fadeIn();
    }
  }

  $(".user-history .tabs li").unbind();
  $(".user-history .tabs li").bind("click", function(e){
    $.scrollTo(".bottom__bar .contents",this);
    if ($(this).hasClass("arrow")){
      if ($(this).hasClass("disabled")){
        return true;
      }
      var li_selected = parseInt($(".user-history .tabs li.active").attr("m-index"));
      if ($(this).attr("m-index") == "prev"){
        li_selected--;
      }else if($(this).attr("m-index") == "next"){
        li_selected++;
      }
      if (li_selected >= 0 && li_selected < member_history.length){
        $(".user-history .tabs li[m-index="+li_selected+"]").trigger("click");
      }
      if (li_selected == 0){
        $(".user-history .tabs li[m-index='prev']").addClass("disabled");
        $(".user-history .tabs li[m-index='next']").removeClass("disabled");
      }else if(li_selected == (member_history.length-1)){
        $(".user-history .tabs li[m-index='next']").addClass("disabled");
        $(".user-history .tabs li[m-index='prev']").removeClass("disabled");
      }else{
        $(".user-history .tabs li[m-index='prev']").removeClass("disabled");
        $(".user-history .tabs li[m-index='next']").removeClass("disabled");
      }
      return true;
    }

    var mindex = $(this).attr("m-index");
    mountTabs($(this).attr("m-index"));
    $(".user-history .tabs li.item").removeClass("active");
    $(this).addClass("active");
    $(".user-history .history li.item").addClass("hidden");
    $(".user-history .history li[m-index=" + $(this).attr("m-index") + "]").removeClass("hidden");
//    google.maps.event.trigger(markers[$(this).attr("m-index")], 'click');
    var track = member_history[mindex];
    var position = {lat: track.location.latitude, lng: track.location.longitude};
    var infoContent = "<div><p>" + track.location.human_address + "</p>";
    infoContent += "<p>" + convertDate(track.valid_time) + "</p></div>";
    if (track.other && track.other.battery){
      infoContent += "<p class='battery'>Bateria: " + track.other.battery.level + "%</p>";
    }
    if (track.network && track.network.network){
      if (track.network.network == "Wi-Fi"){
        infoContent += "<p class='network'>Rede: " + track.network.network + "&nbsp;(" + track.network.link_speed +  ")</p>";
      }else if (track.network.network == "3G" || track.network.network == "4G"){
        infoContent += "<p class='network'>Rede: " + track.network.network + "&nbsp;(" + track.network.signal +  ")</p>";
      }else{
        infoContent += "<p class='network'>Rede: offline</p>";
      }
    }
    var infoUser = "";
    if (track.user_picture && track.user_picture != ""){
      infoUser += "<div class='user-avatar' style='background-image: url(" + track.user_picture + ");'></div>";
    }
    infoUser += "<div class='user-info'>";
    infoUser += "<p class='name'>" + track.user_name + "</p>";
    infoUser += "<p class='address'>" + track.location.human_address + "</p>";
    infoUser += "<p class='timestamp'>" + convertDate(track.valid_time,"dd/MM/yyyy") + "</p>";
    infoUser += "</div>";
    $(".user-history .info").html(infoUser);
    var popOpts = {
        content: infoContent,
        position: position
    };
    if (popupIW){
      popupIW.close();
    }
    popupIW = new google.maps.InfoWindow(popOpts);
    popupIW.open(googleMap, markers[mindex]);

    if (mindex == 0){
      $(".user-history .tabs li[m-index='prev']").addClass("disabled");
      $(".user-history .tabs li[m-index='next']").removeClass("disabled");
    }else if(mindex == (member_history.length-1)){
      $(".user-history .tabs li[m-index='next']").addClass("disabled");
      $(".user-history .tabs li[m-index='prev']").removeClass("disabled");
    }else{
      $(".user-history .tabs li[m-index='prev']").removeClass("disabled");
      $(".user-history .tabs li[m-index='next']").removeClass("disabled");
    }
  });
  
  $(".member-history.tabs li").unbind();//nova
  $(".member-history.tabs li").bind(function(e){
	  if ($(this).hasClass("arrow")){
      if ($(this).hasClass("disabled")){
        return true;
      }
      var li_selected = parseInt($(".member-history .tabs li.active").attr("m-index"));
      if ($(this).attr("m-index") == "prev"){
        li_selected--;
      }else if($(this).attr("m-index") == "next"){
        li_selected++;
      }
      if (li_selected >= 0 && li_selected < member_history.length){
        $(".member-history .tabs li[m-index="+li_selected+"]").trigger("click");
      }
      if (li_selected == 0){
        $(".member-history .tabs li[m-index='prev']").addClass("disabled");
        $(".member-history .tabs li[m-index='next']").removeClass("disabled");
      }else if(li_selected == (member_history.length-1)){
        $(".member-history .tabs li[m-index='next']").addClass("disabled");
        $(".member-history .tabs li[m-index='prev']").removeClass("disabled");
      }else{
        $(".member-history .tabs li[m-index='prev']").removeClass("disabled");
        $(".member-history .tabs li[m-index='next']").removeClass("disabled");
      }
      return true;
    }
    var mindex = $(this).attr("m-index");
    mountTabs($(this).attr("m-index"));
    $(".member-history .tabs li.item").removeClass("active");
    $(this).addClass("active");
    $(".member-history .history li.item").addClass("hidden");
    $(".user-history .history li[m-index=" + $(this).attr("m-index") + "]").removeClass("hidden")
  });//nova

  google.maps.event.trigger(markers[0], 'click');

  if (markerClusterer) markerClusterer.clearMarkers();
  markerClusterer = new MarkerClusterer(googleMap, markers);

  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
   bounds.extend(markers[i].getPosition());
  }

  googleMap.fitBounds(bounds);

  $("#overmap .icons li.calendar").fadeIn();
  $("#overmap .icons li.force-position").fadeIn();
  $("#overmap .icons li.virtual-fences").fadeIn();

  resizeSidebar();
  $(".close-member-marker-label-info").click(function(){
	    $(".usr-info-in-map-wrap").removeClass("visible-urs-info");
  });
}


function loadUserMessages(filter){
  if (filter){
    var endpoint = "/notification-messages/simplified?real_time_before="+filter;
  }else{
    var endpoint = "/notification-messages/simplified";
  }
  $(".message-box").append("<div class='message-loading'>" + tr("Loading") + "...</div>");
  loading_message = true;
  $.ajax({
    type: 'GET',
    dataType: 'json',
    crossDomain: true,
    url: api_url + endpoint,
    data: '&api_key=$$key&limit_rows=10'.render({
        key: api_key
    }),
    success: function(data,status,jqXHR){
      loading_message = false;
      $(".message-box .message-loading").fadeOut("slow",function(e){
        $(".message-box .message-loading").remove();
      });
      if(jqXHR.status == 200){
        $.each(data.notifications, function(index,item){
          var realtime = item.real_time.split(".");
          realtime = realtime[0];
          realtime = realtime.replace(" ","T");
          var item_class = "item";
          var item_title = "";
          if (item.read == 0){
            var item_class = "item unread";
            var item_title = " title='" + tr("Click to mark as read") + "'";
          }
          var content = "<div class='" + item_class + "' ref='" + realtime + "' ref-id='" + item.id + "' " + item_title + ">";
          content += "<p class='title'>" + item.title + "</p>";
          content += "<p class='time'>" + convertDate(item.display_time) + "</p>";
          content += "</div>";
          $(".message-box .message-list").append(content);
        });
        if ($(".message-box .message-list .item").length <= 0 && data.notifications.length <= 0){
          $(".message-box .message-list").html("<div class='empty'>" + tr("No messages found") + "</div>");
        }
      }
      updateMessageCounter();
      $(".message-box .message-list .unread").unbind();
      $(".message-box .message-list .unread").bind("click", function(){
        if (!loading_message){
          markMessageAsRead(this);
        }
      });

    },
    error: function(data){
      loading_message = false;
      $(".message-box .message-loading").fadeOut("slow",function(e){
        $(".message-box .message-loading").remove();
      });
      $(".message-box .message-list").html("<div class='empty'>" + tr("No messages found") + "</div>");
    }
  });
  $(".message-box .message-list").on("scroll", function() {
    if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
      if (!loading_message){
        loadUserMessages($(".message-box .message-list .item:last-child").attr("ref"));
      }
    }
  })
}

function updateMessageCounter(){
  $(".user-messages .counter").html($(".message-box .message-list .unread").length);
  $(".user-messages").attr("title",tr("You have") + " " + $(".message-box .message-list .unread").length + " " + tr("unread messages"));
}

function markMessageAsRead(item){
  var message_id = $(item).attr("ref-id");
  var endpoint = "/notification-messages/"+message_id;
  loading_message = true;
  $.ajax({
    type: 'DELETE',
    dataType: 'json',
    crossDomain: true,
    url: api_url + endpoint,
    data: '&api_key=$$key'.render({
        key: api_key
    }),
    success: function(data,status,jqXHR){
      loading_message = false;
      $(item).removeClass("unread");
      updateMessageCounter();
    },
    error: function(data){
      loading_message = false;
    }
  });
}

function mountTabs(mindex){

  if (mindex){
    var visible_tabs = $(".user-history .tabs li.item:visible");
    $(visible_tabs).each(function(index,item){
      if ($(item).attr("m-index") == mindex){
        if (index < 2){
          if (parseInt($(visible_tabs[0]).attr("m-index")) > 0){
            var mindex_show = parseInt($(visible_tabs[0]).attr("m-index")) - 1;
            var mindex_hide = parseInt($(visible_tabs[4]).attr("m-index"));
            $(".user-history .tabs li[m-index=" + mindex_hide + "]").fadeOut("fast",function(){
              $(".user-history .tabs li[m-index=" + mindex_show + "]").fadeIn("fast");
            });
          }
        }else if (index > 2){
          if (parseInt($(visible_tabs[4]).attr("m-index")) < ($(".user-history .tabs li.item").length-1)){
            var mindex_show = parseInt($(visible_tabs[4]).attr("m-index")) + 1;
            var mindex_hide = parseInt($(visible_tabs[0]).attr("m-index"));
            $(".user-history .tabs li[m-index=" + mindex_hide + "]").fadeOut("fast",function(){
              $(".user-history .tabs li[m-index=" + mindex_show + "]").fadeIn("fast");
            });
          }
        }
      }
    });
  }else{
    mindex = parseInt($(".user-history .tabs li.active").attr("m-index"));
    $(".user-history .tabs li.item").hide();
    var m_ini = mindex - 2;
    var m_end = mindex + 2;
    if (mindex <= 1){
      m_ini = 0;
      m_end = 4;
    }else if (mindex >= ($(".user-history .tabs li.item").length-2)){
      m_ini = $(".user-history .tabs li.item").length-5;
      m_end = $(".user-history .tabs li.item").length-1;
    }
    delayi = 1;
    for (i = m_ini; i <= m_end; i++){
      $(".user-history .tabs li[m-index=" + i + "]").fadeIn(400*delayi);
      delayi++;
    }
  }

}
function convertDate(tagText,format){
  // get time offset from browser
  var currentDate = new Date();
  var offset = -(currentDate.getTimezoneOffset() / 60);
  if (!format) format = "dd/MM/yyyy HH:mm";

  // get provided date
  var givenDate = new Date(tagText);

  // apply offset
  var hours = givenDate.getHours();
  hours += offset;
  givenDate.setHours(hours);

  // format the date
  var localDateString = $.format.date(givenDate, format);
  return localDateString;
}//antiga

function convertDateToHuman(tagText, language){
	var givenDate = new Date(tagText);
	var hours = givenDate.getHours();
	var minutes = givenDate.getMinutes();
	var time = hours + ":" + minutes;
	var localGivenDate = givenDate.toLocaleDateString(language, {
																															 weekday: 'short', 
																															 day: 'numeric',
																															 month: 'long',
																															 year: 'numeric'
																										});
	localGivenDate = localGivenDate.upperfirst();
	localGivenDate = localGivenDate + " &nbsp;&nbsp;<i class='timestamp-time-icon glyphicon glyphicon-time'></i> " + time;
	
	return localGivenDate.upperfirst();
}//nova

function deleteAllMarkers(){
  $.each(markers, function(index,item){
    item.setMap(null);
  });
  markers = [];
  if (markerClusterer) markerClusterer.clearMarkers();
}



function pinSymbol(color) {
    return {
        path: 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#000',
        strokeWeight: 0,
        scale: 1
    };
}

function checkIfMobile(){
  return (bs_viewport == "<md");
}

(function($, viewport){
    $(document).ready(function() {
      if(viewport.is('xs')) {
        bs_viewport = 'xs';
      }
      if(viewport.is('>=sm')) {
        bs_viewport = '>=sm';
      }
      if(viewport.is('<md')) {
        bs_viewport = '<md';
      }
      $(window).resize(
        viewport.changed(function() {
          if(viewport.is('xs')) {
            bs_viewport = 'xs';
          }
          if(viewport.is('>=sm')) {
            bs_viewport = '>=sm';
          }
          if(viewport.is('<md')) {
            bs_viewport = '<md';
          }
        })
      );
    });
})(jQuery, ResponsiveBootstrapToolkit);
/*----------------------------------------------------------------------------*\
    $Ajax to parse user's info
\*----------------------------------------------------------------------------*/
$(document).ready(function() {
	
    $("html").click(function(e){
        $("#contextMenu").hide();
    });
    validateCookie(function() {
        var telephoneField = document.querySelectorAll('.telephone');
        var nameField = document.querySelectorAll('.name');
        var emailField = document.querySelectorAll('.email');
        var profilePicture = $(".profile_picture_url");

        for (var i = 0; i <= telephoneField.length - 1; i++) {
            telephoneField[i].innerHTML = user_data.telephone;
            nameField[i].innerHTML = user_data.name;
            emailField[i].innerHTML = user_data.email;
            profilePicture[i].innerHTML = user_data.profile_picture_url;
        }

        $(".dashboard-content").show();

        $('.preloader').fadeOut('fast');
				$(".profile_picture_url").css({'background':  'url(' + user_data.profile_picture_url + ')', 'background-size' : '120%', 'background-position' : '20% 20%' });
				$('.usuario-at-wrap').append('<div class="nome-at-usuario">' + user_data.name + '</div><div class="users-groups-arrow glyphicon glyphicon-menu-down"></div>');
				//console.log(user_data);
      },
      __default_cookie_error
    );

    /*----------------------------------------------------------------------------*\
        $Calls
    \*----------------------------------------------------------------------------*/
    
    //** Novo Começo
    $(".top-right-users-wrap").click(function() {
        $(".message-box, .invites-box, .groups-content-container").hide();
        $(".config-box").toggle();
        $(this).find(".users-groups-arrow").toggleClass("glyphicon-menu-down glyphicon-menu-up");
    });
    
    $(".top-right-groups-wrap").click(function(){
	    	$(".message-box, .invites-box, .config-box").hide();
	    	$(".groups-content-container").toggle();
	    	$(this).find(".users-groups-arrow").toggleClass("glyphicon-menu-down glyphicon-menu-up");
    });
    
    $(".user-messages").click(function() {
        $(".config-box, .invites-box, .groups-content-container").hide();
        $(".message-box").toggle();
    });
    
    $(".user-invites").click(function(){
	    $(".message-box, .config-box, .groups-content-container").hide();
	    $(".invites-box").toggle();
    });// ** Novo Fim
    
    $(".see-more-groups-in-h, .close-groups-list").click(function(){
	    $(".groups-listing-container").toggle();
    });
    

    $("#flash .close,#flash-modal .close,.flash-modal .close").click(function() {
        $(this).parent().fadeOut("slow");
    });

    $("#overmap .icons li.calendar a").click(function(e){
      e.preventDefault();
      $("#myModalCalendar").modal();
    });
    $("#overmap .icons li.force-position a").click(function(e){
      e.preventDefault();
      forcePosition();
    });
    $("#overmap .icons li.virtual-fences a").click(function(e){
      e.preventDefault();
      location.hash = "#!/virtual-fences?g=" + $.getUrlVar("g") + "&u=" + $.getUrlVar("u");
    });
    $("#myModalCalendar button#save").click(function(e){
      calendarSet = true;
      deleteAllMarkers();
      loadMemberPositions(loadMemberMarkers);
      $("#myModalCalendar").modal("hide");
    });

    $(".icon-bottom-bar img").click(function(e){
      $(".bottom__bar .contents").toggleClass("opened");
      resizeSidebar();
    });

    /*----------------------------------------------------------------------------*\
        Waits page complete load to trigger the resizeSidebar function
    \*----------------------------------------------------------------------------*/
    $(".buttons a p").each(function(index,item){
      $(item).html(tr($(item).html()));
    });
    $(".config-box .buttons a").on("click", function(e){
      if (!$(this).hasClass("logout")){
        e.preventDefault();;
      }
    });
    resizeSidebar();

    $("#datepicker").datepicker({maxDate: '0'});
    $( "#time-slider" ).slider({
      range: true,
      min: 1,
      max: 23,
      values: [ 1, 23 ],
      slide: function( event, ui ) {
        $( ".time-label .hour-ini" ).html( ("0" + ui.values[ 0 ]).slice(-2) + ":00");
        $( ".time-label .hour-end" ).html( ("0" + ui.values[ 1 ]).slice(-2) + ":59");
      }
    });

    $(".icons ul li").each(function(index,item){
      $(this).find("a").attr("title",tr($(this).find("a").attr("title")));
      $(this).find("a").attr("alt",tr($(this).find("a").attr("title")));
    });

    loadUserMessages();

});

if (window.addEventListener) {
	window.addEventListener('load', resizeSidebar, false);
} else {
	window.attachEvent('onload', resizeSidebar);
}


window.addEventListener('orientationchange', resizeSidebar, false);
window.addEventListener('resize', resizeSidebar, false);
var load_map = setTimeout(getTrack(),2000);

$(window).hashchange( function(){
  $("#overmap .icons li").hide();
  if ($.getUrlSub() == ""){
    deleteAllMarkers();
    initialize(loadGroupPositions,loadGroupMarkers);
  }else if ($.getUrlSub() == "group"){
    deleteAllMarkers();
    if (group_id){
			currGroupName = '';
			currGroupHeaderBG_URL = '';
      loadGroupMembers();
      updateCurrGroupInfo(group_id)
    }else{
      initialize(loadGroupMembers,null);
    }
  }else if ($.getUrlSub() == "member"){
    deleteAllMarkers();
    if (group_id){
      loadMemberPositions(loadMemberMarkers);
    }else{
      initialize(loadMemberPositions,loadMemberMarkers);
    }
  }else if ($.getUrlSub() == "virtual-fences"){
    deleteAllMarkers();
    if (group_id){
      loadFencesMenu();
    }else{
      initialize(loadGroupPositions,loadFencesMenu);
    }
  }else if ($.getUrlSub() == "virtual-fences-delete"){
    deleteFence();
  }
})
$(window).hashchange();
