const config = require('../config.json');
const {sendEmbed, getCredits, removeCredits} = require('../src/util');
const {sql} = require('../mysql/pool');


module.exports = {
    name: 'perk',
    requiresSteamVerification: true,
    async execute(message, args, steamid) {

        let allCredits = await getCredits(steamid, 'all');
        let mapCredits = await getCredits(steamid, 'map');

        if (!args[0]) {
            let desc = `Gain access to our extra rates exclusive servers! You currently have **${allCredits} Bundles** and **${mapCredits} Shiny's**.\n\n\n**__All servers whitelist__**\n`;

            config.perks.filter(x => x.type === 'all').forEach(perk => {
                desc += `${perk.days} days | ${perk.price} Bundles: \`${config.botPrefix}perk ${perk.id}\`\n`;
            });
            desc += `\n**__Single server whitelist__**\n`;
            config.perks.filter(x => x.type === 'map').forEach(perk => {
                desc += `${perk.days} days | ${perk.price} Shiny's: \`${config.botPrefix}perk ${perk.id} {mapID}\`\n`;
            });

            desc += `\n**__Server list__** (not needed for Bundles)\n`;

            config.servers.forEach(server => {
                desc += `${server.name} | \`${config.botPrefix}perk {perkID} ${server.id}\`\n`;
            });

            return await sendEmbed(message, {description: desc});
        }

        let item = config.perks.find(x => x.id === args[0]);
        if (!item) return sendEmbed(message, {description: `Selected pack does not exist.`});

        let servers = [];
        if (item.type === 'map') {
            let server = config.servers.find(x => x.id === args[1]);
            if (!server) return sendEmbed(message, {description: `Selected server does not exist.`});
            servers.push(server);
        } else {
            servers = config.servers; // All servers for bundle pack.
        }


        let enoughCredits = item.type === 'map' ? mapCredits >= item.price : allCredits >= item.price;
        if (enoughCredits) enoughCredits = await removeCredits(steamid, item.type, item.price, item.type === 'map' ? servers[0].id : 'all');
        if (!enoughCredits) return sendEmbed(message, {description: `You do not have enough credits to use this perk.`});


        for (let server of servers) {

        }
    }
};