var mdns = require('multicast-dns')();
const mqtt = require('mqtt');

var mqtt_client = mqtt.connect('mqtt://localhost')
var callbacks = []

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

module.exports.addCallback = function(callback) {
    callbacks.push(callback)
}