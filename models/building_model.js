module.exports = {
    getFreeRooms: getFreeRooms,
}

const DateFormatted = require('../res/date_formatted');
const BuildingMap = require('../res/building_map');
const QueryString = require('querystring');
const GeneralModelController = require('./general_model_controller');

let buildingDB = {};

function getFreeRooms(building) {
    return new Promise((resolve, reject) => {
        //Is there already an entry for today?
        var found = false;
        if (buildingDB.hasOwnProperty(building)) {
            var today = new Date();
            if (buildingDB[building].hasOwnProperty(DateFormatted.getToday())) {
                found = true;
                resolve(filterFreeRooms(buildingDB[building][DateFormatted.getToday()]));
            }
        }

        if (!found) {
            //Is there an entry for the building in the building map?
            if (BuildingMap.hasOwnProperty(building)) {
                getAllRoomsForBuilding(BuildingMap[building]).then((data) => {
                    if (!buildingDB.hasOwnProperty(building)) {
                        buildingDB[building] = {};
                    }

                    buildingDB[building][DateFormatted.getToday()] = data;

                    resolve(filterFreeRooms(data));
                }, (error) => {
                    console.error(error);
                    reject(error);
                });
            } else {
                reject("Building not listed...");
            }
        }
    });
}

function getAllRoomsForBuilding(pBuildingArea) {
    return new Promise((resolve, reject) => {
        var all = null;
        var todayGermany = new Date().toGermanDate();

        const postDataSeminar = QueryString.stringify({
            pStart: 1,
            pSuchbegriff: "",
            pGebaeudebereich: pBuildingArea,
            pGebaeude: 0,
            pVerwendung: 41,
            pVerwalter: 1,
        });
        const postDataUebung = QueryString.stringify({
            pStart: 1,
            pSuchbegriff: "",
            pGebaeudebereich: pBuildingArea,
            pGebaeude: 0,
            pVerwendung: 131,
            pVerwalter: 1,
        });
        const postDataArbeitsbereich = QueryString.stringify({
            pStart: 1,
            pSuchbegriff: "",
            pGebaeudebereich: pBuildingArea,
            pGebaeude: 0,
            pVerwendung: 208,
            pVerwalter: 1,
        });

        var actions = [postDataSeminar, postDataUebung, postDataArbeitsbereich].map(function (postData) {
            return new Promise((resolve, reject) => {
                var now = new Date();
                GeneralModelController.getEntriesForToday("", now.toGermanDate(), postData).then((roomsWithEntries) => {
                    resolve(roomsWithEntries);
                }, (error) => {
                    reject(error);
                });
            });
        });

        all = Promise.all(actions);

        all.then((collectedData) => {
            var finalData = collectedData[0];

            for (var i = 1; i < collectedData.length; i++) {
                finalData.concat(collectedData[i]);
            }

            resolve(finalData);
        }, (error) => {
            console.error(error);
            reject("Can't fetch rooms for building...");
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

    var freeRooms = [];

    for (var i = 0; i < roomList.length; i++) {
        if (roomList[i].free) {
            freeRooms.push(roomList[i]);
        }
    }

    return freeRooms;
}

