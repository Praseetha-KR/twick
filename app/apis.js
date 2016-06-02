module.exports = angular.module('twickApis', [
    'ngResource'
])

.service('OAuthHeaderService', [
    function() {

        var _mergeObjs = function(obj1, obj2) {
            for (var attr in obj2) {
                obj1[attr] = obj2[attr];
            }
            return obj1;
        }

        return {
            getAuthorization: function() {
                var keysJson = require('../keys.json');
                var consumerKey = keysJson.TWITTER_CONSUMER_KEY,
                    consumerSecret = keysJson.TWITTER_CONSUMER_SECRET,
                    accessToken = keysJson.TWITTER_ACCESS_TOKEN,
                    accessTokenSecret = keysJson.TWITTER_ACCESS_TOKEN_SECRET;

                var httpMethod = 'GET';
                var baseUrl = 'https://api.twitter.com/1.1/users/show.json';
                var reqParams = { key: 'screen_name', value: 'twitterdev'};
                var timestamp = Math.round(Date.now() / 1000);

                var nonce = btoa(consumerKey + ':' + timestamp);
                var oauthParams = {
                    oauth_consumer_key : consumerKey,
                    oauth_token : accessToken,
                    oauth_nonce : nonce,
                    oauth_timestamp : timestamp,
                    oauth_signature_method : 'HMAC-SHA1',
                    oauth_version : '1.0',
                    screen_name: 'twitterdev'
                };
                // var params = _mergeObjs(oauthParams, reqParams);

                var encodedSignature = oauthSignature.generate(
                                            httpMethod,
                                            baseUrl,
                                            oauthParams,
                                            consumerSecret,
                                            accessTokenSecret
                                        );

                return 'OAuth '                                         +
                    'oauth_consumer_key="'  + consumerKey       + '", ' +
                    'oauth_nonce="'         + nonce             + '", ' +
                    'oauth_signature="'     + encodedSignature  + '", ' +
                    'oauth_signature_method="HMAC-SHA1", '              +
                    'oauth_timestamp="'     + timestamp         + '", ' +
                    'oauth_token="'         + accessToken       + '", ' +
                    'oauth_version="1.0"'                               ;
            }
        }
    }
])

.factory('UserShowFactory', [
    '$resource',
    'OAuthHeaderService',
    function($resource, OAuthHeaderService) {
        var baseUrl = 'http://localhost:1337/api.twitter.com:443/1.1/users/show.json';

        return {
            get: function(screen_name) {
                var auth = OAuthHeaderService.getAuthorization(screen_name);
                return $resource(baseUrl, null, {
                    get: {
                        method: 'GET',
                        headers: {
                            'Authorization': OAuthHeaderService.getAuthorization(screen_name),
                            // 'Access-Control-Allow-Origin': '*',
                            // 'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
                            // 'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
                        }
                    }
                }, {
                    stripTrailingSlashes: false
                }).get({
                    screen_name: screen_name
                }).$promise
            }
        };
    }
]);
