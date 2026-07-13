const createServer = require("./server/server");

const server = createServer();

server.listen(8000, () => {
    console.log("Custom Redis Server running on port 8000");
});
