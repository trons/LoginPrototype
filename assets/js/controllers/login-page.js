'use strict';

var module = angular.module('LoginTest', []);

module.controller('LoginCtrl', ['$scope', '$window', function($scope, $window){
    $scope.submitLogin = function() {
	var formData = $scope.formData;
	
	// TODO: send to passport and do the login logic.
    };
    
    $scope.goToRegister = function() {
	$window.location.href='/signup';
    };
}]);

/*module.controller('SignupCtrl', ['$scope', '$window', '$http', function($scope, $window, $http) {
    $scope.createAccount = function () {
	var formData = $scope.formData;

	// ======== DEBUG ========
	// console.log('formData = ' + JSON.stringify(formData, null, 2));
	// =======================

	// This is using Angular $http.POST
	$http.post('/user/signup', 
		   {
		       firstName: formData.firstName,
		       lastName: formData.lastName,
		       userName: formData.userName,
		       password: formData.password
		   }).then(
		       function onSuccess(sailsResponse){
			   // Redirect to the profile page (this is after we hava a profile page built)
			   window.location = '#/profile/' + sailsResponse.data.id;
			   //window.location = '/profile';

			   // Redirect to the user blueprint record (this is before we have the profile page built)
			   // window.location = '/user/' + sailsResponse.data.id;
		       }).catch (function onError(sailsResponse){
			   console.log('Error: ' + sailsResponse.data);//sailsResponse.statusText);
		       }).finally(function eitherWay() {
			   $scope.formData = {};
		       });
	 

	// This is using IO.sockets for real-time
	/*io.socket.post('/user/signup/', // <---- Points to signup in UserController.js
		       {
			   firstName: formData.firstName,
			   lastName: formData.lastName,
			   userName: formData.userName,
			   password: formData.password
		       }, function whenServerResponds(data, JWR) {
			   $scope.formData = {};
			   if (JWR.statusCode >= 400) {
			       console.log ('Error: ' + JSON.stringify(JWR, null, 2));
			       return;
			   }
			   $scope.$apply();
			   $window.location.href='/';
		       });*\/
    };

    $scope.passwordMatch = function (password1, password2) {
	return password1 === password2;
    };
}]);*/
