module.exports = {
    getFreeRooms: getFreeRooms,
}

const DateFormatted = require('../res/date_formatted');
const BuildingMap = require('../res/building_map');
const jsdom = require("jsdom");
const fs = require("fs");
var jquery = fs.readFileSync("./res/jquery.js", "utf-8");
const REST = require('../res/RESTHandler.js');
const QueryString = require('querystring');
const url = require('url');

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

            } else {
                reject("Building not listed...");
            }
        }
    });
}

function getAllRoomsForBuilding(pBuilding) {
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
                getEntriesForToday("", now.toGermanDate(), postData).then((roomsWithEntries) => {
                    resolve(roomsWithEntries);
                }, (error) => {
                    reject(error);
                });
            });
        });

        all = Promise.all(actions);

        all.then((collectedData) => {
            console.dir(collectedData);
            resolve();
        }, (error) => {
            console.error(error);
            reject("Can't fetch rooms for building...");
        });
    });
}

function getEntriesForToday(roomString, dateString, filter) {
    return new Promise((resolve, reject) => {
        getRoomIDs(roomString, filter).then((roomIDs) => {
            var actions = roomIDs.map((roomID) => {
                return new Promise((resolve, reject) => {
                    let url = `https://campus.tum.de/tumonline/wbKalender.wbRessource?pResNr=${escape(roomID)}&pDisplayMode=t&pDatum=${escape(dateString)}`;
                    //console.log(url);
                    jsdom.env({
                        url: url,
                        src: [jquery],
                        done: function (err, window) {
                            var $ = window.$;

                            let events = $('div.cocal-ev-container');
                            let data = [];

                            for (let i = 0; i < events.length; i++) {
                                let time = $($($(events[i]).find('span.cocal-ev-time'))[0]).text();
                                let desc = $($($(events[i]).find('span.cocal-ev-title'))[0]).text();

                                let splittedTime = time.split('-');
                                let startSplitted = splittedTime[0].split(':');
                                let endSplitted = splittedTime[1].split(':');

                                let startDate = new Date();
                                startDate.setHours(parseInt(startSplitted[0]));
                                startDate.setMinutes(parseInt(startSplitted[1]));

                                let endDate = new Date();
                                endDate.setHours(parseInt(endSplitted[0]));
                                endDate.setMinutes(parseInt(endSplitted[1]));

                                data.push({
                                    time: {
                                        text: time.trim(),
                                        start: startDate.getTime(),
                                        end: endDate.getTime(),
                                    },
                                    desc: desc.trim(),
                                });
                            }

                            let roomName = $('h2.m.normalWeight.headerObject.noMargin').text().trim();

                            resolve({ data: data, name: roomName });
                        }
                    });
                });
            });

            Promise.all(actions).then((roomData) => {
                var finalData = [];

                roomData.forEach((room) => {
                    finalData.push({
                        times: room.data,
                        name: room.name,
                    });
                });
                resolve(finalData);
            }, (error) => {
                reject(error);
            });
        }, (error) => {
            reject(error);
        });
    });
}

function getRoomIDs(query, postData) {
    return new Promise((resolve, reject) => {
        performSearch(query, postData).then((roomIDs) => {
            resolve(roomIDs);
        }, (error) => {
            reject(error);
        });
    });
}

function performSearch(query, postData) {
    return new Promise((resolve, reject) => {
        REST.POST('campus.tum.de', '/tumonline/wbSuche.raumSuche', postData).then((data) => {
            jsdom.env({
                html: data,
                src: [jquery],
                done: function (err, window) {
                    if (err) {
                        reject(err);
                    } else {
                        var roomIDs = [];
                        var $ = window.$;
                        var links = $('td.C a');

                        for (let i = 0; i < links.length; i++) {
                            var queryData = url.parse($(links[i]).attr('href'), true).query;
                            roomIDs.push(parseInt(queryData.cRes));
                        }

                        resolve(roomIDs);
                    }
                }
            });
        }, (error) => {
            reject(error);
        });
    });
}

function filterFreeRooms(roomList) {

}

