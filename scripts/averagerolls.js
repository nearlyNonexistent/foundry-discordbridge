Hooks.once("init", function () {
    game.settings.register('averagerolls', "Enabled",
        {
            name: "Enabled",
            scope: "world",
            type: Boolean,
            default: true,
            config: true
        });

    game.settings.register('averagerolls', 'journalName', {
        name: "Journal Entry Name",
        hint: "The name of the journal entry containing averages.",
        scope: "world",
        config: true,
        default: "Average Rolls",
        type: String
    });
});


function getFlag(userid, flag) {
    get = game.users.entries[userid].getFlag("averagerolls", flag)
    if (get == undefined) {
        return setFlag(userid, flag, [0])
    }
    return
}

function setFlag(userid, flag, value) {
    return game.users.entries[userid].setFlag("averagerolls", flag, value)
}

/*Load all users in the game for average rolls during session */
function loadUsers() {
    userRolls = {};
    console.log("Loading users");
    game.users.entities.forEach(user => {
        userRolls[user.name] = [];
    });
    return userRolls;
}

Hooks.on("createChatMessage", (message, options, user) =>
{
    if (!game.settings.get("averagerolls", "Enabled") || !message.isRoll || !message.roll.dice[0].faces == 20) {
        return;
    }
    name = message.user.name;
    result = parseInt(message.roll.result.split(" ")[0]);
    console.log(name + " rolled a " + result);
    rolls = getFlag(user.id, "rolls")
    rolls.push(result);
    setFlag(user.id, "rolls", rolls);
    sum = rolls.reduce((a, b) => a + b, 0);
    average = sum/rolls.length;
    setFlag(user.id, "average", average);
    
});

/*Hooks.on("createChatMessage", (message, options, user) =>
{
    console.log("running chatmessagecreate event for discordbridge");
    if (!game.settings.get("averagerolls", "Enabled") || !game.user.isGM || message.data.whisper.length > 0)
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
        "avatar_url": game.settings.get("averagerolls", "baseURL") + img,
        "content":message.data.content}
    console.log(data)
    fetch(game.settings.get("averagerolls", "REST Endpoint URL") + "/message",
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        })
});*/