module.exports = angular.module('twickApis', [
    'ngResource'
])

.service('OAuthHeaderService', [
    function() {
        var keysJson = require('../keys.json');
        var consumerKey = keysJson.TWITTER_CONSUMER_KEY,
            consumerSecret = keysJson.TWITTER_CONSUMER_SECRET,
            accessToken = keysJson.TWITTER_ACCESS_TOKEN,
            accessTokenSecret = keysJson.TWITTER_ACCESS_TOKEN_SECRET;

        var gen_nonce = function(key, timestamp) {
            return btoa(key + ':' + timestamp);
        }

        var hmac_sha1 = function(string, secret) {
            var shaObj = new jsSHA("SHA-1", "TEXT");
            shaObj.setHMACKey(secret, "TEXT");
            shaObj.update(string);
            var hmac = shaObj.getHMAC("B64");
            return hmac;
        }

        var gen_signature_base_string = function(key, token, timestamp, req, url, param) {
            return req +
                '&' + encodeURIComponent(url) +
                '&' + encodeURIComponent(
                    '&oauth_consumer_key=' + key +
                    '&oauth_nonce=' + gen_nonce(key, timestamp) +
                    '&oauth_signature_method=HMAC-SHA256' +
                    '&oauth_timestamp=' + timestamp +
                    '&oauth_token=' + token +
                    '&oauth_version=1.0' +
                    '&' + param.key +  '=' + param.value
                )
                .replace(/!/g, '%21')
                .replace(/\*/g, "%2A")
                .replace(/\+/g, "%20")
                .replace(/\'/g, "%27")
                .replace(/\(/g, "%28")
                .replace(/\)/g, "%29")
                ;
        }

        return {
            getAuthorization: function() {
                var httpMethod = 'GET';
                var baseUrl = 'https://api.twitter.com/1.1/users/show.json';
                var params = { key: 'screen_name', value: 'twitterdev'};
                var timestamp = Math.round(Date.now() / 1000);
                var nonce = gen_nonce(consumerKey, timestamp);
                var parameters = {
                    oauth_consumer_key : consumerKey,
                    oauth_token : accessToken,
                    oauth_nonce : nonce,
                    oauth_timestamp : timestamp,
                    oauth_signature_method : 'HMAC-SHA1',
                    oauth_version : '1.0',
                    screen_name : 'void_imagineer'
                };


                var signature_base_string = gen_signature_base_string(
                                        consumerKey, accessToken, timestamp,
                                        httpMethod, baseUrl, params
                                    );
                var signing_key = consumerSecret + '&' + accessTokenSecret;
                var encodedSignature = hmac_sha1(signature_base_string, signing_key);

                return 'OAuth ' +
                    'oauth_consumer_key="' + consumerKey + '", ' +
                    'oauth_nonce="' + gen_nonce(consumerKey, timestamp) + '", ' +
                    'oauth_signature="' + encodedSignature + '", ' +
                    'oauth_signature_method="HMAC-SHA1", ' +
                    'oauth_timestamp="' + timestamp + '", ' +
                    'oauth_token="' + accessToken + '", ' +
                    'oauth_version="1.0"';
            }
        }
    }
])

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
