# Foundry ==> Discord Bridge
This module will, when set up correctly, automatically post messages from Foundry into Discord, with character portaits and names. It even has a way to search by author, despite webhooks typically disabling this functionality.

The Foundry Discordbot is to be used with the Foundry Discordbridge module, and must be configured before setting up.
## Required Setup
 - Add the module to FoundryVTT.
 - Prepare the bot in the bot folder.
 - Install the required modules from requirements.txt
 - Create a config.json based on exampleConfig.json
 - Ensure that the port and IP selected can be viewed by the FoundryVTT server.
 - Configure the bot's token.
- Invite it to the guild you want it to use.
- Configure the module settings to tell Foundry where the bot is located.
- Create a campaign in the channel (see usage).
## Usage
Quotes are mandatory on arguments that are wrapped in them in these examples. Only the owner can configure Campaigns and delete messages. /me and non-whispered chat will be bridged automatically.
- Use the command `>_rpb campaign add "Title of your World in FoundryVTT"` in the channel you want messages bridged to.
- Use the command `>_rpb campaign move "Title"` to move a world's chat bridge.
- Messages will be automatically bridged when the module is Enabled in its settings, to avoid GM preparation leaking.
- To search messages by author use `>_rpb "campaign" "author" search terms` .
- To delete messages use `>_rpb message_id` to remove it from the search results as well.
- To delete campaigns use `>_rpb campaign delete "Title"` to disable the bridge and wipe the search log.
### Best Practices
- Don't use too much HTML in your chat, the translator to markdown is not perfect.
- Set player avatars to set avatars for the Discord bridge to use for OOC.
- Force Name Search should be on if Theatre Inserts is being used.
- Edit the CORS policy in the bot's code to increase security.
- Use a virtual environment to prepare the bot.
- If you're editing a cog, you can use the reload command to update it without having to restart the bot.

### Possible Future Plans
 - Method to run this without a bot? It would be possible, but I'm not sure how to yet.
 - Extensions to make the bot more useful; possibly "reversing" the direction and letting certain aspects be controlled from Discord.