
const authtoken = "NDYyODAyMzA2MDE1MTY2NDg0.DqGYAg.4TxjyHfOYxOWhwuvJ9DQqYOsXLU";
const discordapi = 'https://discordapp.com/api/'
const cp = ";"



var identitydata = {
    "op": 2,
    "d": {
        "token": authtoken,
        "properties": {
            "$os": "windows",
            "$browser": "python",
            "$device": "python"
        },
        "compress": false,
        "large_threshold": 50,
        "presence": {   
            "game": {
                "name": "God in his heaven.",
                "type": 3
            },
            "status": "online",
            "since": 300,
            "afk": false
        }
    }
}



var framee = 0;
var beating = [];
var framei = 0;
beating[0] = false;
beating[1] = 1000;
beating[2] = null;
beating[3] = true;
var sessionId = null;
var socket;

function blobToFile(theBlob, fileName) {
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}


function sendMessage(channel, message) {
    this.chat_url = discordapi + 'channels/' + channel + '/messages'
    this.xhr = new XMLHttpRequest();
    this.xhr.open("POST", this.chat_url);
    this.xhr.setRequestHeader("Authorization", "Bot " + authtoken)
    this.xhr.setRequestHeader("Content-type", "application/json");
    this.xhr.send(JSON.stringify(message));
}



function sendFile(channel, message, blob) {
    this.chat_url = discordapi + 'channels/' + channel + '/messages'
    this.data = new FormData();
    this.data.append("file1.jpg", blob)
    this.data.append("payload_json", JSON.stringify({ "embeds": [{ "title": "test" }] }))
    //this.data.append("content", "Wow")
    this.xhr = new XMLHttpRequest();
    this.xhr.open("POST", this.chat_url);
    this.xhr.setRequestHeader("Authorization", "Bot " + authtoken)
    //this.xhr.setRequestHeader("Content-type", "multipart/form-data");
    this.xhr.send(this.data);
};



function diceRoll(message, channel, user) {
    this.dices = Number(message.toLowerCase().substring(6, message.length));
    var total = [];
    var value = 0;
    if (this.dices > 200) {
        sendMessage(channel, { "content": "Maximum dices is 200." });
        return true;
    }
    for (var i = 0; i < this.dices; i++) {
        var e = int(random(3))

        switch (e) {
            case 0:
                total.push("  +1  ")
                value += 1;
                break;
            case 1:
                total.push("  -1  ")
                value -= 1;
                break;
            case 2:
                total.push("  0  ")
                break;
        }
    }

    this.message = { "content": "<@" + user + ">" + " rolled;       " + total + "      The Final value was : " + value }
    sendMessage(channel, this.message);
}


function textFile(message, channel, user) {
    sendMessage(channel, { "content": "Processing your file.. will be uploaded soon." })
    var blob = new Blob([message], { type: 'text/plain' })
    var file = new File([blob], "requested.txt");
    sendFile(channel, message, file);
 };



function check_commands(message, channel, user, mentions) {
    if (message[0] == ";") {
        var isACommand = false;
        switch (message.toLowerCase().substring(1, 6)) {
            case "roll ":
                diceRoll(message, channel, user)
                isACommand = true;
                break;
            case "text ":
                textFile(message, channel, user)
                isACommand = true;
                break;
            case "chess ":
                spamthem(message, channel, user, mentions)
                isACommand = true;
                break;
        }
        if (!isACommand) {
            sendMessage(channel, { "content": "<@" + user + ">" + " Haven't added that yet. Please give suggestions by pinging bake"});
        }
    }
}

function onMessage(data) {
    this.pdata = JSON.parse(data)
    this.s = this.pdata.s
    this.op = this.pdata.op

    if (this.s) {
        beating[2] = this.s
    }
    
    switch (this.op) {
        case 10:
            beating[1] = this.pdata.d.heartbeat_interval;
            beating[0] = true;
            if (sessionId) {
                print("Reconnecting...")
                var resumingdata = {
                    "op": 6,
                    "d": {
                        "token": authtoken,
                        "session_id": sessionId,
                        "seq": beating[2]
                    }
                }
                socket.send(JSON.stringify(resumingdata))
            }
            break;
        case 11:
            beating[3] = true;
            break;
        case 0:
            switch (this.pdata.t) {
                case "READY":
                    sessionId = this.pdata.d.session_id
                    print("hello new session")
                    break;
                case "MESSAGE_CREATE":
                    check_commands(this.pdata.d.content, this.pdata.d.channel_id, this.pdata.d.author.id, this.pdata.d.mentions)
            }
            break;
        case 9:
            sessionId = null;
            socket.close();
            break;
    };

};


function make_socket() {
    this.socket = new WebSocket('wss://gateway.discord.gg');

    this.socket.addEventListener('open', function (event) {
        if (!sessionId) {
            socket.send(JSON.stringify(identitydata))
        } 
    });


    this.socket.addEventListener('message', function (event) {
        onMessage(event.data);
        //print(event.data)
    });

    this.socket.addEventListener('close', function (event) {
        socket.close();
        socket = make_socket()
    });

    return this.socket;
}




function setup() {
    socket = make_socket();
};



function draw() {
    frameRate(60);
    framei += 1000 / 60;
    framee++;

    if (framei >= beating[1]/100) {
        print("heatbeat sent.")
        if (beating[0]) {
            framei = 0;
            framee = 0;

            var hearbeatdata = {
                "op": 1,
                "d" : beating[2]
            }
            beating[3] = false;
            print(beating[2])
            socket.send(JSON.stringify(hearbeatdata))
        }
    }
};



