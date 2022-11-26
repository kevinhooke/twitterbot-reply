var OAuth = require("oauth");
var db_status = require('./db_status.js');
var replytext = require('./replyMessages.json');
var textadventure = require('./textadventure');

// var redisOptions = {
//     url: 'redis://tweetbot-status.ejj7mt.0001.usw1.cache.amazonaws.com'
// };
//
// var redis = require("redis"),
//     redisClient = redis.createClient(redisOptions);
//
//
// redisClient.on("error", function (err) {
//     console.log("Redis connect error: " + err);
// });
//
// redisClient.on('connect', function (err) {
//     console.log('Redis connected:', redisClient.connected)
// });

//load config from file
var config = require("./config/config.json");

exports.replytotweets = function() {

    //check for required values
    var configComplete = true;
    if (config.sendTweetEnabled == undefined || config.sendTweetEnabled == "") {
        console.log("config.json: sendTweetEnabled value is missing - set to true | false");
        configComplete = false;
    }
    if (config.twitterConsumerKey == "") {
        console.log("config.json: twitterConsumerKey value is missing");
        configComplete = false;
    }
    if (config.twitterSecretKey == "") {
        console.log("config.json: twitterSecretKey value is missing");
        configComplete = false;
    }
    if (config.accessToken == "") {
        console.log("config.json: accessToken value is missing");
        configComplete = false;
    }
    if (config.accessTokenSecret == "") {
        console.log("config.json: accessTokenSecret value is missing");
        configComplete = false;
    }
    if (!configComplete) {
        process.exit(1);
    }
    else {
        console.log("config.json read successfully");
        console.log("... config.sendTweetEnabled: " + config.sendTweetEnabled);
        //console.log("... config.twitterConsumerKey: " + config.twitterConsumerKey);
        //console.log("... config.twitterSecretKey: " + config.twitterSecretKey);
        //console.log("... config.accessToken: " + config.twitterConsumerKey);
        //console.log("... config.accessTokenSecret: " + config.accessTokenSecret);
    }

    var oauth = new OAuth.OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        config.twitterConsumerKey,
        config.twitterSecretKey,
        '1.0A',
        null,
        'HMAC-SHA1'
    );

    console.log('Getting replies and mentions:');

    // var lastIdReplyFromCache = redisClient.get('lastTweetReplyId', function (err, reply) {
    //     // reply is null when the key is missing
    //     console.log('redis reply: ' + reply);
    // });
    //
    // console.log('lastTweetReplyId: ' + lastIdReplyFromCache);

    db_status.getLastDbStatus('lastTweetId')
        .then(function (data) {

            console.log("data: " + JSON.stringify(data));
            var lastTweetReplyId = 0;
            if(data != undefined && data.Count > 0){
                lastTweetReplyId = data.Items[0].lastTweetReplyId;
            }

            console.log("lastTweetReplyId: " + lastTweetReplyId);

            //get last tweet reply id then pass to query if we have one from db
            var apiEndpoint = 'https://api.twitter.com/1.1/statuses/mentions_timeline.json';
            if(lastTweetReplyId > 0){
                apiEndpoint = apiEndpoint + '?since_id=' + lastTweetReplyId;
            }

            console.log('Calling api: ' + apiEndpoint);

            oauth.get(apiEndpoint,
                config.accessToken,
                config.accessTokenSecret,
                function (error, data) {
                    console.log('\nmentions_timeline:\n');
                    console.log(error || data);
                    var response = JSON.parse(data);
                    console.log("raw data.length: " + data.length);
                    console.log("response.length: " + response.length)
                    if(response.length > 0) {
                        //test, first item only
                        //descending order to reply to earlierst first, most recent last
                        for (var tweet = response.length-1; tweet >= response.length-1 ; tweet--) {
                            //for (var tweet = response.length-1; tweet >= 0; tweet--) {
                            var textReply = '';
                            var tweetText = response[tweet].text;

                            console.log("id: " + response[tweet].id);
                            console.log("id_str: " + response[tweet].id_str);
                            console.log("in_reply_to_status_id: " + response[tweet].in_reply_to_status_id);
                            console.log("text: " + tweetText);

                            var direction = textadventure.adventureTextRequested(tweetText);
                            if(direction !== ''){
                                textReply = 'You go ' + direction
                                    + '. ' + textadventure.generateTextAdventure(tweetText);
                            }
                            else{
                                textReply = exports.getTextReply();
                            }

                            var status = ({
                                'status': '@' + response[tweet].user.screen_name + ' ' + textReply,
                                'in_reply_to_status_id': response[tweet].id_str
                            });
                            //skip replying to self
                            if(response[tweet].user.screen_name != 'kevinhookebot') {
                                if (config.sendTweetEnabled == "true") {
                                    console.log("config.sendTweetEnabled: true: sending reply tweet...");
                                    oauth.post('https://api.twitter.com/1.1/statuses/update.json',
                                        config.accessToken,
                                        config.accessTokenSecret,
                                        status,
                                        function (error, data) {
                                            console.log('\npost reply:\n');
                                            console.log(error || data);
                                        });
                                }
                                else {
                                    console.log("config.sendTweetEnabled: false, not sending tweet");
                                }
                                console.log("reply tweet: " + JSON.stringify(status));
                            }
                            else{
                                console.log('... skipping tweet as user was kevinhookebot');
                            }


                            db_status.updateDbStatus('lastTweetId', response[tweet].id_str);
                        }
                    }
                    //redisClient.quit();
                });
        });
}

exports.nextIntInRange = function(high){
    var next = Math.floor(Math.random() * high);
    console.log('next: ' + next);
    return next;
}

exports.getTextReply = function(){
    var next = this.nextIntInRange(31);
    console.log('next msg index: ' + next);
    var nextMsg = replytext[next];
    console.log('Next msg: ' + nextMsg);
    return nextMsg;

}

