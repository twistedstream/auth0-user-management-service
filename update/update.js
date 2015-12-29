angular.module( 'sample.update', [
'auth0'
])
.controller( 'UpdateCtrl', function HomeController( $scope, auth, $http, $location, store, $routeParams ) {

  function onSuccess (response) {
    $scope.user = response.data;
    $scope.userPatch = {
      app_metadata: $scope.user.app_metadata || {}
    };
  }

  $scope.doUpdate = function (updatedUser) {
    return $http({
      url: AUTH0_USER_MANAGEMENT_URL + '/users/' + $routeParams.userId,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      data: updatedUser
    }).then(onSuccess, $scope.onFail);
  };

  return $http({
    url: AUTH0_USER_MANAGEMENT_URL + '/users/' + $routeParams.userId,
    method: 'GET'
  }).then(onSuccess, $scope.onFail);

});
