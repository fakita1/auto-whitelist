# auto-whitelist

#### Description:

CS50x Final Project: Trash Panda Gaming ARK auto-whitelist Discord bot for Patrons with a membership.

This project was made for Trash Panda Gaming and consists on a credits system that allows users to get access (
whitelist) to exclusive gameservers from a game called ARK: Survival Evolved.

***There are two types of credits***: Shiny's (each of them represents a day in the whitelist of a single server) and
Bundle Credits (each of them represents 30 days of whitelist in all servers).

This bot has several commands that allows server administrator to manage their users credits.

Once the user redeems a perk, the bot will send an RCON command to the selected server adding them to the Whitelist and
allowing them to join.

***Usage example***:

- Admin executes the ***addpatron*** command and gives the user enough credits to redeem a perk.
- Optionally, the user can use the ***buy*** command to get credits by their own.
- The user can check their balance with the ***balance*** command.
- To redeem a perk and gain access to a Whitelist only server, the user has to execute the ***perk*** command.
- Once that command is executed, the user will be able to join the selected server(s) for the selected time.

***How is this bot useful***:
Trash Panda Gaming increases their chances of getting more donations that help maintain their servers when automating
processes. Having a bot that their players can understand and easily use gives allows them to focus in what matters,
their servers quality, instead of spending time in customer service.

***Project structure***:

- The index.js file is the core of the project. The Discord bot is initilized in this file and commands are dinamically
  added with the 'fs' module.
- There is a folder called command, all of them are stored in separate files in there. Here is a list of commands and
  what they do:
  AddPatron: admin command, adds credits for Patron tier specified in config. Balance: embed with current credit amount
  and remaining time in active whitelists. Buy: allows users to trade ARK points for credits. Perk: main command, adds
  player to whitelist in exchange of credits. Remove: admin command, removes all credits and active whitelists of a
  player.
- There is some extra source code and helper functions in the src folder. This includes:
  addWhitelists.js: run at an specified interval, it will add whitelist to pending purchases. rcon.js: function to send
  RCON commands and return the response. removeWhitelists.js: run at an specified interval, it will remove whitelist to
  expired purchases. util.js: util functions such as getting points, removing them, getting credit amount, etc.

#### Configuration:

Make a copy of ***config-sample.json*** and rename it to ***config.json***.

- You can get a bot token from [Discord Developers Page](https://discord.com/developers/applications).

Install dependencies using ***npm install***.
