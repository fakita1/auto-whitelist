const config = require('../config.json');
const {sendEmbed, getDiscordAddonUser, updateCredits} = require('../src/util');


module.exports = {
    name: 'addcredits',
    isAdminCommand: true,
    async execute(message, args) {

        const taggedUser = message.mentions.users.first();
        if (!args[1] || !taggedUser) return sendEmbed(message, {description: `Please use this syntax: \`${config.botPrefix}addCredits @user type(map, map15, all15) amount\`.`});

        let type = args[1];
        if (!['map', 'map15', 'all15'].includes(type)) return sendEmbed(message, {description: `Wrong credit type. Please use this syntax: \`${config.botPrefix}addCredits @user type(map, map15, all15) amount\`.`});

        let amount = parseInt(args[2]);
        if (isNaN(amount) || amount < 1) return sendEmbed(message, {description: `Amount must be a positive number. Please use this syntax: \`${config.botPrefix}addCredits @user type(map, map15, all15) amount\`.`});


        let user = await getDiscordAddonUser(taggedUser.id);
        if (!user) return sendEmbed(message, {description: `${taggedUser.tag}'s account is not linked to any SteamID`});


        user.credits[type] += amount;
        await updateCredits(user);


        await sendEmbed(message, {description: `Successfully added ${taggedUser.tag} **${amount} \`${type}\` credits.`});
    }
};
