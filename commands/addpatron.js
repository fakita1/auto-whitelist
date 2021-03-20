const config = require('../config.json');
const {sendEmbed, getDiscordAddonUser} = require('../src/util');
const {sql} = require('../mysql/pool');


module.exports = {
    name: 'addpatron',
    isAdminCommand: true,
    async execute(message, args) {

        const taggedUser = message.mentions.users.first();
        if (!args[1] || !taggedUser) return sendEmbed(message, {description: `Please use this syntax: \`${config.botPrefix}addPatron @user {patronConfigID}\`.`});

        const tier = config.tiers.find(x => x.id === args[1]);
        if (!tier) return sendEmbed(message, {description: `Selected tier does not exist.`});

        let user = await getDiscordAddonUser(message.author.id);
        if (!user) return sendEmbed(message, {description: `${taggedUser.tag}'s account is not linked to any SteamID`});


        // Adding values dynamically to query.
        let values = [], now = Date.now();
        for (let i = 0; i < tier.mapCredits; i++) {
            values.push(`('${user.SteamId}', 'map', ${now})`);
        }
        for (let i = 0; i < tier.allCredits; i++) {
            values.push(`('${user.SteamId}', 'all', ${now})`);
        }

        await sql.execute(`INSERT INTO ${config.mysql.discordAddonDb}.tpg_credits (steamid, credit_type, added_timestamp) VALUES ${values.join(', ')};`);
        await sendEmbed(message, {description: `Successfully added ${taggedUser.tag} **${tier.mapCredits} Shiny's** and **${tier.allCredits} Bundles**.`});
    }
};
