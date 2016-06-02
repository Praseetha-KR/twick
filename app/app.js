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
    '$log',
    'UserShowFactory',
    'OAuthHeaderService',
    function($scope, $log, UserShowFactory, OAuthHeaderService) {
        UserShowFactory.get('void_imagineer')
            .then(function(data) {
                $log.debug(data);
                $scope.test = data;
            })
            .catch(function(error) {
                $log.error(error);
            })
    }
]);
