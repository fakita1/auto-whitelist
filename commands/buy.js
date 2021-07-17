const config = require('../config.json');
const {sql} = require('../mysql/pool');
const {shopPage} = require('../src/shopPagination');
const {sendEmbed, getPoints, removePoints, updateCredits} = require('../src/util');

module.exports = {
    name: 'buy',
    requiresSteamVerification: true,
    async execute(message, args, user) {

        let steamid = user.SteamId;

        let id = args[0];
        if (!id) { // Help message.
            return await shopPage(null, message, 0);
        }

        let item = config.shop.find(x => x.id === id);
        if (!item) return await sendEmbed(message, {description: `No shop item with ID \`${id}\` was found.`});

        let points = await getPoints(steamid);
        if (points < item.price) return await sendEmbed(message, {description: `You do not have enough points.`});
        await removePoints(steamid, item.price);

        if (item.type === 'kit') {
            const [rows, fields] = await sql.query(`SELECT * FROM ${config.mysql.shopDb}.arkshopplayers WHERE SteamId = ? LIMIT 1;`, [steamid]);
            let kits = JSON.parse(rows[0].Kits);
            if (!kits[item.kitId]) kits[item.kitId] = {Amount: 1};
            else kits[item.kitId].Amount++;

            await sql.query(`UPDATE ${config.mysql.shopDb}.arkshopplayers SET Kits = ? WHERE SteamId = ? LIMIT 1;`, [JSON.stringify(kits, null, 0), steamid]);
        } else {
            user.credits[item.type] += item.amount;
            await updateCredits(user);
        }


        await sendEmbed(message, {description: `Successfully bought **${item.name}** for ${item.price} TrashSnacks.`});
    }
};