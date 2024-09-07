const WebSocket = require("ws");
const winston = require("winston");

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

let chatRooms = {};

module.exports = (wss) => {
  wss.on("connection", (ws, req) => {
    console.log("WebSocket connection handler triggered");
    const params = new URLSearchParams(req.url.split("?")[1]);
    const id = params.get("id");
    const username = params.get("username");
    console.log(
      `Connection established in room ${id} with username: ${username}`
    );

    if (!chatRooms[id]) {
      chatRooms[id] = [];
    }

    chatRooms[id].push(ws);
    logger.info(`New connection in room: ${id} with username: ${username}`);

    ws.on("message", (message) => {
      const data = JSON.parse(message);
      console.log(
        `Received message from ${data.sender} in room ${id}: ${data.text}`
      );

      // Send message to client except the sender
      chatRooms[id].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    });

    ws.on("close", () => {
      chatRooms[id] = chatRooms[id].filter((client) => client !== ws);
      logger.info(`Connection closed in room: ${id}`);
      if (chatRooms[id].length === 0) {
        delete chatRooms[id];
      }
    });

    ws.on("error", (error) => {
      logger.error(`WebSocket error in room ${id}: ${error}`);
    });
  });
};
