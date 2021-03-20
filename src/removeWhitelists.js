const {sql} = require('../mysql/pool');
const config = require('../config.json');
const {sendRcon} = require('./rcon');
const {sendEmbed, getDiscordAddonUser} = require('../src/util');


async function removeWhitelists() {
    const [rows, fields] = await sql.query(`SELECT * FROM ${config.mysql.discordAddonDb}.tpg_maps WHERE expired IS NULL AND executed IS NOT NULL AND used_timestamp + days * 24 * 60 * 60 * 1000 < ?;`, [Date.now()]);

    rows.forEach(async (row) => {
        let server = config.servers.find(x => x.id === row.map); // Get server config.

        if (server) {
            let responses = await sendRcon(server, [`DisallowPlayerToJoinNoCheck ${row.steamid}`, `KickPlayer ${row.steamid}`]);
            if (responses){
                console.log(responses);
                await sql.query(`UPDATE ${config.mysql.discordAddonDb}.tpg_maps SET expired = '1' WHERE id = ?;`, [row.id]);
                console.log(`Successfully removed ${row.steamid} from ${row.map}'s whitelist.`);

                // Send private message with a notification.
                let user = await getDiscordAddonUser(row.steamid);
                if (user) await sendEmbed(user.discid, {description: `Your whitelist in \`${row.map}\` **has expired**! Would you like to **renew it**? Use the \`${config.botPrefix}perk\` command.`});
            }

        } else { // Expire whitelist if server config does not exist anymore.
            await sql.query(`UPDATE ${config.mysql.discordAddonDb}.tpg_maps SET expired = '1' WHERE id = ?;`, [row.id]);
        }

    })
}


module.exports = {removeWhitelists};