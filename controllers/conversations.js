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


    function autocompleteCity(response){                    
      http.get("http://autocomplete.wunderground.com/aq?query="+response+"&c=US", function(response) {})
    }

    controller.hears(['weather'], 'message_received', function(bot, message) {

        bot.startConversation(message, function(err, convo) {
            convo.say('I can help you with that.');

            convo.ask('What city do you want to know the weather for?', function(response, convo) {
                convo.say('Awesome.');
                convo.next();
            });

            convo.ask('What state is that in?', function(response, convo) {
                convo.say('Ok.')
                convo.next();
            }, { 'key': 'state' });

            convo.on('end', function(convo) {

                if (convo.status == 'completed') {
                    // do something useful with the users responses
                    var res = convo.extractResponses();
                    var city = res.city;
                    var state = res.state;

                    console.log(city + ', ' + state);
                    var url = '/api/' + process.env.WUNDERGROUND_KEY + '/forecast/q/'+state+'/'+city+'.json'

                    http.get({
                        host: 'api.wunderground.com',
                        path: url
                    }, function(response) {
                        
                    })


                } else {
                  console.log("something else happened")
                    // something happened that caused the conversation to stop prematurely
                }

            });
        });
    });

    // user says anything else
    controller.hears('(.*)', 'message_received', function(bot, message) {
        bot.reply(message, 'you said ' + message.match[1])
    })
}
