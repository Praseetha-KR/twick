var jsSHA = require('jssha');

let percentEncode = (str) => {
  return encodeURIComponent(str).replace(/[!*()']/g, (character) => {
    return '%' + character.charCodeAt(0).toString(16);
  });
};

module.exports = angular.module('twickApis', [
    'ngResource'
])

.service('OAuthHeaderService', [
    () => {
        let mergeObjs = (obj1, obj2) => {
            for (var attr in obj2) {
                obj1[attr] = obj2[attr];
            }
            return obj1;
        }

        let hmac_sha1 = (string, secret) => {
            let shaObj = new jsSHA("SHA-1", "TEXT");
            shaObj.setHMACKey(secret, "TEXT");
            shaObj.update(string);
            let hmac = shaObj.getHMAC("B64");
            return hmac;
        }

        let oAuthBaseString = (method, url, params, key, token, timestamp, nonce) => {
            let paramObj = mergeObjs(
                {
                    oauth_consumer_key : key,
                    oauth_nonce : nonce,
                    oauth_signature_method : 'HMAC-SHA1',
                    oauth_timestamp : timestamp,
                    oauth_token : token,
                    oauth_version : '1.0'
                },
                params
            );

            let paramObjKeys = Object.keys(paramObj);
            paramObjKeys.sort();
            let len = paramObjKeys.length;

            let paramStr = paramObjKeys[0] + '=' + paramObj[paramObjKeys[0]];
            for (var i = 1; i < len; i++) {
                paramStr += '&' + paramObjKeys[i] + '=' + percentEncode(paramObj[paramObjKeys[i]]);
            }
            console.log(percentEncode(paramStr));
            return method + '&' + percentEncode(url) + '&' + percentEncode(paramStr);
        };
        let oAuthSigningKey = function(consumer_secret, token_secret) {
            return consumer_secret + '&' + token_secret;
        };
        let oAuthSignature = function(base_string, signing_key) {
            var signature = hmac_sha1(base_string, signing_key);
            return percentEncode(signature);
        };

        return {
            getAuthorization: (httpMethod, baseUrl, reqParams) => {
                let keysJson            = require('../keys.json');
                const consumerKey       = keysJson.TWITTER_CONSUMER_KEY,
                    consumerSecret      = keysJson.TWITTER_CONSUMER_SECRET,
                    accessToken         = keysJson.TWITTER_ACCESS_TOKEN,
                    accessTokenSecret   = keysJson.TWITTER_ACCESS_TOKEN_SECRET;

                let timestamp  = Math.round(Date.now() / 1000);
                let nonce      = btoa(consumerKey + ':' + timestamp);

                //////
                let oauthParams = {
                    oauth_consumer_key      : consumerKey,
                    oauth_token             : accessToken,
                    oauth_nonce             : nonce,
                    oauth_timestamp         : timestamp,
                    oauth_signature_method  : 'HMAC-SHA1',
                    oauth_version           : '1.0'
                };
                mergeObjs(oauthParams, reqParams);
                let encodedSignature = oauthSignature.generate(
                    httpMethod,
                    baseUrl,
                    oauthParams,
                    consumerSecret,
                    accessTokenSecret
                );
                /////
                let baseString = oAuthBaseString(httpMethod, baseUrl, reqParams, consumerKey, accessToken, timestamp, nonce);
                console.log(baseString);
                let signingKey = oAuthSigningKey(consumerSecret, accessTokenSecret);
                let signature  = oAuthSignature(baseString, signingKey);

                console.log('custom', signature, 'lib', encodedSignature);

                return 'OAuth '                                         +
                    'oauth_consumer_key="'  + consumerKey       + '", ' +
                    'oauth_nonce="'         + nonce             + '", ' +
                    'oauth_signature="'     + signature         + '", ' +
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
        };

        return {
            configGetResource: (httpMethod, url, reqParams, isArray) => {
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
            },
            configPostResource: (httpMethod, url, reqParams, isArray) => {
                /**
                 * hack for POST since it throw error for uri encoded symbol '!'
                 * setting 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' didn't worked
                 * so passing percent encoded param in url instread of body
                 */

                let setUrlParams = (url, reqParams) => {
                    var urlWithParams = url;
                    Object.keys(reqParams).map((value, index) => {
                        urlWithParams += ((index == 0) ? '?' : '&') + value + '=' + escape(reqParams[value]);
                    });
                    return urlWithParams;
                }

                return $resource(
                    corsproxyUrl(setUrlParams(url, reqParams)),
                    null,
                    {
                        post: {
                            method: httpMethod,
                            isArray: isArray,
                            headers: {
                                'Authorization': OAuthHeaderService.getAuthorization(httpMethod, url, reqParams)
                            }
                        }
                    },
                    { stripTrailingSlashes: false }
                ).post({}, {}).$promise;
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
                return resourceService.configGetResource(httpMethod, url, reqParams, isArray);
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
                return resourceService.configGetResource(httpMethod, url, reqParams, isArray);
            },
            update: (status) => {
                let url         = baseUrl + 'update.json',
                    httpMethod  = 'POST',
                    reqParams   = { status: status },
                    isArray     = false;
                return resourceService.configPostResource(httpMethod, url, reqParams, isArray);
            }
        };
    }
])

.factory('SearchFactory', [
    'resourceService',
    (resourceService) => {
        let baseUrl = 'https://api.twitter.com/1.1/search/';
        return {
            search_tweets: (query) => {
                let url         = baseUrl + 'tweets.json',
                    httpMethod  = 'GET',
                    reqParams   = { q: query },
                    isArray     = false;
                return resourceService.configGetResource(httpMethod, url, reqParams, isArray);
            },
            // next: (nextUrl) => {
            //     let url         = baseUrl + 'tweets.json' + nextUrl,
            //         httpMethod  = 'GET',
            //         reqParams   = {},
            //         isArray     = false;
            //     return resourceService.configGetResource(httpMethod, url, reqParams, isArray);
            // }
        };
    }
]);
