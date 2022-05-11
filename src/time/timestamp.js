function secondsSinceEpoch(time){ 
    return Math.floor(time / 1000 ); 
}

function getTimestamp() {
    return secondsSinceEpoch(new Date().getTime());
}

module.exports = {
    secondsSinceEpoch,
    getTimestamp,
};