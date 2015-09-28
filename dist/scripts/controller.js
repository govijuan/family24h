// var endpoint = "http://interno.b-datum.com:2020/"
var endpoint = "https://minmax-server.herokuapp.com/register/";

var app = angular.module('family', []);

app.run();

app.controller('loginCtrl', function($scope, $http) {
  $scope.formModel = {};

  $scope.onSubmit = function() {
    console.log("Submitted");
    console.log($scope.formModel);

    $http.post(endpoint, $scope.formModel).
      success(function(data) {
        console.log(data);
      }).error(function(data) {
        console.log(data);
      });
  };
});