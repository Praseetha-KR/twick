module.exports = angular.module('twickApis', [
    'ngResource'
])

.service('OAuthHeaderService', [
    () => {

        let _mergeObjs = (obj1, obj2) => {
            for (var attr in obj2) {
                obj1[attr] = obj2[attr];
            }
            return obj1;
        }

        return {
            getAuthorization: (httpMethod, baseUrl, reqParams) => {
                let keysJson            = require('../keys.json');
                const consumerKey       = keysJson.TWITTER_CONSUMER_KEY,
                    consumerSecret      = keysJson.TWITTER_CONSUMER_SECRET,
                    accessToken         = keysJson.TWITTER_ACCESS_TOKEN,
                    accessTokenSecret   = keysJson.TWITTER_ACCESS_TOKEN_SECRET;

                let timestamp   = Math.round(Date.now() / 1000);
                let nonce       = btoa(consumerKey + ':' + timestamp);

                let oauthParams = {
                    oauth_consumer_key      : consumerKey,
                    oauth_token             : accessToken,
                    oauth_nonce             : nonce,
                    oauth_timestamp         : timestamp,
                    oauth_signature_method  : 'HMAC-SHA1',
                    oauth_version           : '1.0'
                };
                let params      = _mergeObjs(oauthParams, reqParams);

                let encodedSignature = oauthSignature.generate(
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
    ($resource, OAuthHeaderService) => {
        let corsproxyUrl = (url) => {
            return 'http://localhost:1337/' + url.replace(/https:\/\//g, '');
        }
        return {
            configResource: (httpMethod, url, reqParams, isArray) => {
                return $resource(
                    corsproxyUrl(url),
                    null,
                    {
                        get: {
                            method: httpMethod,
                            isArray: isArray,
                            headers: {
                                'Authorization': OAuthHeaderService.getAuthorization(httpMethod, url, reqParams)
                            }
                        }
                    },
                    { stripTrailingSlashes: false }
                ).get(reqParams).$promise;
            }
        }
    }
])

.factory('UserFactory', [
    'resourceService',
    (resourceService) => {
        let baseUrl = 'https://api.twitter.com/1.1/users/';
        return {
            show: (screen_name) => {
                let url         = baseUrl + 'show.json',
                    httpMethod  = 'GET',
                    reqParams   = { screen_name: screen_name },
                    isArray     = false;
                return resourceService.configResource(httpMethod, url, reqParams, isArray);
            }
        };
    }
])

.factory('StatusesFactory', [
    'resourceService',
    (resourceService) => {
        let baseUrl = 'https://api.twitter.com/1.1/statuses/';
        return {
            user_timeline: (screen_name) => {
                let url         = baseUrl + 'user_timeline.json',
                    httpMethod  = 'GET',
                    reqParams   = { screen_name: screen_name },
                    isArray     = true;
                return resourceService.configResource(httpMethod, url, reqParams, isArray);
            }
        };
    }
]);
