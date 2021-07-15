const config = require('../config.json');
const {sendEmbed, getCredits} = require('../src/util');
const {sql} = require('../mysql/pool');


module.exports = {
    name: 'bal',
    requiresSteamVerification: true,
    async execute(message, args, steamid) {

        let allCredits = await getCredits(steamid, 'all');
        let mapCredits = await getCredits(steamid, 'map');

        const [rows, fields] = await sql.query(`SELECT * FROM ${config.mysql.discordAddonDb}.tpg_maps WHERE steamid = ? AND expired IS NULL;`, [steamid]);

        let activeWhitelistsText = rows.length ? '' : `No active whitelists at the moment! Execute the \`${config.botPrefix}perk\` command and get exclusive benefits.`;
        for (let row of rows) {
            activeWhitelistsText += `\`${row.map}\`: ${((row.used_timestamp - Date.now() + row.days * 24 * 60 * 60 * 1000) / (1000 * 60 * 60 * 24)).toFixed(1)} days left.\n`;
        }
        await sendEmbed(message, {
            description: `\n Your Current Balance \n **${allCredits} Bundles** \n **${mapCredits} Shiny's**. 
        \n\n**__Active whitelists__**\n${activeWhitelistsText}`
        });

    }
};
