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

    
    // user says anything else
    controller.hears('(.*)', 'message_received', function(bot, message) {
        bot.reply(message, 'you said ' + message.match[1])
    })
}
