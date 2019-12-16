const WS = require("ws");

function Socket(app) {
    let ws = new WS.Server({ server: app});
    
    console.log("WS", ws);

    ws.on('connection', connection.bind(this))

    function connection(client) {
        console.log("Clinet connected", client);
    }
}

module.exports = Socket;