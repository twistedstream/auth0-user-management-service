angular.module( 'sample', [
  'auth0',
  'ngRoute',
  'sample.home',
  'sample.login',
  'sample.create',
  'sample.update',
  'angular-storage',
  'angular-jwt',
  'ngPrettyJson'
])
.config( function myAppConfig ( $routeProvider, authProvider, $httpProvider, $locationProvider,
  jwtInterceptorProvider) {
  $routeProvider
    .when( '/', {
      controller: 'HomeCtrl',
      templateUrl: 'home/home.html',
      pageTitle: 'Homepage',
      requiresLogin: true
    })
    .when( '/login', {
      controller: 'LoginCtrl',
      templateUrl: 'login/login.html',
      pageTitle: 'Login'
    })
    .when( '/update/:userId', {
      controller: 'UpdateCtrl',
      templateUrl: 'update/update.html',
      pageTitle: 'Update'
    })
    .when( '/create', {
      controller: 'CreateCtrl',
      templateUrl: 'create/create.html',
      pageTitle: 'Create'
    });

  authProvider.init({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    loginUrl: '/login'
  });

  jwtInterceptorProvider.tokenGetter = function(store) {
    return store.get('token');
  };

  // Add a simple interceptor that will fetch all requests and add the jwt token to its authorization header.
  // NOTE: in case you are calling APIs which expect a token signed with a different secret, you might
  // want to check the delegation-token example
  $httpProvider.interceptors.push('jwtInterceptor');
}).run(function($rootScope, auth, store, jwtHelper, $location) {
  $rootScope.$on('$locationChangeStart', function() {
    if (!auth.isAuthenticated) {
      var token = store.get('token');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          auth.authenticate(store.get('profile'), token);
        } else {
          $location.path('/login');
        }
      }
    }

  });
})
.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$routeChangeSuccess', function(e, nextRoute){
    if ( nextRoute.$$route && angular.isDefined( nextRoute.$$route.pageTitle ) ) {
      $scope.pageTitle = nextRoute.$$route.pageTitle + ' | Auth0 User Management Service Sample' ;
    }
  });

  $scope.onFail = function (response) {
    alert('An error occurred. Check the console.');
    console.error(response.data);
  };

  $scope.go = function (path) {
    $location.path(path);
  };
});
