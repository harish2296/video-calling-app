const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000

app.use(express.static(__dirname + "/public"))
let clients = 0

io.on('connection', function (socket) {
    socket.on("new-client", function () {
        if (clients < 2) {
            if (clients == 1) {
                this.emit('CreateClient')
            }
        }
        else {
            this.emit('SessionActive')
        }

        clients++;
    });

    socket.on('Request', sendAck);
    socket.on('Response', sendAnswer);
    socket.on('disconnect', disconnect);
});

function disconnect() {
    if (clients > 0) {
        if (clients <= 2) {
            this.broadcast.emit("Disconnect");
        }
        clients--;
    }
}

function sendAck(data) {
    this.broadcast.emit("Acknowledgement", data)
}

function sendAnswer(data) {
    this.broadcast.emit("StreamData", data)
}

http.listen(port, () => console.log(`Active on ${port} port`))