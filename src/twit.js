const Twit = require('twit');

const getUser = (credentials) => {
	return new Twit(credentials);
};

//
// examples ('direct_messages/sent') 
//
function getTwitData(dataFeed, user) {
	return user.get(dataFeed, { screen_name: user.screen_name, count: 5})
};

function postTwitData(twitterAPI, user, tweet) {
	user.post(twitterAPI, tweet, function (err, data, response) {
		console.log("postTwitData:" + twitterAPI + " tweet:" + tweet);
		console.log("err:" + err);
		console.log("Data:" + data);
		console.log("response:" + response);
	});
};

module.exports.getUser = getUser;
module.exports.getTwitData = getTwitData;
module.exports.postTwitData = postTwitData;