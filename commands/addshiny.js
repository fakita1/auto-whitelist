const config = require('../config.json');
const {sendEmbed, getDiscordAddonUser} = require('../src/util');
const {sql} = require('../mysql/pool');


module.exports = {
    name: 'addshiny',
    isAdminCommand: true,
    async execute(message, args) {

        const taggedUser = message.mentions.users.first();
        if (!args[1] || !taggedUser) return sendEmbed(message, {description: `Please use this syntax: \`${config.botPrefix}addShiny @user amount\`.`});

        let amount = parseInt(args[1]);
        if (isNaN(amount) || amount < 1) return sendEmbed(message, {description: `Amount must be a positive number. Please use this syntax: \`${config.botPrefix}addShiny @user amount\`.`});

        let user = await getDiscordAddonUser(taggedUser.id);
        if (!user) return sendEmbed(message, {description: `${taggedUser.tag}'s account is not linked to any SteamID`});


        // Adding values dynamically to query.
        let values = [], now = Date.now();
        for (let i = 0; i < amount; i++) {
            values.push(`('${user.SteamId}', 'map', ${now})`);
        }

        await sql.query(`INSERT INTO ${config.mysql.discordAddonDb}.tpg_credits (steamid, credit_type, added_timestamp) VALUES ${values.join(', ')};`);
        await sendEmbed(message, {description: `Successfully added ${taggedUser.tag} **${amount} Shiny's**.`});
    }
};
