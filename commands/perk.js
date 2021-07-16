const config = require('../config.json');
const {sendEmbed} = require('../src/util');
const {sql} = require('../mysql/pool');


module.exports = {
    name: 'perk',
    requiresSteamVerification: true,
    async execute(message, args, user) {

        let steamid = user.SteamId;

        if (!args[0]) {
            let desc = `\nGain access to our extra rates exclusive servers! \n You currently have: \n **${user.credits.all15} Bundles** \n **${user.credits.map15} Clumps**\n **${user.credits.map} Shiny's**\nUse **__TP!bal__** to check current balance\n\n\n**__Server Bundle Packs__** (Includes access to all Map IDs) \n`;

            config.perks.filter(x => x.type === 'all15').forEach(perk => {
                desc += `${perk.days} days | ${perk.price} Bundles: \`${config.botPrefix}perk ${perk.id}\`\n`;
            });
            desc += `\n Available **__perk IDs__**, **__cost__** and **__command__**\n`;
            config.perks.filter(x => x.type === 'map15').forEach(perk => {
                desc += `ID - **__${perk.days}day__** = **__${perk.price}__** Clumps | \`${config.botPrefix}perk ${perk.id} {mapID}\`\n`;
            });
            config.perks.filter(x => x.type === 'map').forEach(perk => {
                desc += `ID - **__${perk.days}day__** = **__${perk.price}__** Shiny's | \`${config.botPrefix}perk ${perk.id} {mapID}\`\n`;
            });

            desc += `\n**__Map ID__** and **__command__** (not needed for Bundles)\n`;

            config.servers.forEach(server => {
                desc += `ID - **__${server.name}__** | \`${config.botPrefix}perk {perkID} ${server.id}\`\n`;
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


        if (user.credits[item.type] < item.price) return sendEmbed(message, {description: `You do not have enough credits to use this perk.`});

        user.credits[item.type] -= item.price;
        await updateCredits(user);


        for (let server of servers) {
            const [rows, fields] = await sql.query(`SELECT * FROM ${config.mysql.discordAddonDb}.tpg_maps WHERE steamid = ? AND map = ? AND expired IS NULL LIMIT 1;`, [steamid, server.id]);
            if (rows.length) { // Player already whitelisted in the server, add more time to their whitelist.
                await sql.query(`UPDATE ${config.mysql.discordAddonDb}.tpg_maps SET days = days + ? WHERE steamid = ? AND map = ? AND expired IS NULL LIMIT 1;`, [item.days, steamid, server.id]);
            } else {
                await sql.query(`INSERT INTO ${config.mysql.discordAddonDb}.tpg_maps (steamid, map, used_timestamp, days) VALUES (?, ?, ?, ?);`, [steamid, server.id, Date.now(), item.days]);
            }
        }

        await sendEmbed(message, {description: `**Successfully redeemed** \`${item.id}\` in **${item.type !== 'all15' ? ` ${servers[0].id}` : 'all maps'}**, please **allow up to 1 minute** for the server to process your request. You will receive a **confirmation by private message** once the process finishes (make sure your DM's are open).`});
    }
};