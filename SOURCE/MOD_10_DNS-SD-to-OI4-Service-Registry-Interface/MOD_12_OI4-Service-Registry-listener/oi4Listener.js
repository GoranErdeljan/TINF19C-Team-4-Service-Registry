var mqtt = require("mqtt")
var mdns = require("multicast-dns")

var client

module.exports.start = (hostname = "localhost", port = 1883, connectcb = () => { }) => {
    client = mqtt.connect([{ host: hostname, port: port }])
    client.on("connect", () => {
        connectcb()
        client.subscribe("oi4/Registry/urn:hilscher.com/Registry%20Application/OI4-REG/undefined/#", (err) => {
            console.log("Subscribed")
            console.error(err)
        })
    })
    client.on("error", (error) => {
        console.error(error)
    })
    client.on("message", (topic, message) => {
        console.log("Registry-Listener got:")
        console.log(message)
    })
}