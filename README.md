# twick
Angular app for fetching twitter data.

This app is intended to use only frontend code to fetch from Twitter API.

###1. Setup & Run
```
npm install -g gulp-cli
npm install
```

```
gulp
```

Listen on [http://localhost:9999](http://localhost:9999)

---
###2. CORS proxy server
Browsers doesn't accept requested resource if `Access-Control-Allow-Origin` header is not present. Twitter doesn't provide this header on API responses which is secured with *OAuth v1.0*. 

Without any changes on server, we can solve this either by *disabling the Same Origin Policy in browser ([Chrome](http://stackoverflow.com/questions/3102819/disable-same-origin-policy-in-chrome), [Firefox](http://stackoverflow.com/questions/17088609/disable-firefox-same-origin-policy))* or with *proxy server*.

#####Running proxy server
I'm using [corsproxy](https://github.com/gr2m/CORS-Proxy) here.
```
npm install -g corsproxy
```
```
$ corsproxy
```
This will run on port 1337, So API responses can be proxied like this: `http://localhost:1337/api.twitter.com/1.1/...`

