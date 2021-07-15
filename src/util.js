const {MessageEmbed} = require('discord.js');
const config = require('../config.json');
const {sql} = require('../mysql/pool');


// Sends a default embed with specified options.
function sendEmbed(message, options, msg) {
    return new Promise(async (resolve, reject) => {

        let user, channel;
        if (typeof message === 'string') {
            const {client} = require('../index');
            user = client.users.cache.get(message);
            channel = user;
        } else {
            channel = message.channel;
        }


        const embed = new MessageEmbed()
            .setTitle(options.title || config.embeds.title)
            .setDescription((user ? '' : `<@${message.author.id}> `) + options.description)
            .setColor(config.embeds.color);

        if (options.image) embed.setThumbnail(options.image);
        if (options.imageBig) embed.setImage(options.imageBig);

        if (!msg) resolve(await channel.send(embed));
        else resolve(await msg.edit(embed));


    });
}


// Gets user row from DiscordAddon table (where users verify their SteamID).
function getDiscordAddonUser(id) {
    return new Promise(async (resolve, reject) => {

        const [rows, fields] = await sql.query(`SELECT * FROM ${config.mysql.discordAddonDb}.discordaddonplayers WHERE discid = ? OR steamid = ? LIMIT 1;`, [id, id]);
        let user = rows[0];

        let credits = JSON.parse(user.tpg_credits);

        if (!credits.map) credits.map = 0;
        if (!credits.map15) credits.map15 = 0;
        if (!credits.all15) credits.all15 = 0;

        user.credits = credits;

        resolve(user);

    });
}


// Gets user points amount.
function getPoints(steamid) {
    return new Promise(async (resolve, reject) => {

        const [rows, fields] = await sql.query(`SELECT * FROM ${config.mysql.shopDb}.arkshopplayers WHERE SteamId = ? LIMIT 1;`, [steamid]);
        if (!rows.length) return resolve(0);
        resolve(rows[0].Points);

    });
}


// Removes specified amount of points and returns if query was successful.
function removePoints(steamid, amount) {
    return new Promise(async (resolve, reject) => {

        const [rows, fields] = await sql.query(`UPDATE ${config.mysql.shopDb}.arkshopplayers SET Points = Points - ? WHERE SteamId = ? LIMIT 1;`, [amount, steamid]);
        if (!rows.length) return resolve(false);
        resolve(rows[0].Points);

    });
}


function updateCredits(user) {
    return new Promise(async (resolve, reject) => {

        await sql.query(`UPDATE ${config.mysql.discordAddonDb}.discordaddonplayers SET tpg_credits = ? WHERE discid = ?;`, [JSON.stringify(user.credits), user.discid]);
        resolve(true);

    });
}


module.exports = {sendEmbed, getDiscordAddonUser, getPoints, removePoints, updateCredits};