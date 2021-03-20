const config = require('./config.json');
const {sql} = require('./mysql/pool');
const PREFIX = config.botPrefix;
const {sendEmbed, getDiscordAddonUser} = require('./src/util');

const {Client, Collection} = require('discord.js');
const client = new Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION']});
module.exports = {client};

// Dynamically adding commands to collection.
const fs = require('fs');
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}


client.on('ready', async () => {
    console.log('Bot online!');
    await client.user.setActivity(config.botStatus);
});


client.on('message', async message => {

    if (message.guild === null || !message.content.startsWith(PREFIX)) return; // Private message or not a command with prefix.
    const args = message.content.substring(PREFIX.length).toLowerCase().split(' ');

    // Args[0] is the command, then the Array is shifted to get and remove first argument.
    // Now, args[0] will be an argument, not the command.
    const command = client.commands.get(args.shift());
    if (!command) return; // Command does not exist.

    if (command.isAdminCommand && !config.adminIDs.includes(message.author.id)) return await sendEmbed(message, {description: `This command is **admins only**.`});
    let steamid = null;

    try {

        if (command.requiresSteamVerification) {

            let user = await getDiscordAddonUser(message.author.id);

            // No user with that DiscordID found in DB.
            if (!user) return await sendEmbed(message, {description: `Your discord account is **not linked to any SteamID**. Please execute the \`${config.botPrefix}verify\` command.`});

            steamid = user.SteamId;
        }


        command.execute(message, args, steamid);

    } catch (error) {
        console.error(error);
        await message.reply('there was an error trying to execute that command! Please report it to an admin.');
    }


});


process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error('Uncaught Exception thrown', err);
    });


client.login(config.botToken);