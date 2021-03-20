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


module.exports = {sendEmbed, getDiscordAddonUser, getPoints, removePoints};