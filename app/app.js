var app = angular.module('twick', [
    'ngRoute',
    require('./apis').name
])

.config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/app/main.tpl.html',
                controller: 'twickMainController'
            });
    }
])

.controller('twickMainController', [
    '$scope',
    'UserShowFactory',
    'OAuthHeaderService',
    function($scope, UserShowFactory, OAuthHeaderService) {
        $scope.test = OAuthHeaderService.getAuthorization();
    }
]);
