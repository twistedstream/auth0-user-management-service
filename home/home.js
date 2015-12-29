angular.module( 'sample.home', [
'auth0'
])
.controller( 'HomeCtrl', function HomeController( $scope, auth, $http, $location, store ) {

  $scope.auth = auth;

  $scope.logout = function() {
    auth.signout();
    store.remove('profile');
    store.remove('token');
    $location.path('/login');
  };

  $scope.deleteUser = function (user) {
    if(confirm('Are you sure you want to delete user "' + user.email + '"?')) {
      $http({
        url: AUTH0_USER_MANAGEMENT_URL + '/users/' + user.user_id,
        method: 'DELETE'
      }).then(function (response) {
        return $scope.refreshUsers();
      }, $scope.onFail);
    }
  };

  $scope.refreshUsers = function () {
    return $http({
      url: AUTH0_USER_MANAGEMENT_URL + '/users',
      method: 'GET'
    }).then(function (response) {
      $scope.users = response.data;
    }, $scope.onFail);
  };

  return $scope.refreshUsers();
});
