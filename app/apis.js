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
            getAuthorization: function(httpMethod, baseUrl, reqParams) {
                var keysJson            = require('../keys.json');
                var consumerKey         = keysJson.TWITTER_CONSUMER_KEY,
                    consumerSecret      = keysJson.TWITTER_CONSUMER_SECRET,
                    accessToken         = keysJson.TWITTER_ACCESS_TOKEN,
                    accessTokenSecret   = keysJson.TWITTER_ACCESS_TOKEN_SECRET;

                var timestamp   = Math.round(Date.now() / 1000);
                var nonce       = btoa(consumerKey + ':' + timestamp);

                var oauthParams = {
                    oauth_consumer_key      : consumerKey,
                    oauth_token             : accessToken,
                    oauth_nonce             : nonce,
                    oauth_timestamp         : timestamp,
                    oauth_signature_method  : 'HMAC-SHA1',
                    oauth_version           : '1.0'
                };
                var params      = _mergeObjs(oauthParams, reqParams);

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
.service('resourceService', [
    '$resource',
    'OAuthHeaderService',
    function($resource, OAuthHeaderService) {
        var corsproxyUrl = function(url) {
            return 'http://localhost:1337/' + url.replace(/https:\/\//g, '');
        }
        return {
            configResource: function(httpMethod, baseUrl, reqParams) {
                return $resource(
                    corsproxyUrl(baseUrl),
                    null,
                    {
                        get: {
                            method: httpMethod,
                            headers: {
                                'Authorization': OAuthHeaderService.getAuthorization(httpMethod, baseUrl, reqParams)
                            }
                        }
                    },
                    { stripTrailingSlashes: false }
                ).get(reqParams).$promise
            }
        }
    }
])
.factory('UsersFactory', [
    'resourceService',
    function(resourceService) {
        return {
            show: function(screen_name) {
                var baseUrl         = 'https://api.twitter.com/1.1/users/show.json',
                    httpMethod      = 'GET',
                    reqParams       = { screen_name: screen_name };
                return resourceService.configResource(httpMethod, baseUrl, reqParams);
            }
        };
    }
]);
