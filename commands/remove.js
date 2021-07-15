const config = require('../config.json');
const {sendEmbed, getDiscordAddonUser, updateCredits} = require('../src/util');
const {sql} = require('../mysql/pool');


module.exports = {
    name: 'remove',
    isAdminCommand: true,
    async execute(message, args) {

        const taggedUser = message.mentions.users.first();
        if (!taggedUser) return sendEmbed(message, {description: `Please use this syntax: \`${config.botPrefix}remove @user\`.`});

        let user = await getDiscordAddonUser(message.author.id);
        if (!user) return sendEmbed(message, {description: `${taggedUser.tag}'s account is not linked to any SteamID`});

        // Setting all unused credits as used.
        user.credits.map = 0;
        user.credits.map15 = 0;
        user.credits.all15 = 0;
        await updateCredits(user);


        // Expire automated function will later remove whitelist.
        // Executed = '1' to prevent non-executed whitelists to be executed later.
        await sql.query(`UPDATE ${config.mysql.discordAddonDb}.tpg_maps SET used_timestamp = 0, executed = '1' WHERE steamid = ? AND expired IS NULL;`, [user.SteamId]);


        await sendEmbed(message, {description: `Successfully removed all ${taggedUser.tag}'s credits and active whitelists.`});
    }
};