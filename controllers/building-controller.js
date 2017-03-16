module.exports = {
    getFreeRooms: getFreeRooms
}

const BuildingModel = require('../models/building_model');

function getFreeRooms(req, res) {
    if (req.body.hasOwnProperty("building")) {
        BuildingModel.getFreeRooms(req.body.building.toLowerCase()).then((data) => {
            return res.status(200).json(data);
        }, (err) => {
            return res.status(500).json({ error: "Something went wrong :(", desc: err });
        });
    } else {
        return res.status(404).json({ error: "Building is missing..." });
    }
}

