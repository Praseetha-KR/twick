angular.module('twick', ['ngRoute'])

.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/app/main.tpl.html',
            controller: 'twickMainController'
        });
})

.controller('twickMainController', [
    '$scope',
    function($scope) {
        $scope.test = "Hello, testing!"
    }
]);
