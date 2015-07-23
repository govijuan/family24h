/*******************************************************************************
* Fade In effect
*******************************************************************************/
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
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
    }
  };

  tick();
}


var err = document.getElementById('flash');

/*******************************************************************************
* Ajax function to parse from CEP to Address
*******************************************************************************/
$("#cep").focusout(function() {
  var numeroCEP = $("#cep").val().split("-").join("");
  $.ajax({
    url: 'http://correiosapi.apphb.com/cep/'+numeroCEP,
    dataType: 'jsonp',
    crossDomain: true,
    contentType: "application/json",
    statusCode: {
      200: function(data) { console.log(data);

        // var endereco = document.querySelector('#endereco');
        // var bairro = document.querySelector('#bairro');
        // var cidade = document.querySelector('#cidade');
        // var estado = document.querySelector("#estado");

        var inputEndereco = document.querySelector('#input_endereco');
        var inputBairro = document.querySelector('#input_bairro');
        var inputCidade = document.querySelector('#input_cidade');
        var inputEstado = document.querySelector("#input_estado");

        var fadeInFields = document.getElementsByClassName('field');

        inputEndereco.value = data.tipoDeLogradouro+" "+data.logradouro;
        inputBairro.value = data.bairro;
        inputCidade.value = data.cidade;
        inputEstado.value = data.estado;

        if (endereco.style.display != 'block') {
          fadeIn(fadeInFields);
        };

        // err.innerHTML += "<p>"+ input_endereco.value +"</p>";
      } // Ok
      ,400: function(msg) { 
        console.log(msg);  
        err.innerHTML += "<p>CEP não encontrado!</p>"
      } // Bad Request
      ,404: function(msg) { 
        console.log("CEP não encontrado!"); 
        err.innerHTML += "<p>CEP não encontrado!</p>"
      } // Not Found
    }
  });
  fadeIn(err);
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

  err.innerHTML += "<p>Latitude: "+latitude+", Longitude: "+longitude+"</p>";
  fadeIn(err);
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
    break;
    case error.code == 2 || error.POSITION_UNAVAILABLE:
      err.innerHTML += "<p>Location information is unavailable.</p>";
    break;
    case error.code == 3 || error.TIMEOUT:
      err.innerHTML += "<p>The request to get user location timed out.</p>";
    break;
    case error.code == 0 || error.UNKNOWN_ERROR:
      err.innerHTML += "<p>An unknown error occurred.</p>";
    break;
  }

  fadeIn(err);
}