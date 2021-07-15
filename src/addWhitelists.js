const {sql} = require('../mysql/pool');
const config = require('../config.json');
const {sendRcon} = require('../src/rcon');
const {sendEmbed, getDiscordAddonUser} = require('../src/util');


async function addWhitelists() {
    const [rows, fields] = await sql.query(`SELECT * FROM ${config.mysql.discordAddonDb}.tpg_maps WHERE executed IS NULL;`);

    rows.forEach(async (row) => {
        let server = config.servers.find(x => x.id === row.map); // Get server config.

        if (server) {
            let responses = await sendRcon(server, [`AllowPlayerToJoinNoCheck ${row.steamid}`]);
            if (responses) {
                console.log(responses);
                await sql.query(`UPDATE ${config.mysql.discordAddonDb}.tpg_maps SET executed = '1' WHERE id = ?;`, [row.id]);
                console.log(`Successfully added ${row.steamid} to ${row.map}'s whitelist.`);

                // Send private message with a notification.
                let user = await getDiscordAddonUser(row.steamid);
                if (user) await sendEmbed(user.discid, {description: `**Successfully activated** your whitelist in \`${row.map}\`! Would you like to **check your remaining time**? Use the \`${config.botPrefix}balance\` command.`});
            }

        } else { // Mark as executed if server config does not exist anymore.
            await sql.query(`UPDATE ${config.mysql.discordAddonDb}.tpg_maps SET executed = '1' WHERE id = ?;`, [row.id]);
        }

    });
}


module.exports = {addWhitelists};