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


function getFlag(userid, flag) {
    get = game.users.get(userid).getFlag("averagerolls", flag)
    if (get == undefined) {
        return setFlag(userid, flag, [0])
    }
    return
}

function setFlag(userid, flag, value) {
    return game.users.get(userid).setFlag("averagerolls", flag, value)
}

Hooks.on("createChatMessage", (message, options, user) =>
{
    if (!game.settings.get("averagerolls", "Enabled") || !message.isRoll || !message.roll.dice[0].faces == 20) {
        return;
    }
    name = message.user.name;
    result = parseInt(message.roll.result.split(" ")[0]);
    console.log(name + " rolled a " + result);
    rolls = getFlag(user, "rolls")
    rolls.push(result);
    setFlag(user, "rolls", rolls);
    sum = rolls.reduce((a, b) => a + b, 0);
    average = sum/rolls.length;
    setFlag(user, "average", average);
    console.log("Lifetime average for " + message.user.name + " is " + average );

    sessionRolls = getFlag(user, "sessionRolls")
    sessionRolls.push(result);
    setFlag(user, "sessionRolls", sessionRolls);
    sessionSum = sessionRolls.reduce((a, b) => a + b, 0);
    sessionAverage = sessionSum/sessionRolls.length;
    setFlag(user, "sessionAverage", sessionAverage);
    console.log("Session average for " + message.user.name + " is " + sessionAverage );
});