var mdns = require('multicast-dns')();

var callbacks = []

module.exports.start = function () {
    setInterval(() => {
        mdns.query({
            questions: [{
                name: '',
                type: 'A'
            }]
        })
    }, 60000)
    mdns.query({
        questions: [{
            name: '',
            type: 'A'
        }]
    })
    mdns.on('response', function (query) {
        callbacks.forEach(cb => {
            cb(query)
        })
    })
}

module.exports.addCallback = function (callback) {
    callbacks.push(callback)
}