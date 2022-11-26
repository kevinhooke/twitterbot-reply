var AWS = require("aws-sdk");

//statusKey = lastReplyId: id of last id replied to
exports.updateDbStatus = function(statusKey, lastTweetReplyId) {

    console.log("updateDbStatus called with statusKey: " + statusKey);

    AWS.config.update({
        region: "us-west-1",
        //endpoint: "http://localhost:8000"
        endpoint : "https://dynamodb.us-west-1.amazonaws.com"
    });

    var docClient = new AWS.DynamoDB.DocumentClient();

    var now = new Date().getTime().toString();

    var params = {
        TableName: "tweetbotreplies",
        Key: {
            "statusKey": statusKey
        },
        UpdateExpression: "set lastTweetReplyId = :lastTweetId",
        ExpressionAttributeValues: {
            ":lastTweetId": lastTweetReplyId
        },
        ReturnValues: "UPDATED_NEW"
    };

    console.log("Updating the item...");
    docClient.update(params, function (err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

exports.getLastDbStatus = function(statusKey) {

    console.log("getLastDbStatus called with key: " + statusKey);

    AWS.config.update({
        region: "us-west-1",
        //endpoint: "http://localhost:8000"
        endpoint : "https://dynamodb.us-west-1.amazonaws.com"
    });

    var docClient = new AWS.DynamoDB.DocumentClient();

    var now = new Date().getTime().toString();

    //ScanIndexForward: false to return in descending order
    //condition > 0 doesn't have much value here but we need to specify some condition for a query
    var params = {
        TableName: "tweetbotreplies",
        KeyConditionExpression : 'statusKey = :status',
        ExpressionAttributeValues : {
            ':status' : statusKey
        },
    };

    return docClient.query(params).promise();
}