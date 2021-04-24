var mqtt = require("mqtt")
var mdns = require("multicast-dns")

var client

module.exports.start = (hostname = "localhost", port = 1883, connectcb = () => { }) => {
    client = mqtt.connect([{ host: hostname, port: port }])
    client.on("connect", () => {
        connectcb()
        client.subscribe("oi4/+/+/+/+/+/pub/mam/#", (err) => {
            console.log("Subscribed")
            console.error(err)
        })
    })
    client.on("error", (error) => {
        console.error(error)
    })
    client.on("message", (topic, message) => {
        console.log("MAM-Listener got: " + topic)
        console.log(message.toString("ascii"))
        console.log()
    })
}