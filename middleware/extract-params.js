module.exports = function (server) {
    server.param('roomID', function (request, response, next, roomID) {
        request.body.roomID = roomID;
        next();
    });

    server.param('building', function (request, response, next, building) {
        request.body.building = building;
        next();
    });
}