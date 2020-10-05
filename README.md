# Average Rolls
A module for Foundry VTT.

This is a simple module to get session and lifetime average D20 rolls per user per session. 

## How to:
 - Install, activate and make sure it is enabled in settings, if it isn't enabled restart Foundry after enabling. You can use https://raw.githubusercontent.com/BeardedJotunn/FoundryVTT-AverageRolls/master/module.json for manual install.
 - If enabled a Journal Entry called "Average Rolls" will be created where you can see everyone's averages.
 - Make a macro with the following script if you want to send a message to chat with everybody's average: outputAverages();

## Future Plans:
 - ~~Add lifetime averages.~~ Added, waiting to see how it works long term.
 - Better way to display averages.
 - Perhaps some Discord connection. 

Was originally going to be a Discord Bot module which is why I forked DiscordBridge by nearlyNonexistent. However I ended up quickly diverging from that but maybe it will return one day.