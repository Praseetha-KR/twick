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

.directive('tweet', [function() {
    return {
        restrict: 'E',
        scope: {
            tweet: '='
        },
        templateUrl: '/app/tweet.tpl.html',
        link: function(scope, elem, attr) {
            // scope.tweet = tweet;
        }
    }
}])
.controller('twickController', [
    '$log',
    'UserFactory',
    'StatusesFactory',
    'SearchFactory',
    twickFn
]);

function twickFn($log, UserFactory, StatusesFactory, SearchFactory) {
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

    vm.status = 'Test tweet';
    vm.tweet = (status) => {
        status = status;
        StatusesFactory.update(status)
            .then((data) => vm.status = '')
            .catch((error) => $log.error(error));
    }

    vm.query = '#google';
    vm.search = (q) => {
        SearchFactory.search_tweets(q)
            .then((data) => vm.search_result = data)
            .catch((error) => $log.error(error));
    };
    // vm.loadmore = (nextUrl) => {
    //     SearchFactory.next(nextUrl)
    //         .then((data) => {
    //             vm.search_result.statuses = vm.search_result.statuses.push(data.statuses);
    //             vm.search_result.search_metadata.next_results = data.statuses.search_metadata.next_results;
    //         })
    //         .catch((error) => $log.error(error));
    // };
}
