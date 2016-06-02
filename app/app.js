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
    function($scope, UserShowFactory) {
        $scope.test = "Hello, testing!"
    }
]);
