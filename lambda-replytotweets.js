var reply = require('./index.js');

exports.handler = (event, context, callback) => {

    console.log('lambda-replytotweets called');

    reply.replytotweets();

};