const config = require('../config.json');
const {sendEmbed, getDiscordAddonUser} = require('../src/util');
const {sql} = require('../mysql/pool');


module.exports = {
    name: 'remove',
    isAdminCommand: true,
    async execute(message, args) {

        const taggedUser = message.mentions.users.first();
        if (!taggedUser) return sendEmbed(message, {description: `Please use this syntax: \`${config.botPrefix}remove @user\`.`});

        let user = await getDiscordAddonUser(message.author.id);
        if (!user) return sendEmbed(message, {description: `${taggedUser.tag}'s account is not linked to any SteamID`});

        await sql.execute(`UPDATE ${config.mysql.discordAddonDb}.tpg_credits SET used_timestamp = ?, used_map = ? WHERE steamid = ?;`, [Date.now(), 'admin_remove', user.SteamId]);

        await sendEmbed(message, {description: `Successfully removed all ${taggedUser.tag}'s credits and active whitelists.`});
    }
};