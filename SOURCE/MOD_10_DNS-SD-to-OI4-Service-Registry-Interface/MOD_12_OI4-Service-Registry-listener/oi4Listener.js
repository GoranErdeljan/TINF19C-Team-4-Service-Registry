var mqtt = require("mqtt")
var mdns = require("multicast-dns")

var client

module.exports.start = (hostname = "localhost", port = 1883, connectcb = () => { }) => {
    client = mqtt.connect([{ host: hostname, port: port }])
}