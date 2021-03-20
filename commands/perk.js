const config = require('../config.json');
const {sendEmbed} = require('../src/util');
const {sql} = require('../mysql/pool');


module.exports = {
    name: 'perk',
    requiresSteamVerification: true,
    async execute(message, args, steamid) {

        if (!args[1]) {
            let desc = `Gain access to our extra rates exclusive servers! You currently have **${1} Super Shiny's** and **${1} Shiny's**.\n\n\n**__All servers whitelist__**\n`;

            config.perks.filter(x => x.type === 'all').forEach(perk => {
                desc += `${perk.days} days | ${perk.price} Super Shiny's: \`${config.botPrefix}perk ${perk.id}\`\n`;
            });
            desc += `\n**__Single server whitelist__**\n`;
            config.perks.filter(x => x.type === 'map').forEach(perk => {
                desc += `${perk.days} days | ${perk.price} Shiny's: \`${config.botPrefix}perk ${perk.id} {mapID}\`\n`;
            });

            desc += `\n**__Server list__** (not needed for Super Shiny's)\n`;

            config.servers.forEach(server => {
                desc += `${server.name} | \`${config.botPrefix}perk {perkID} ${server.id}\`\n`;
            });

            return await sendEmbed(message, {description: desc});
        }
    }
};