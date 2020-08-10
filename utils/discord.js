// Module for discord notifications whenever there is a new entry

const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log(`[DISCORD] Connected as ${client.user.tag}.`);
});

client.login(process.env.DISCORD_TOKEN);
