'use strict'

// const dotenv = require('dotenv');
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const mongoose = require("mongoose");
const db = mongoose.connect(process.env.MONGODB_URI);

const Movie = require("./models/movie");
const Weather = require("./models/weather");

const app = express();

var Botkit = require('botkit');
var controller = Botkit.facebookbot({
        access_token: process.env.FB_PAGE_ACCESS_TOKEN,
        verify_token: process.env.VERIFY_TOKEN
})

var bot = controller.spawn({
});


// dotenv.load(); //For Local Dev

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function(req, res) {
    res.send('Hello world, I am a chat boo')
})

// for Facebook verification
app.get('/webhook/', function(req, res) {
    if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
        console.log("Verified webhook");
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        console.error("Verification failed. The tokens do not match.");
        res.sendStatus(403);
    }
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})


// All callbacks for Messenger will be POST-ed here
app.post("/webhook", function(req, res) {
    // Make sure this is a page subscription
    if (req.body.object == "page") {
        // Iterate over each entry
        // There may be multiple entries if batched
        req.body.entry.forEach(function(entry) {
            // Iterate over each messaging event
            entry.messaging.forEach(function(event) {
                if (event.postback) {
                    processPostback(event);
                } else if (event.message) {
                    processMessage(event);
                }
            });
        });

        res.sendStatus(200);
    }
});

function processPostback(event) {
    var senderId = event.sender.id;
    var payload = event.postback.payload;

    if (payload === "Greeting") {
        // Get user's first name from the User Profile API
        // and include it in the greeting
        request({
            url: "https://graph.facebook.com/v2.6/" + senderId,
            qs: {
                access_token: process.env.FB_PAGE_ACCESS_TOKEN,
                fields: "first_name"
            },
            method: "GET"
        }, function(error, response, body) {
            var name = "";
            var greeting = "";
            if (error) {
                console.log("Error getting user's name: " + error);
            } else {
                var bodyObj = JSON.parse(body);
                name = bodyObj.first_name;
                greeting = "Hi " + name + ". ";
            }
            var message = greeting + "My name is MilesBot. I can tell you various details regarding movies, traffic, and weather. What would you like to know about?";
            sendMessage(senderId, { text: message });
        });
    } else if (payload === "Correct") {
        sendMessage(senderId, { text: "Awesome! What would you like to find out? Enter 'plot', 'date', 'runtime', 'director', 'cast' or 'rating' for the various details." });
    } else if (payload === "Incorrect") {
        sendMessage(senderId, { text: "Oops! Sorry about that. Try using the exact title of the movie" });
    }
}

function processMessage(event) {
    if (!event.message.is_echo) {
        var message = event.message;
        var senderId = event.sender.id;

        console.log("Received message from senderId: " + senderId);
        console.log("Message is: " + JSON.stringify(message));

        // You may get a text or attachment but not both
        if (message.text) {
            var formattedMsg = message.text.toLowerCase().trim();

            // If we receive a text message, check to see if it matches any special
            // keywords and send back the corresponding movie detail.
            // Otherwise search for new movie.
            switch (formattedMsg) {
            	case "weather":
            		getWeather(senderId,'london');
            		break;
                case "plot":
                case "date":
                case "runtime":
                case "director":
                case "cast":
                case "rating":
                    getMovieDetail(senderId, formattedMsg);
                    break;

                default:
                    findMovie(senderId, formattedMsg);
            }
        } else if (message.attachments) {
            sendMessage(senderId, { text: "Sorry, I don't understand your request." });
        }
    }
}

function findMovie(userId, movieTitle) {
    request("http://www.omdbapi.com/?type=movie&t=" + movieTitle, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var movieObj = JSON.parse(body);
            if (movieObj.Response === "True") {
                var query = { user_id: userId };
                var update = {
                    user_id: userId,
                    title: movieObj.Title,
                    plot: movieObj.Plot,
                    date: movieObj.Released,
                    runtime: movieObj.Runtime,
                    director: movieObj.Director,
                    cast: movieObj.Actors,
                    rating: movieObj.imdbRating,
                    poster_url: movieObj.Poster
                };
                var options = { upsert: true };
                Movie.findOneAndUpdate(query, update, options, function(err, mov) {
                    if (err) {
                        console.log("Database error: " + err);
                    } else {
                        var message = {
                            attachment: {
                                type: "template",
                                payload: {
                                    template_type: "generic",
                                    elements: [{
                                        title: movieObj.Title,
                                        subtitle: "Is this the movie you are looking for?",
                                        image_url: movieObj.Poster === "N/A" ? "http://placehold.it/350x150" : movieObj.Poster,
                                        buttons: [{
                                            type: "postback",
                                            title: "Yes",
                                            payload: "Correct"
                                        }, {
                                            type: "postback",
                                            title: "No",
                                            payload: "Incorrect"
                                        }]
                                    }]
                                }
                            }
                        };
                        sendMessage(userId, message);
                    }
                });
            } else {
                console.log(movieObj.Error);
                sendMessage(userId, { text: movieObj.Error });
            }
        } else {
            sendMessage(userId, { text: "Something went wrong. Try again." });
        }
    });
}

function getMovieDetail(userId, field) {
    Movie.findOne({ user_id: userId }, function(err, movie) {
        if (err) {
            sendMessage(userId, { text: "Something went wrong. Try again" });
        } else {
            sendMessage(userId, { text: movie[field] });
        }
    });
}


// sends message to user
function sendMessage(recipientId, message) {
    console.log("send", recipientId, message)
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: process.env.FB_PAGE_ACCESS_TOKEN },
        method: "POST",
        json: {
            recipient: { id: recipientId },
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log("Error sending message: " + response.error);
        }
    });
}


function getWeather(userId, city) {
    request("http://api.wunderground.com/api/"+process.env.WUNDERGROUND_KEY+"/conditions/q/UK/London.json", function(error, response, body) {
    	// console.log("hello",response,body);
        if (!error && response.statusCode == 200) {
            var weatherObj = JSON.parse(body);
            if (weatherObj.response) {
            	console.log("weather object!")
            	var message;
                // var update = {
                //     forcast: weatherObj.weather.description,
                //     icon: weatherObj.weather.icon,
                //     currentTemp: weatherObj.main.temp,
                //     minTemp: weatherObj.main.temp_min,
                //     maxTemp: weatherObj.main.temp_max
                // };

                message = "The weather in "+city+" is currently "+update.forcast+" and "+update.currentTemp+" degrees. The high for today is "+update.maxTemp+"degrees, and the low is "+update.minTemp+" degrees."
 
            	sendMessage(userId, message);
            } else {
                console.log(weatherObj.Error);
                sendMessage(userId, { text: weatherObj.Error });
            }
        } else {
        	console.log("Error: "+error);
            sendMessage(userId, { text: "Something went wrong. Try again."});
        }
    });
}
