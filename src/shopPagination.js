const {MessageEmbed} = require('discord.js');
const config = require('../config.json');
const {sendEmbed} = require('./util');

/*
             let desc = `This is our current shop list! Please follow the following syntax and redeem using TP!perk :\n\nItem | (Cost) : Command\n`;
            config.shop.forEach(item => {
                desc += `**${item.name}** | **(${item.price} TrashSnacks)**: \`${config.botPrefix}buy ${item.id}\`\n\n`;
            });
            msg = await sendEmbed(message, {description: desc});
* */
const backEmoji = '⬅️';
const nextEmoji = '➡️';

function shopPage(msg, message, page) {

    return new Promise(async (resolve) => {

        let emojis = [];

        let pageConfig = config.shopPages[page];
        let options = {title: pageConfig.title, description: pageConfig.description + '\n\n\n'};
        if (pageConfig.image) options.imageBig = pageConfig.image;


        if (page !== 0) {
            emojis.push(backEmoji);
            options.description += `React with ${backEmoji} to go back.`;
        }
        if (page + 1 !== config.shopPages.length) {
            emojis.push(nextEmoji);
            options.description += `React with ${nextEmoji} to go forward.`;
        }


        msg = await sendEmbed(message, options, msg);
        let reaction = await awaitR(msg, message, emojis);
        if (reaction === backEmoji) await shopPage(msg, message, page - 1);
        else if (reaction === nextEmoji) await shopPage(msg, message, page + 1);
        resolve(true);
    });

}

module.exports = {shopPage};


function awaitR(msg, message, emojis) {

    return new Promise(async (resolve) => {

        let reaction;

        const filter = (reaction, user) => {
            return (emojis.includes(reaction.emoji.name) || emojis.find(x => x.includes(reaction.emoji.id))) && user.id === message.author.id;
        };


        msg.awaitReactions(filter, {max: 1, time: 300000, errors: ['time']})
            .then(async collected => {

                reaction = collected.first().emoji.id ? `<:${collected.first().emoji.name}:${collected.first().emoji.id}>` : collected.first().emoji.name; // If it is not a guild emoji it will not have an ID.
                await msg.reactions.removeAll();
                resolve(reaction);


            }).catch(err => {
            resolve(null);
            return handleError(err, msg, message);
        });


        for (let i = 0; i < emojis.length; i++) {
            if (!reaction) {
                let emoji = emojis[i];

                try { // For each emoji react if it was not reacted.
                    if (emoji.includes('<')) await msg.react(emoji.split(':')[2].split('>')[0]);
                    else await msg.react(emoji);

                } catch (err) {
                    resolve(null);
                    return handleError(err, msg, message);
                }

            }
        }

    });


}


async function handleError(err, msg, message) {

    await sendEmbed(message, {
        title: 'Reaction timeout',
        description: `I can't wait you forever, can I? 5 minutes have passed since your last reaction.`
    }, msg);
    await msg.reactions.removeAll();

}

