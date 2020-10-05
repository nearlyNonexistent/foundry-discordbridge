Hooks.once("init", function () {
    game.settings.register('averagerolls', "Enabled", {
        name: "Enabled",
        hint: "Enable this to calculate average rolls.",
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });
    game.settings.register('averagerolls', "JournalEntry", {
        name: "Create Journal Entry",
        hint: "Enable this to create a journal entry with average rolls.",
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });
});

Hooks.once("ready", function () { 
    if (game.settings.get("averagerolls", "Enabled")) {
        startUp();
    }
});

// Adding flags for rolls and average to all users
function startUp() {
    console.log("AverageRolls - Resetting session rolls");
    game.users.entries.forEach(user => {
        userid = user.id;
        plantFlag(userid, "sessionAverage", 0);
        plantFlag(userid, "sessionRolls", []);
        if (typeof bringFlag(userid, "lifetimeAverage") == "undefined") {
            plantFlag(userid, "lifetimeAverage", []);
        }
        if (typeof bringFlag(userid, "lifetimeRolls") == "undefined") {
            plantFlag(userid, "lifetimeRolls", 0);
        }
        console.log("AverageRolls - " + userid + " reset for session.");
    })
    if (game.settings.get("averagerolls", "JournalEntry")) {
        updateJournal();
    }
}
 // Resets all flags
function resetRolls() {
    console.log("AverageRolls - Resetting all rolls");
    game.users.entries.forEach(user => {
        userid = user.id;
        plantFlag(userid, "sessionAverage", 0);
        plantFlag(userid, "sessionRolls", []);
        plantFlag(userid, "lifetimeAverage", 0);
        plantFlag(userid, "lifetimeRolls", 0);
        console.log("AverageRolls - " + userid + " reset.");
    })
}

// Sets all flags used to null
function cleanUp() {
    console.log("AverageRolls - Cleaning up all users");
    game.users.entries.forEach(user => {
        userid = user.id;
        plantFlag(userid, "sessionAverage", null);
        plantFlag(userid, "sessionRolls", null);
        plantFlag(userid, "lifetimeAverage", null);
        plantFlag(userid, "lifetimeRolls", null);
        if (user.isGM) {
            plantFlag(userid, "journalId", null);
        }
        console.log("AverageRolls - " + userid + " cleaned up.");
    })
}

// Get specified flag for userid
function bringFlag(userid, flag) {
    get = game.users.get(userid).getFlag("averagerolls", flag)
    if (typeof get == "undefined") {
        console.log("AverageRolls - Couldn't find flag " + flag) + " on user " + userid;
    }
    return get;
}

// Set specified flag for userid
function plantFlag(userid, flag, value) {
    return game.users.get(userid).setFlag("averagerolls", flag, value)
}

// Output session average for all users as a chat message
function outputAverages(userid = "") {
    if (!userid == "") {
        user = game.users.get(userid);
        msg = new ChatMessage();
        msg.user = user;
        msg.data.user = userid;
        sessAverage = bringFlag(userid, "sessionAverage");
        lifeAverage = bringFlag(userid, "lifetimeAverage");
        sessionAverage = Math.round((sessAverage + Number.EPSILON) * 100) / 100;
        lifetimeAverage = Math.round((lifeAverage + Number.EPSILON) * 100) / 100;
        msg.data.content = "Session average: " + sessionAverage + "<br>Lifetime average: " + lifetimeAverage;
        ChatMessage.create(msg);
    } else {
        game.users.entries.forEach(user => {
            userid = user.id;
            msg = new ChatMessage();
            msg.user = user;
            msg.data.user = userid;
            sessAverage = bringFlag(userid, "sessionAverage");
            lifeAverage = bringFlag(userid, "lifetimeAverage");
            sessionAverage = Math.round((sessAverage + Number.EPSILON) * 100) / 100;
            lifetimeAverage = Math.round((lifeAverage + Number.EPSILON) * 100) / 100;
            msg.data.content = "Session average: " + sessionAverage + "<br>Lifetime average: " + lifetimeAverage;
            ChatMessage.create(msg);
        })
    }
}

