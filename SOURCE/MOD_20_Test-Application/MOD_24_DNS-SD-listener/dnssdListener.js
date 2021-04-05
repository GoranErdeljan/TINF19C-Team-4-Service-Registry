var mdns = require('multicast-dns')();

var callbacks = []

module.exports.start = function () {
    setInterval(() => {
    mdns.query({
        questions: [{
            name: '',
            type: 'A'
        }]
    })}, 60000)

    mdns.on('response', function (query) {
        console.log("DNS SD Response: ")
        console.log(query)
        callbacks.forEach(cb => {
            cb(query)
        })
    })
}

module.exports.addCallback = function(callback) {
    callbacks.push(callback)
}