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
    'UserFactory',
    'StatusesFactory',
    twickFn
]);

function twickFn($log, UserFactory, StatusesFactory) {
    var vm = this;
    vm.screen_name = 'void_imagineer';
    vm.showUser = function(screen_name) {
        UserFactory.show(screen_name)
            .then(function(data) {
                $log.debug(data);
                vm.user = data;
            })
            .catch(function(error) {
                $log.error(error);
            });

        StatusesFactory.user_timeline(screen_name)
            .then(function(data) {
                $log.debug(data);
                vm.user_timeline = data;
            })
            .catch(function(error) {
                $log.error(error);
            });
    }
}
