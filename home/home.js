angular.module( 'sample.home', [
'auth0'
])
.controller( 'HomeCtrl', function HomeController( $scope, auth, $http, $location, store ) {

  $scope.auth = auth;

  $scope.callApi = function () {
    // Just call the API as you'd do using $http
    $http({
      url: AUTH0_USER_MANAGEMENT_URL + '/users',
      method: 'GET'
    }).then(function (users) {
      alert(JSON.stringify(users));
    }, function (response) {
      if (response.status === 0) {
        alert("Please download the API seed so that you can call it.");
      }
      else {
        alert(response.data);
      }
    });
  };

  $scope.logout = function() {
    auth.signout();
    store.remove('profile');
    store.remove('token');
    $location.path('/login');
  };

});
