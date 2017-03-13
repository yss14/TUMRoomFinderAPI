const roomController = require('./controllers/room-controller');
const buildingController = require('./controllers/building-controller');

module.exports = function (server) {
    server.get('/room/:roomID', roomController.getRoomStatus);
}