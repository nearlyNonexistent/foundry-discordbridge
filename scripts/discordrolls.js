Hooks.once("init", function () {
    game.settings.register('foundry-discordbridge', "Enabled",
        {
            name: "Enabled",
            scope: "world",
            type: Boolean,
            default: false,
            config: true
        });
    game.settings.register('foundry-discordbridge', "REST Endpoint URL",
        {
            name: "Rest Endpoint URL",
            scope: "world",
            type: String,
            default: "http://192.168.0.188:8080",
            config: true
        });
    game.settings.register('foundry-discordbridge', 'tokenImage', {
        name: "Use Token Image",
        hint: "Use the actor's Token image instead of the actor's standard image.",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register('foundry-discordbridge', 'forceNameSearch', {
        name: "Force Name Search",
        hint: "If there is no Actor matching with chat message data, search for an actor of which name corresponds to the message speaker's alias. This option is needed for the compatibility with Theatre Insert module.",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register('foundry-discordbridge', 'baseURL', {
        name: "base URL",
        hint: "http://your-foundry-url-or-public-ip.tld/",
        scope: "world",
        config: true,
        default: "http://",
        type: String
    });
    loadUsers();
});

userRolls = {};
userPics = {};
usersLoaded = false;

/*Load all users in the game for average rolls during session */
function loadUsers() {
    console.log("Loading users");
    game.users.entities.forEach(user => {
        userRolls[user.name] = [];
        userPics[user.name] = user.img;
    });
}

/**
 * Load the appropriate actor for a given message, leveraging token or actor or actor search.
 * @param {*} speaker
 */
function loadActorForChatMessage(speaker) {
    var actor;
    if (speaker.token) {
        actor = game.actors.tokens[speaker.token];
    }
    if (!actor) {
        actor = game.actors.get((speaker.actor));
    }
    const forceNameSearch = game.settings.get('foundry-discordbridge', 'forceNameSearch');
    if (!actor && forceNameSearch) {
        game.actors.forEach((value) => {
            if (value.name === speaker.alias) {
                actor = value;
            }
        });
    }
    return actor;
}

function generatePortraitImageElement(actor) {
    let img = "";
    if (game.settings.get('foundry-discordbridge', 'tokenImage')) {
        img = actor.token ? actor.token.data.img : actor.data.token.img;
    }
    else {
        img = actor.img;
    }
    return img;
}

function outputAverages() {

}

Hooks.on("createChatMessage", (message, options, user) =>
{
    if (!usersLoaded) {
        console.log("Users not loaded, retrying");
        loadUsers();
    }
    if (message.isRoll && message.roll.dice[0].faces == 20) {
        result = parseInt(message.roll.result.split(" ")[0]);
        console.log(result);
        console.log(message.user.name)
        console.log(userRolls)
        console.log(userRolls[message.user.name])
        if (userRolls[message.user.name] != undefined) {
            userRolls[message.user.name].push(result);
            sum = userRolls[message.user.name].reduce((a, b) => a + b, 0);
            average = sum/userRolls[message.user.name].length;
            console.log("Average for " + message.user.name + ": " + average);
        }
    }
});

/*Hooks.on("createChatMessage", (message, options, user) =>
{
    console.log("running chatmessagecreate event for discordbridge");
    if (!game.settings.get("foundry-discordbridge", "Enabled") || !game.user.isGM || message.data.whisper.length > 0)
    {
        return;
    }
    if (message.data.type == 5 || message.data.type == 0 || message.data.type == 4)
    {
        return;
    }
    let speaker = message.data.speaker
    var actor = loadActorForChatMessage(speaker);
    let img = "";
    if (actor) {
        img = generatePortraitImageElement(actor)
    }
    else {
        img = message.user.avatar;
    }
    var data = {
        "campaign": game.world.title,
        "user": message.alias,
        "avatar_url": game.settings.get("foundry-discordbridge", "baseURL") + img,
        "content":message.data.content}
    console.log(data)
    fetch(game.settings.get("foundry-discordbridge", "REST Endpoint URL") + "/message",
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        })
});*/