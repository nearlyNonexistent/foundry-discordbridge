Hooks.once("init", function () {
    game.settings.register('averagerolls', "Enabled",
        {
            name: "Enabled",
            scope: "world",
            type: Boolean,
            default: true,
            config: true
        });
    game.settings.register('averagerolls', 'resetRolls', {
        name: "Journal Entry Name",
        hint: "Reset all rolls.",
        scope: "world",
        config: false,
        default: "Average Rolls",
        type: Boolean,
        onChange: () => {
            resetRolls();
        }
    });
    game.users.entries.forEach(user => {
        userid = user.id;
        game.settings.register('averagerolls', userid, {
            name: user.name + " Rolls",
            scope: "world",
            config: false,
            default: [],
            type: Array,
            hidden: true,
        });
    })
    startUp();
});

function startUp() {
    console.log("Resetting session rolls");
    game.users.entries.forEach(user => {
        userid = user.id;
        plantFlag(userid, "sessionAverage", 0);
        plantFlag(userid, "sessionRolls", []);
        if (bringFlag(userid, "rolls") == undefined) {
            plantFlag(userid, "rolls", []);
        }
        if (bringFlag(userid, "average") == undefined) {
            plantFlag(userid, "average", []);
        }
        console.log(userid + " reset");
    })
}

function resetRolls() {
    console.log("Resetting all rolls");
    game.users.entries.forEach(user => {
        userid = user.id;
        plantFlag(userid, "sessionAverage", 0);
        plantFlag(userid, "sessionRolls", []);
        plantFlag(userid, "rolls", []);
        plantFlag(userid, "average", []);
        console.log(userid + " reset");
    })
}


function bringFlag(userid, flag) {
    get = game.users.get(userid).getFlag("averagerolls", flag)
    console.log(get);
    if (get == undefined) {
        console.log("Couldn't find flag");
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

    rolls = game.settings.get("averagerolls", user)
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

    msg = new ChatMessage();
    msg.data.user = user;
    msg.user = message.user;
    msg.data.content = "Session average for " + name + " is " + sessionAverage;
    ChatMessage.create(msg);
});