module.exports = angular.module('twickApis', ['ngResource'])

.factory('UserShowFactory', [
    '$resource',
    function($resource) {
        var userResource = $resource('https://api.twitter.com/1.1/users/show.json', null, null, {
            stripTrailingSlashes: false
        });

        return {
            get: function(screen_name) {
                return userResource.get({
                    screen_name: screen_name
                }).$promise;
            }
        };
    }
]);