function createJournal() {
    gm = "";
    gmFound = false;
    game.users.entries.some(function(user, index) {
        if (user.isGM) {
            gm = user;
            gmFound = true;
        }
        return gmFound;
    })
    userid = gm.id;
    entry = new JournalEntry();
    entry.user = gm;
    entry.data.user = userid;
    entry.name = "Average Rolls";
    entry.data.name = "Average Rolls";

    content = "AverageRolls";
    game.users.entries.forEach(user => {
        userid = user.id;
        sessAverage = bringFlag(userid, "sessionAverage");
        lifeAverage = bringFlag(userid, "lifetimeAverage");
        sessionAverage = Math.round((sessAverage + Number.EPSILON) * 100) / 100;
        lifetimeAverage = Math.round((lifeAverage + Number.EPSILON) * 100) / 100;
        content += "\n--------\n" + user.name + "\nSession Average: " + sessionAverage + "\nLifetime Average: " + lifetimeAverage;
        if (user.isGM) {
            plantFlag(userid, "journalId", entry.id);
        }
    })
    
    entry.data.content = content;
    return JournalEntry.create(entry);
}

function updateJournal() {
    entry = null;
    
    content = "<p>AverageRolls</p>";
    
    game.users.entries.forEach(user => {
        userid = user.id;
        sessAverage = bringFlag(userid, "sessionAverage");
        lifeAverage = bringFlag(userid, "lifetimeAverage");
        sessionAverage = Math.round((sessAverage + Number.EPSILON) * 100) / 100;
        lifetimeAverage = Math.round((lifeAverage + Number.EPSILON) * 100) / 100;
        content += "<p>--------</p><p>" + user.name + "<br>Session Average: " + sessionAverage + "<br>Lifetime Average: " + lifetimeAverage + "</p>";
        if (user.isGM) {
            entry = getJournal(bringFlag(user.id, "journalId"));
        }
    })

    if (typeof entry == "undefined" || entry == null) {
        return createJournal();
    }

    entry.data.content = content;
    return entry.update(entry.data);
}

function findJournal() {
    gmFound = false;
    journalEntry = null;
    game.journal.entries.forEach(entry => {
        if (entry.name == "Average Rolls") {
            journalEntry = entry;
            game.users.entries.some(function(user, index) {
                if (user.isGM) {
                    plantFlag(user.id, "journalId", entry.id);
                    gmFound = true;
                }
                return gmFound;
            })
        }
    })
    if (journalEntry == null) {
        console.log("AverageRolls - Couldn't find journal entry. Creating one.");
    }
    return journalEntry;
}

function getJournal(journalId) {
    entry = game.journal.get(journalId);
    if (typeof entry == "undefined" || entry == null) {
        console.log("AverageRolls - Journal not found, looking through all journals.")
        return findJournal();
    }
    return entry;
}

class timeOut {
    constructor(fn, interval) {
        var id = setTimeout(fn, interval);
        this.cleared = false;
        this.clear = function () {
            this.cleared = true;
            clearTimeout(id);
        };
    }
}


// Hooks the chat message and if it's a D20 roll adds it to the roll flag and calculates averages for user that sent it.
Hooks.on("createChatMessage", (message, options, user) => 
{
    if (!game.settings.get("averagerolls", "Enabled") || !message.isRoll || !message.roll.dice[0].faces == 20) {
        return;
    }
    name = message.user.name;
    result = parseInt(message.roll.result.split(" ")[0]);

    sessionRolls = bringFlag(user, "sessionRolls");
    sessionRolls.push(result);
    plantFlag(user, "sessionRolls", sessionRolls);
    sessionSum = sessionRolls.reduce((a, b) => a + b, 0);
    sessionAverage = sessionSum/sessionRolls.length;
    plantFlag(user, "sessionAverage", sessionAverage);
    console.log("AverageRolls - Session average for " + message.user.name + " is " + sessionAverage );

    
    lifetimeRolls = bringFlag(user, "lifetimeRolls");
    lifetimeAverage = bringFlag(user, "lifetimeAverage");
    newRolls = parseInt(lifetimeRolls) + 1;
    newAverage = ((lifetimeAverage * lifetimeRolls) + result) / (newRolls);
    plantFlag(user, "lifetimeRolls", newRolls);
    plantFlag(user, "lifetimeAverage", newAverage);
    console.log("AverageRolls - Lifetime average for " + message.user.name + " is " + newAverage );
    
    if (game.settings.get("averagerolls", "JournalEntry")) {
        if (typeof timer == "undefined" || timer.cleared) {
            timer = new timeOut(function () {
                console.log("AverageRolls - Updating Average Rolls Journal Entry.")
                //updateJournal();
                timer.clear();
            }, 5000);
        }
    }
});