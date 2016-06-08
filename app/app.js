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
                controller: 'twickController',
                controllerAs: 'vm'
            });
    }
])

.controller('twickController', [
    '$log',
    'UsersFactory',
    function($log, UsersFactory) {
        var vm = this;
        vm.screen_name = 'void_imagineer';
        vm.showUser = function(screen_name) {
            UsersFactory.show(screen_name)
                .then(function(data) {
                    $log.debug(data);
                    vm.data = data;
                })
                .catch(function(error) {
                    $log.error(error);
                });
        }
    }
]);
