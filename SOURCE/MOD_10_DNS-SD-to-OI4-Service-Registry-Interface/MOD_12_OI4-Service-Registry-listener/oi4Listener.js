var mqtt = require("mqtt")
var mdns = require("multicast-dns")()

const typeArray = ["", "_oi4-servicediscovery", "_http", "_tcp", "local"]

var mams = {}

var client

var config = undefined

var validator = undefined

module.exports.setConfig = function (setconfig) {
    config = setconfig
}
module.exports.setValidator = function (setValidator) {
    validator = setValidator
}
module.exports.start = (connectcb = () => { }) => {
    if (typeof validator === 'undefined') {
        console.error("[oi4Listener] No Validator specified")
        return
    }
    if (typeof config === 'undefined') {
        console.error("[oi4Listener] No config specified")
        return
    }
    client = mqtt.connect([{ host: config.mqtthost, port: config.mqttport }])
    client.on("connect", () => {
        connectcb()
        client.subscribe("oi4/+/+/+/+/+/pub/mam/#", (err) => {
            console.log("[oi4Listener] Subscribed to 'oi4/+/+/+/+/+/pub/mam/#'")
            console.error(err)
        })
    })
    client.on("error", (error) => {
        console.error("[oi4Listener] " + error)
    })
    client.on("message", (topic, message) => {
        // Add MAM to mams
        // TODO: Add checks for undefined values        
        let messageobject = JSON.parse(message)
        if (messageobject.PublisherId !== config.oi4.DeviceClass + "/" + config.oi4.oi4Identifier) {
            messageobject.Messages.forEach(innerMessage => {
                mams[innerMessage.Payload.ProductInstanceUri] = { mam: innerMessage.Payload, PublisherId: messageobject.PublisherId }
                console.log("[oi4Listener] MAM-Listener added: " + innerMessage.Payload.ProductInstanceUri)
                console.log("[oi4Listener] MAMs are now: ")
                console.log(Object.keys(mams))
                console.log()
            })
        }
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
            console.log("[oi4Listener] Service was addressed, sending mdns response")
            Object.keys(mams).forEach(key => {

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
                        data: buildTXTOfMAM(mams[key].mam)
                    }]
                })
            })
        }
    })
    setInterval(() => {
        getHealthOfDevices()
    }, 60000);
}

function getHealthOfDevices() {
    let statusUnknown = Object.keys(mams)
    let waiting = true
    let tempMqttClient = mqtt.connect([{ host: config.mqtthost, port: config.mqttport }])
    tempMqttClient.subscribe("oi4/+/+/+/+/+/pub/health/#", (err) => {
        if (err)
            console.error("[oi4Listener] " + err)
    })
    tempMqttClient.on('connect', () => {
        Object.keys(mams).forEach(key => {
            console.log("[oi4Listener] Requesting health from " + key)
            // TODO: Fix Health requests
            tempMqttClient.publish("oi4/" + mams[key].PublisherId
                + "/get/health/" + mams[key].ProductInstanceUri, JSON.stringify({
                    MessageId: Date.now()
                        + "-" + config.oi4.DeviceClass
                        + "/" + config.oi4.oi4Identifier,
                    MessageType: "ua-data",
                    DataSetClassId: "d8e7b6df-42ba-448a-975a-199f59e8ffeb",
                    PublisherId: config.oi4.DeviceClass + "/" + config.oi4.oi4Identifier,
                    Messages: [{
                        DataSetWriterId: config.oi4.oi4Identifier,
                        Timestamp: new Date().toISOString(),
                        Status: 0,
                        Payload: {}
                    }],
                    CorrelationId: ""
                }))
            // Check Health of Application and update list of mams accordingly
        })
        setTimeout(() => {
            console.log("[oi4Listener] Stop waiting for Health messages, removing: ")
            waiting = false
            delete tempMqttClient
            statusUnknown.forEach(oi4Identifier => {
                console.log(oi4Identifier)
                delete mams[oi4Identifier]
            })
        }, 20000)
    })
    tempMqttClient.on("message", (topic, message) => {
        statusUnknown.forEach(key => {
            if (waiting) {
                console.log("[oi4Listener] Got Health message from: ")
                console.log(mams[key])
                if (topic.includes(mams[key].PublisherId)
                    && topic.includes(mams[key].mam.ProductInstanceUri)) {
                    console.log("[oi4Listener] " + mams[key].mam.ProductInstanceUri + " is ok")
                    let index = statusUnknown.indexOf(mams[key].mam.ProductInstanceUri)
                    statusUnknown.splice(index, 1)
                }
            }
        })
    })
}

function buildTXTOfMAM(mam) {
    let txt = ["oi4=true"]
    Object.keys(mam).forEach(key => {
        txt.push(key + "=" + JSON.stringify(mam[key]))
    })
    return txt
}