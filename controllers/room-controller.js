module.exports = {
    getRoomStatus: getRoomStatus
}

function getRoomStatus(req, res) {
    console.log("Requested roomID: " + req.body.roomID);

    res.status(200).json({ status: 'ok' });
}