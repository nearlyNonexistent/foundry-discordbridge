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

function loadJournalEntry(name = "") {
    journalName = name == "" ? game.settings.get('averagerolls', 'journalName') : name;
    game.journal.entries.forEach(entry => {
        if (entry.name == journalName) {
            return entry;
        } else {
            entry = new JournalEntry();
            entry.name = journalName;
            console.log(game.journal.insert(entry));
            return loadJournalEntry(journalName);
        }
    });
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

function outputAverages(entry, userRolls) {
    userAverages = userRolls;
    users = Object.keys(userRolls);
    for (const user of users) {
        average = 0;
        sum = userRolls[user].reduce((a, b) => a + b, 0);
        average = sum/userRolls[user].length;
        userRolls[user] = average;
        console.log("Average for " + user + ": " + average);
    }
    data = entry.data;
    data.content = userRolls.toString();
    entry.update(data);
}

Hooks.on("createChatMessage", (message, options, user) =>
{
    if (!game.settings.get("averagerolls", "Enabled") || !message.isRoll || !message.roll.dice[0].faces == 20) {
        return;
    }
    name = message.user.name;
    result = parseInt(message.roll.result.split(" ")[0]);
    console.log(name + " rolled a " + result);

    userRolls = loadUsers();
    users = Object.keys(userRolls);
    for (const key of users) {
        entry = loadJournalEntry(key);
        userRolls[key] = entry.data.content.split(';');
        if (key == name) {
            userRolls[key].push(result);
            data = entry.data;
            data.content = userRolls[key].join(';');
            entry.update(data);
        }
    }

    averageEntry = loadJournalEntry();
    outputAverages(averageEntry, userRolls);
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