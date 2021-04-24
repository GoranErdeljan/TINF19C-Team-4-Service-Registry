var mqtt = require("mqtt")
var mdns = require("multicast-dns")

const typeArray = ["", "_oi4-servicediscovery", "_http", "_tcp", "local"]

var mams = []

var client

var config = undefined

var validator = undefined

module.exports.setConfig = function (setconfig) {
    config = setconfig
}
module.exports.setValidator = function (setValidator) {
    validator = setValidator
}
module.exports.start = ( connectcb = () => { }) => {
    if (typeof validator !== 'undefined') {
        console.error("No Validator specified")
        return
    }
    if (typeof config !== 'undefined') {
        console.error("No config specified")
        return
    }
    client = mqtt.connect([{ host: config.mqtthost, port: config.mqttport }])
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
        // Add MAM to mams

    })
    mdns.on('query', (query) => {
        let questions = query.questions
        let addressed = true
        questions.forEach(element => {
            element.name.split('.').forEach(split => {
                if (!typeArray.includes(split)) {
                    addressed = false
                }
            })
        })
        if (addressed) {
            console.log("Service was addressed, sending mdns response")
            mams.forEach(mam => {

                mdns.respond({
                    answers: [{
                        name: 'Service Discovery Test Application',
                        type: 'SRV',
                        data: {
                            port: config.hostport,
                            weigth: 0,
                            priority: 10,
                            target: 'localhost'
                        }
                    }, {
                        name: '_oi4-servicediscovery._http._tcp.local',
                        type: 'A',
                        ttl: 60,
                        data: config.hostip
                    }, {
                        name: '_oi4-servicediscovery._http._tcp.local',
                        type: 'TXT',
                        ttl: 60,
                        data: buildTXTOfMAM(mam)
                    }]
                })
            })
        }
    })
}

function getHealthOfDevices() {
    mams.forEach(mam => {
        // Check Health of Application and update list of mams accordingly
    })
}

function buildTXTOfMAM (mam) {
    let txt = ["oi4=true"]
    Object.keys(mam).forEach(key => {
        txt.push(key + "=" + JSON.stringify(mam[key]))
    })
    return txt
}