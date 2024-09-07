const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const winston = require("winston");
const codeRoutes = require("./routes/code");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

app.use(cors());
app.use(express.json());
app.use("/api", codeRoutes);

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

// Handle WebSocket server upgrade
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

require("./routes/chat")(wss);

server.listen(3000, () => {
  logger.info("Server is listening on port 3000");
  console.log("Server is listening on port 3000");
});

module.exports = { wss };
