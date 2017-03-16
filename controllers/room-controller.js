module.exports = {
    getRoomStatus: getRoomStatus
}

const RoomModel = require('../models/room_model');

function getRoomStatus(req, res) {
    if (req.body.hasOwnProperty("roomID")) {
        RoomModel.getRoomStatus(req.body.roomID.toLowerCase()).then((data) => {
            return res.status(200).json(data);
        }, (err) => {
            console.error(err);
            return res.status(500).json({ error: "Something went wrong :(", desc: err });
        });
    } else {
        return res.status(404).json({ error: "Room is missing..." });
    }
}