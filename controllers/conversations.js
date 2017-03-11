module.exports = function(controller) {
    // this is triggered when a user clicks the send-to-messenger plugin
    controller.on('facebook_optin', function(bot, message) {
        bot.reply(message, 'Welcome, friend')
    })

    // user said hello
    controller.hears(['hello'], 'message_received', function(bot, message) {
        bot.reply(message, 'Hey there.')
    })


    controller.hears(['cookies'], 'message_received', function(bot, message) {

        bot.startConversation(message, function(err, convo) {

            convo.say('Did someone say cookies!?!!');
            convo.ask('What is your favorite type of cookie?', function(response, convo) {
                convo.say('Golly, I love ' + response.text + ' too!!!');
                convo.next();
            });
        });
    });


    controller.hears(["weather"],'message_received',function(bot, message) {

        var txt = message.text;
        txt = txt.toLowerCase().replace('weather ', '');
        var city = txt.split(',')[0].trim().replace(' ', '_');
        var state = txt.split(',')[1].trim();

        console.log(city + ', ' + state);
        var url = '/api/' + key + '/forecast/q/state/city.json'
        url = url.replace('state', state);
        url = url.replace('city', city);

        http.get({
            host: 'api.wunderground.com',
            path: url
        }, function(response) {
            var body = '';
            response.on('data', function(d) {
                body += d;
            })
            response.on('end', function() {
                var data = JSON.parse(body);
                var days = data.forecast.simpleforecast.forecastday;
                for (i = 0; i < days.length; i++) {
                    bot.reply(message, days[i].date.weekday +
                        ' high: ' + days[i].high.fahrenheit +
                        ' low: ' + days[i].low.fahrenheit +
                        ' condition: ' + days[i].conditions);
                    bot.reply(message, days[i].icon_url);
                }
            })
        })
    });

    // user says anything else
    controller.hears('(.*)', 'message_received', function(bot, message) {
        bot.reply(message, 'you said ' + message.match[1])
    })
}
