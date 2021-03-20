const {MessageEmbed} = require('discord.js');
const config = require('../config.json');
const {sql} = require('../mysql/pool');


function sendEmbed(message, options) {
    return new Promise(async (resolve, reject) => {

        const embed = new MessageEmbed()
            .setTitle(options.title || config.embeds.title)
            .setDescription(`<@${message.author.id}> ${options.description}`)
            .setColor(config.embeds.color);

        if (options.image) embed.setThumbnail(options.image);

        resolve(await message.channel.send(embed));

    });
}

function getDiscordAddonUser(id) {
    return new Promise(async (resolve, reject) => {

        const [rows, fields] = await sql.execute(`SELECT * FROM ${config.mysql.discordAddonDb}.discordaddonplayers WHERE discid = ? LIMIT 1;`, [id]);
        resolve(rows[0]);

    });
}


function getPoints(steamid) {
    return new Promise(async (resolve, reject) => {

        const [rows, fields] = await sql.execute(`SELECT * FROM ${config.mysql.shopDb}.arkshopplayers WHERE SteamId = ? LIMIT 1;`, [steamid]);
        if (!rows.length) return resolve(0);
        resolve(rows[0].Points);

    });
}


function removePoints(steamid, amount) {
    return new Promise(async (resolve, reject) => {

        const [rows, fields] = await sql.execute(`UPDATE ${config.mysql.shopDb}.arkshopplayers SET Points = Points - ? WHERE SteamId = ? LIMIT 1;`, [amount, steamid]);
        if (!rows.length) return resolve(false);
        resolve(rows[0].Points);

    });
}


function getCredits(steamid, type) {
    return new Promise(async (resolve, reject) => {

        const [rows, fields] = await sql.execute(`SELECT * FROM ${config.mysql.discordAddonDb}.tpg_credits WHERE steamid = ? AND used_timestamp IS NULL AND credit_type = ?;`, [steamid, type]);
        resolve(rows.length);

    });
}

function removeCredits(steamid, type, amount, map) {
    return new Promise(async (resolve, reject) => {

        const [results, fields] = await sql.execute(`UPDATE ${config.mysql.discordAddonDb}.tpg_credits SET used_timestamp = ?, used_map = ? WHERE steamid = ? AND used_timestamp IS NULL AND credit_type = ? LIMIT ?;`, [Date.now(), map, steamid, type, amount]);
        if (results.affectedRows === amount) resolve(true);
        else resolve(false);

    });
}


module.exports = {sendEmbed, getDiscordAddonUser, getPoints, removePoints, getCredits, removeCredits};