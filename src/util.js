const {MessageEmbed} = require('discord.js');
const config = require('../config.json');
const {sql} = require('../mysql/pool');


// Sends a default embed with specified options.
function sendEmbed(message, options) {
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
            .setDescription((user ? '' : `<@${ message.author.id}> `) + options.description)
            .setColor(config.embeds.color);

        if (options.image) embed.setThumbnail(options.image);

        resolve(await channel.send(embed));

    });
}


// Gets user row from DiscordAddon table (where users verify their SteamID).
function getDiscordAddonUser(id) {
    return new Promise(async (resolve, reject) => {

        const [rows, fields] = await sql.execute(`SELECT * FROM ${config.mysql.discordAddonDb}.discordaddonplayers WHERE discid = ? OR steamid = ? LIMIT 1;`, [id, id]);
        resolve(rows[0]);

    });
}


// Gets user points amount.
function getPoints(steamid) {
    return new Promise(async (resolve, reject) => {

        const [rows, fields] = await sql.execute(`SELECT * FROM ${config.mysql.shopDb}.arkshopplayers WHERE SteamId = ? LIMIT 1;`, [steamid]);
        if (!rows.length) return resolve(0);
        resolve(rows[0].Points);

    });
}


// Removes specified amount of points and returns if query was successful.
function removePoints(steamid, amount) {
    return new Promise(async (resolve, reject) => {

        const [rows, fields] = await sql.execute(`UPDATE ${config.mysql.shopDb}.arkshopplayers SET Points = Points - ? WHERE SteamId = ? LIMIT 1;`, [amount, steamid]);
        if (!rows.length) return resolve(false);
        resolve(rows[0].Points);

    });
}


// Gets credit amount within the specified type (map: Single map credit (Shiny's) | all: Bundle Credits).
function getCredits(steamid, type) {
    return new Promise(async (resolve, reject) => {

        const [rows, fields] = await sql.execute(`SELECT * FROM ${config.mysql.discordAddonDb}.tpg_credits WHERE steamid = ? AND used_timestamp IS NULL AND credit_type = ?;`, [steamid, type]);
        resolve(rows.length);

    });
}


// Removes specified amount of credits and returns if query was successful.
function removeCredits(steamid, type, amount, map) {
    return new Promise(async (resolve, reject) => {

        const [results, fields] = await sql.execute(`UPDATE ${config.mysql.discordAddonDb}.tpg_credits SET used_timestamp = ?, used_map = ? WHERE steamid = ? AND used_timestamp IS NULL AND credit_type = ? LIMIT ?;`, [Date.now(), map, steamid, type, amount]);
        if (results.affectedRows === amount) resolve(true);
        else resolve(false);

    });
}



module.exports = {sendEmbed, getDiscordAddonUser, getPoints, removePoints, getCredits, removeCredits};