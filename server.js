// Create an instance of Express application
const express = require('express');
const path = require("path");
const fs = require("fs");
// Imports the Google Cloud client library
const textToSpeech = require("@google-cloud/text-to-speech");
// Creates a client
const client = new textToSpeech.TextToSpeechClient();
// Random String
const randomstring = require("randomstring");

const app = express();
const server = require('http').Server(app);

// Crate a instance of Socket.io server
const io = require("socket.io")(server);

const projectId = "fit2095project-hhad0002";

// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate').v2;

// Instantiates a client
const translate = new Translate({projectId});

// Port
const port = 8080;

app.use("/", express.static(path.join(__dirname, "dist/ChatApp")));

// Wait for connections
io.on("connection", function(socket) {
    console.log("A new connection made");

    // Wait for events
    socket.on("newMsg", function(data){
        quickStart(data);
    });
});

server.listen(port, () => {
    console.log("Listening on port " + port);
});

function getCurrentDate() {
    let d = new Date();
    return d.toLocaleString();
}

async function quickStart(data) {  
    let text = data.msg;
    let target = data.language;
    console.log(target);
  
    // Translates some text
    const [translation] = await translate.translate(text, target);
    console.log(`Text: ${text}`);
    console.log(`Translation: ${translation}`);

    // Construct the request
    const request = 
    {
        input: { text: data.msg },
        // Select the language and SSML Voice Gender (optional)
        voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
        // Select the type of audio encoding
        audioConfig: { audioEncoding: "MP3" },
    };

    // Performs the Text-to-Speech request
    client.synthesizeSpeech(request, (err, response) => {
        if (err) {
            console.error("ERROR:", err);
            return;
        }

        let filename = "output/" + randomstring.generate() + ".mp3";

        // Write the binary audio content to a local file
        fs.writeFile(filename, response.audioContent, "binary", err => {
            if (err) {
                console.error("ERROR:", err);
                return;
            }

            console.log("Audio content written to file:" + filename);

            io.sockets.emit("msg", 
            { 
                userName: data.userName, 
                msg: translation, 
                timestamp: getCurrentDate(),
                filename: filename
            });
        });
    });
}