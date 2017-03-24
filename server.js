var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var flash = require('connect-flash');
var storage = require('node-persist');
var cognitiveServices = require('cognitive-services');
var rp = require('request-promise');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs');

app.use(session({
  secret: 'ilovescotchscotchyscotchscotch'
}));
app.use(flash());

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');

var Twitter = require('twitter');

var computerVision = cognitiveServices.computerVision({
  API_KEY: '92975dfa345a423c8756e800f9ed0b14'
})

var client = new Twitter({
  consumer_key: 'I1fumJtHqLRwLc4oPzqkghqoD',
  consumer_secret: 'J7vMfxXVI4zZyXqFtoLPV2fwyUQWVP8Dh1Ky6PBgFUAZd4xD0C',
  access_token_key: '3017462262-3bJEiTDm87TXcPHVD6CSTADSEZR7ngpfw12iUNH',
  access_token_secret: '9f7Nn35SD3Qbr4eKdjVzM2YukJiFK7jt4PB4pu4t6Vjfq'
});

/*var config = {
    consumerKey: 'I1fumJtHqLRwLc4oPzqkghqoD',
    consumerSecret: 'J7vMfxXVI4zZyXqFtoLPV2fwyUQWVP8Dh1Ky6PBgFUAZd4xD0C',
    accessToken: '3017462262-3bJEiTDm87TXcPHVD6CSTADSEZR7ngpfw12iUNH',
    accessTokenSecret: '10f7Nn35SD3Qbr4eKdjVzM2YukJiFK7jt4PB4pu4t6Vjfq',
    callBackUrl: 'http://localhost:8080/auth/twitter/callback'
};*/

var parameters = {
  visualFeatures: "Categories"
};


var params = {
  screen_name: 'visio_'
};

storage.initSync();

app.get('/', function(req, res) {

  var tweets = [];
  var descr = [];
  var imgURL = [];
  var results = [];

  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      var res = {};
      storage.setItemSync('name', tweets);
      for (var i = 0; i < tweets.length; i++) {
        if (tweets[i].extended_entities !== undefined) {
          res['text'] = tweets[i].text;
          var img_url = tweets[i].extended_entities.media[0].media_url;
          console.log(img_url);
          res['img'] = img_url;
          imgURL.push(img_url);

          storage.setItemSync('img_URL', imgURL);

          var descOptions = {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': '92975dfa345a423c8756e800f9ed0b14'
            },
            uri: 'https://westus.api.cognitive.microsoft.com/vision/v1.0/describe',
            qs: {
              maxCandidates: 1
            },
            body: {
              url: img_url
            },
            json: true // Automatically stringifies the body to JSON
          };

          var recogOptions = {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': ''
            },
            uri: 'https://westus.api.cognitive.microsoft.com/vision/v1.0/recognize',
            qs: {
              maxCandidates: 1
            },
            body: {
              url: img_url
            },
            json: true // Automatically stringifies the body to JSON
          };

          rp(descOptions)
            .then(function(parsedBody) {
              descr.push(parsedBody.description.captions[0]);
              res['desc'] = parsedBody.description.captions[0].text;
              console.log(res);
              results.push(res);
              storage.setItemSync('desc', descr);
              console.log(descr);
            })
            .catch(function(err) {
              throw err;
            });

          rp(recogOptions)
            .then(function(parsedBody) {
              /*descr.push(parsedBody.description.captions[0]);
              storage.setItemSync('recognize', );*/
              console.log(parsedBody);
            })
            .catch(function(err) {
              throw err;
            });
        }
      }
      storage.setItemSync('mixedJSON', results);
    }
  });

  var tweetArr = storage.getItemSync('name');
  var desc = storage.getItemSync('desc');
  var img_urls = storage.getItemSync('img_URL');
  var mixed = storage.getItemSync('mixedJSON');

  // console.log(tweetArr);
  // console.log(desc);
  console.log(mixed);

  res.render('index.ejs', {
    tweetArr: tweetArr,
    desc: desc,
    img_urls: img_urls,
    mixed: mixed
  });

});

app.listen(port);
console.log('The magic happens on port ' + port);
