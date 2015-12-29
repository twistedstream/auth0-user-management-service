angular.module( 'sample.create', [
'auth0'
])
.controller( 'CreateCtrl', function HomeController( $scope, auth, $http, $location, store, $routeParams ) {

  $scope.doCreate = function (newUser) {
    return $http({
      url: AUTH0_USER_MANAGEMENT_URL + '/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: newUser
    }).then(function (response) {
      $location.path('/update/' + response.data.user_id);
    }, $scope.onFail);
  };

  $scope.user = {
    email: 'new@user.com',
    password: 'password',
    app_metadata: {}
  };

  $scope.selectedConnection = null;

  $scope.$watch('selectedConnection', function () {
    if ($scope.selectedConnection) {
      $scope.user.connection = $scope.selectedConnection.name;
    }
  });

  return auth.config.auth0js.getConnections(function (err, conns) {
    if (err) return $scope.onFail({ data: err });

    $scope.connections = conns;
    // default to first connection
    $scope.selectedConnection = $scope.connections[0];

    $scope.$apply();
  });
});
