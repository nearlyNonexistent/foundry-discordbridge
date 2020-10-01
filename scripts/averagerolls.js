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
    startUp();
});

function startUp() {
    console.log("Resetting session rolls");
    game.users.entries.forEach(user => {
        userid = user.id;
        console.log(userid + " reset");
        setFlag(userid, "sessionAverage", 0);
        setFlag(userid, "sessionRolls", []);
    })
}


function bringFlag(userid, flag) {
    get = game.users.get(userid).getFlag("averagerolls", flag)
    console.log(get);
    if (false) { //get == undefined
        plantFlag(userid, flag, [0]);
        return bringFlag(userid, flag).getFlag(userid, flag);
    }
    return get;
}

function plantFlag(userid, flag, value) {
    return game.users.get(userid).setFlag("averagerolls", flag, value)
}

Hooks.on("createChatMessage", (message, options, user) => //|| !message.isRoll || !message.roll.dice[0].faces == 20
{
    if (!game.settings.get("averagerolls", "Enabled")) {
        return;
    }
    console.log(message);
    name = message.user.name;
    result = parseInt(message.roll.result.split(" ")[0]);
    console.log(name + " rolled a " + result);
    rolls = bringFlag(user, "rolls")
    rolls.push(result);
    plantFlag(user, "rolls", rolls);
    sum = rolls.reduce((a, b) => a + b, 0);
    average = sum/rolls.length;
    plantFlag(user, "average", average);
    console.log("Lifetime average for " + message.user.name + " is " + average );

    sessionRolls = bringFlag(user, "sessionRolls")
    sessionRolls.push(result);
    plantFlag(user, "sessionRolls", sessionRolls);
    sessionSum = sessionRolls.reduce((a, b) => a + b, 0);
    sessionAverage = sessionSum/sessionRolls.length;
    plantFlag(user, "sessionAverage", sessionAverage);
    console.log("Session average for " + message.user.name + " is " + sessionAverage );

    message = new ChatMessage();
    message.user = user;
    message.data.content = "Session average for " + message.user.name + " is " + sessionAverage;
    ChatMessage.create(message);
});