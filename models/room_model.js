module.exports = {
    getRoomStatus: getRoomStatus,
}

const GeneralModelController = require('./general_model_controller');
const QueryString = require('querystring');

function getRoomStatus(room) {
    return new Promise((resolve, reject) => {
        getRoomInfoToday(room).then((roomInfos) => {
            resolve(filterFreeRooms(roomInfos));
        }, (error) => {
            reject(error);
        });
    });
}

function getRoomInfoToday(query) {
    const postData = QueryString.stringify({
        pStart: 1,
        pSuchbegriff: query,
        pGebaeudebereich: 0,
        pGebaeude: 0,
        pVerwendung: 0,
        pVerwalter: 1,
    });

    return new Promise((resolve, reject) => {
        var now = new Date();
        GeneralModelController.getEntriesForToday(query, now.toGermanDate(), postData).then((roomsWithEntries) => {
            resolve(roomsWithEntries);
        }, (error) => {
            reject(error);
        });
    });
}

function filterFreeRooms(roomList) {
    var now = new Date();
    roomList.forEach((room, idx) => {
        var blocked = false;
        for (let i = 0; i < room.times.length; i++) {
            if (now.getTime() >= room.times[i].time.start && now.getTime() <= room.times[i].time.end) {
                blocked = true;
                break;
            }
        }

        room.free = !blocked;
    });

    return roomList;
}