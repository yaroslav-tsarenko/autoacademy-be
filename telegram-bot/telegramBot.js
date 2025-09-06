const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;

console.log('Bot starting...');

const bot = new TelegramBot(token, {polling: true});

const publicChannelUsername = '@avtoacademy_notifications';

bot.on('message', (msg) => {
    console.log('Received message:', msg);
    if (msg.chat && msg.chat.type === 'channel') {
        console.log('Channel ID:', msg.chat.id);
    }
});

/*bot.sendMessage(publicChannelUsername, 'Bot started✅')
    .then(() => {
        console.log('Startup message sent to channel.');
        return bot.getChat(publicChannelUsername);
    })
    .then((chat) => {
        console.log('Channel Info:', chat);
    })
    .catch((error) => console.error('Error:', error));*/

const sendMessageToChannel = (message) => {
    bot.sendMessage(publicChannelUsername, message)
        .then(() => console.log('Message sent to channel.'))
        .catch((error) => console.error('Error sending message to channel:', error));
};

console.log('Bot started successfully');

module.exports = {
    sendMessageToChannel
};