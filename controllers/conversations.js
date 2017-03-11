module.exports = function(controller) {
    // this is triggered when a user clicks the send-to-messenger plugin
    controller.on('facebook_optin', function(bot, message) {
        bot.reply(message, 'Welcome, friend')
    })

    // user said hello
    controller.hears(['hello'], 'message_received', function(bot, message) {
        bot.reply(message, 'Hey there.')
    })


    controller.hears(['weather'], 'message_received', function(bot, message) {

        bot.startConversation(message, function(err, convo) {

            convo.say('Did someone say cookies!?!!');
            convo.ask('What is your favorite type of cookie?', function(response, convo) {
                convo.say('Golly, I love ' + response.text + ' too!!!');
                convo.next();
            });
        });
    });


    controller.hears(["weather"], 'message_received', function(bot, message) {

        // var txt = message.text;
        // console.log(txt)
        // txt = txt.toLowerCase().replace('weather ', '');
        // var city = txt.split(',')[0].trim().replace(' ', '_');
        // var state = txt.split(',')[1].trim();

        // console.log(city + ', ' + state);
        // var url = '/api/' + key + '/forecast/q/state/city.json'
        // url = url.replace('state', state);
        // url = url.replace('city', city);

        // http.get({
        //     host: 'api.wunderground.com',
        //     path: url
        // }, function(response) {
        //     var body = '';
        //     response.on('data', function(d) {
        //         body += d;
        //     })
        //     response.on('end', function() {
        //         var data = JSON.parse(body);
        //         var days = data.forecast.simpleforecast.forecastday;
        //         for (i = 0; i < days.length; i++) {
        //             bot.reply(message, days[i].date.weekday +
        //                 ' high: ' + days[i].high.fahrenheit +
        //                 ' low: ' + days[i].low.fahrenheit +
        //                 ' condition: ' + days[i].conditions);
        //             bot.reply(message, days[i].icon_url);
        //         }
        //     })
        // })
    });

    controller.hears(['pizzatime'], 'message_received', function(bot, message) {
        var askFlavor = function(err, convo) {
            convo.ask('What flavor of pizza do you want?', function(response, convo) {
                convo.say('Awesome.');
                askSize(response, convo);
                convo.next();
            });
        };
        var askSize = function(response, convo) {
            convo.ask('What size do you want?', function(response, convo) {
                convo.say('Ok.')
                askWhereDeliver(response, convo);
                convo.next();
            });
        };
        var askWhereDeliver = function(response, convo) {
            convo.ask('So where do you want it delivered?', function(response, convo) {
                convo.say('Ok! Good bye.');
                convo.next();
            });
        };

        bot.startConversation(message, askFlavor);
    });

    // user says anything else
    controller.hears('(.*)', 'message_received', function(bot, message) {
        bot.reply(message, 'you said ' + message.match[1])
    })
}
