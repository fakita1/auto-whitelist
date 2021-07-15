const config = require('../config.json');
const {sendEmbed, getPoints, removePoints} = require('../src/util');
const {sql} = require('../mysql/pool');

module.exports = {
    name: 'buy',
    requiresSteamVerification: true,
    async execute(message, args, steamid) {

        let id = args[0];
        if (!id) { // Help message.
            let desc = `This is our current shop list! Please follow the following syntax and redeem using TP!perk :\n\nItem | (Cost) : Command\n`;
            config.shop.forEach(item => {
                desc += `**${item.name}** | **(${item.price} TrashSnacks)**: \`${config.botPrefix}buy ${item.id}\`\n\n`;
            });
            return await sendEmbed(message, {description: desc});
        }

        let item = config.shop.find(x => x.id === id);
        if (!item) return await sendEmbed(message, {description: `No shop item with ID \`${id}\` was found.`});

        let points = await getPoints(steamid);
        if (points < item.price) return await sendEmbed(message, {description: `You do not have enough points.`});
        await removePoints(steamid, item.price);

        let values = [], now = Date.now();
        for (let i = 0; i < item.amount; i++) {
            values.push(`('${steamid}', '${item.type}', ${now})`);
        }
        await sql.query(`INSERT INTO ${config.mysql.discordAddonDb}.tpg_credits (steamid, credit_type, added_timestamp) VALUES ${values.join(', ')};`);

        await sendEmbed(message, {description: `Successfully bought **${item.name}** for ${item.price} TrashSnacks.`});
    }
};