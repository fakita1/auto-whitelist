const config = require('../config.json');
const {sendEmbed, getDiscordAddonUser, updateCredits} = require('../src/util');


module.exports = {
    name: 'addpatron',
    isAdminCommand: true,
    async execute(message, args) {

        const taggedUser = message.mentions.users.first();
        if (!args[1] || !taggedUser) return sendEmbed(message, {description: `Please use this syntax: \`${config.botPrefix}addPatron @user {patronConfigID}\`.`});

        const tier = config.tiers.find(x => x.id === args[1]);
        if (!tier) return sendEmbed(message, {description: `Selected tier does not exist.`});

        let user = await getDiscordAddonUser(taggedUser.id);
        if (!user) return sendEmbed(message, {description: `${taggedUser.tag}'s account is not linked to any SteamID`});

        let credits = user.credits;

        credits.map += tier.mapCredits;
        credits.map15 += tier.map15Credits;
        credits.all15 += tier.all15Credits;

        await updateCredits(user);

        await sendEmbed(message, {description: `Successfully added ${taggedUser.tag} **${tier.mapCredits} Shiny's**, **${tier.map15Credits} Clumps** and **${tier.all15Credits} Bundles**.`});
    }
};
