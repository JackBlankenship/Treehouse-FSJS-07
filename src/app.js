'use strict';

const express = require('express');
const twitter = require('twitter-text');
const credentials = require(__dirname + '/config.js');
const twit = require(__dirname + '/twit.js');
	
const app = express();
//******************************************
// constants used to connect twit & twit.js
//******************************************
const directMessages = 'direct_messages';
const directMessagesSent = 'direct_messages/sent';
const statusesUserTimeline = 'statuses/user_timeline';
const statusesHomeTimeline = 'statuses/home_timeline';
const statusesUpdate = "statuses/update";
const following = 'friends/list';

let modifiedTweet = '';
app.use('/static', express.static(__dirname + '/public'));

app.set('view engine', 'pug');
app.set('views', __dirname + '/templates');

//
//	setup the user
//
const user = twit.getUser(credentials);		// this is outside the app.use because app.get("/tweet/:data") also needs that.
app.use((req, res, next) => {

	req.directMessages = twit.getTwitData(directMessages, user);
	req.timelineTweets = twit.getTwitData(statusesUserTimeline, user);
	req.followingUsers = twit.getTwitData(following, user);
	next();
});

app.get('/', function(req, res, next){

	//	set message defaults because that interface is not responding for some reason. 
	let timeline = [];
	let following = [];
	let messages = [{ "sender": {"profile_image_url": "/static/images/m-spore.png"}, "text": " Our appologies. We failed to get your direct messages.", "created_at": "2017-04-15"}];

	req.timelineTweets.then(function (result) {
		console.log(Object.getOwnPropertyNames(result.data));
    	if ( (Object.getOwnPropertyNames(result.data)[0] === 'length' ) || (Object.getOwnPropertyNames(result.data.length) == [] ) ) {
    		console.log('trying to throw error');
    		var err = new Error;
    		err.status = 503;
    		err.message = 'Our network is busy, try again in a few minutes';
    		return next(err);
    	} else {
	        timeline = result.data;
	        var myScreenName = timeline[0].user.screen_name;
	        req.directMessages.then(function (result) {
	        	// not sure if its because my app settings are still wrong in regards to direct messages or what.
	        	if ((Object.getOwnPropertyNames(result.data) === 'errors') || (result.errors != "")) {	        			// because you may be totally new to twitter.
	        	} else {
		            messages = result.data;
		        }

	            req.followingUsers.then(function (result) {
	            	following = result.data.users;
		            // rendering page and passing twit objects with the response
	                res.render(__dirname + '/templates/index.pug',{timeline: timeline,
	                                                                following: following,
	                                                                messages: messages,
	                                                                myScreenName: myScreenName});
	            })		// end followingUsers
	        });			// end directmessages
	    }
    })					// end timeline
});

app.get('/tweet/:data', function (req, res ) {

	let myTweet = req.params.data;								// pull the tweet data from the req.params
	modifiedTweet = { status: myTweet };						// build the tweet object. No need to escape special characters.  
	twit.postTwitData(statusesUpdate, user, modifiedTweet);		// call the twitter post function
	res.status(200).send({"status": "true"});					// return good status at this time. 
});
//*************************************
// This next app.get must come last
// DO NOT have a next() in the above app.get unless you have tossed an ERROR
//*************************************
app.get('/*', function (req, res, next ) {
	var err = new Error();
	err.status = 404;				// set status to 404 which is page not found. 
	next(err);						// drop into the error routine below.
});

app.use(function(err, req, res, next) {
	let thisImage = '/static/images/starwars404.jpg';
	let thisMessage;
	if(err.status !== 404) {
		thisImage = '/static/images/technicaldifficulties.jpeg'
		thisMessage = err.status +': ' + err.message || 'we are experiencing technical difficulties';
		res.status = err.status;
	} else {
		thisMessage = err.message || '** page not found **';
		res.status(404);
	}

	res.render(__dirname + '/templates/error.pug', {thisMessage: thisMessage, thisImage: thisImage});
});

app.listen(3000, function(){
	console.log("Twitter Express frontend server started on port 3000");
});		// tell node to listen to port 3000.