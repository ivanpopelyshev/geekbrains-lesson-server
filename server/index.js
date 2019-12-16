const http = require("http");
const express = require("express");
const cors = require("cors");
const socket = require("./sockets");

const app = express();

app.use(cors());
app.use("/api", express.json());
app.use("/", express.static(__dirname + "/../client" ));

app.get("/api", (req, res)=>{
    res.send({
        VERSION: 10
    })
});

const server = http.createServer(app);
const ss = socket(server);

server.listen(8080, "0.0.0.0", ()=>{
    console.log("Server started on:", 8080);
})