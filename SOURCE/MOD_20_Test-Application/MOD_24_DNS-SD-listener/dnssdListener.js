var mdns = require('multicast-dns')();

var callbacks = []

module.exports.start = function () {
    mdns.query({
        questions: [{
            name: '',
            type: 'A'
        }]
    })

    mdns.on('response', function (query) {
        console.log("Response: ")
        console.log(query);
        callbacks.forEach(cb => {
            cb(query)
        })
    })
}

module.exports.addCallback = function(callback) {
    callbacks.push(callback)
}