module.exports = {
    getToday: getTodayFormatted,
}

//http://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
function getTodayFormatted() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    return mm + '.' + dd + '.' + yyyy;
}