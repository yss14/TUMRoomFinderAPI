module.exports = function (server) {
    server.param('roomID', function (request, response, next, roomID) {
        request.body.roomID = roomID;
        next();
    });
}