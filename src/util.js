const {MessageEmbed} = require('discord.js');
const config = require('../config.json');
const {sql} = require('../mysql/pool');


function sendEmbed(channel, options) {
    return new Promise(async (resolve, reject) => {

        const embed = new MessageEmbed()
            .setTitle(options.title || config.embeds.title)
            .setDescription(options.description)
            .setColor(config.embeds.color);

        if (options.image) embed.setThumbnail(options.image);

        resolve(await channel.send(embed));

    });
}

function getDiscordAddonUser(id) {
    return new Promise(async (resolve, reject) => {

        const [rows, fields] = await sql.execute(`SELECT * FROM ${config.mysql.discordAddonDb}.discordaddonplayers WHERE discid = ? LIMIT 1;`, [id]);
        resolve(rows[0]);

    });
}


module.exports = {sendEmbed, getDiscordAddonUser};