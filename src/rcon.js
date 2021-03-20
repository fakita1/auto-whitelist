function sendRcon(server, commands) {
    return new Promise(async (resolve, reject) => {

        try {
            const SourceRCONClient = require('source-rcon-client').default,
                sourcercon = new SourceRCONClient(server.ip, server.rconPort, server.adminPassword);

            await sourcercon.connect();

            let responses = [];
            for (let command of commands) { // Send all commands.
                responses.push(await sourcercon.send(command));
            }
            resolve(responses);

            sourcercon.disconnect();

        } catch (err) {
            console.log(err);
            resolve(false);
        }

    })
}


module.exports = {sendRcon};