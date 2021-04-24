var mqtt = require("mqtt")
var mdns = require("multicast-dns")

module.exports.start = (hostname = "localhost", port = 1883, connectcb = () => { }) => {
    mqtt.connect()
}