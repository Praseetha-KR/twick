var app = angular.module('twick', [
    'ngRoute',
    require('./apis').name
])

.config([
    '$routeProvider',
    ($routeProvider) => {
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
    let vm  = this;
    vm.screen_name = 'void_imagineer';
    vm.showUser = (screen_name) => {
        UserFactory.show(screen_name)
            .then((data) => vm.user = data)
            .catch((error) => $log.error(error));

        StatusesFactory.user_timeline(screen_name)
            .then((data) => vm.user_timeline = data)
            .catch((error) => $log.error(error));
    }
}
