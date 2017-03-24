var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(session({ secret: 'ilovescotchscotchyscotchscotch' }));
app.use(flash());

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');

var Twitter = require('twitter');

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

var params = {screen_name: 'royalharsh95'};
client.get('statuses/user_timeline', params, function(error, tweets, response) {
  if (!error) {
    console.log(tweets[0].created_at);
  }
});

app.get('/', function(req, res) {
	res.render('index.ejs');
});

app.listen(port);
console.log('The magic happens on port ' + port);