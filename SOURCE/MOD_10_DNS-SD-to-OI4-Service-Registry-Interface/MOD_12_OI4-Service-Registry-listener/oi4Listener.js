/* Check out our GitHub: github.com/GoranErdeljan/TINF19C-Team-4-Service-Registry
 * This File is the entrypoint of the DNS-SD to OI4-Service-Registry Interface
*/

// Import mqtt and multicast-dns packages
var mqtt = require("mqtt")
var mdns = require("multicast-dns")()

// Define the names of services, this is used to determine whether a mdns query matches this service
const _typeArray = ["", "_oi4-servicediscovery", "_http", "_tcp", "local"]

// This is used to store Information on Devices, that are currently active
var _mams = {}

// This variable holds the mqtt client
var _client

// Configuration
var _config = undefined

// Validator
var _validator = undefined

// Use this function to set the configuration of the module
module.exports.setConfig = function (config) {
    _config = config
}

// Use this function to set the validator the module uses
module.exports.setValidator = function (validator) {
    _validator = validator
}

// Use this function to start the module
module.exports.start = (connectcb = () => { }) => {
    // check whether validator and configuration have been set
    if (typeof _validator === 'undefined') {
        console.error("[oi4Listener] No Validator specified")
        return
    }
    if (typeof _config === 'undefined') {
        console.error("[oi4Listener] No config specified")
        return
    }

    // Create a mqtt client and subscribe to all Master-Asset-Models published on the mqtt broker
    _client = mqtt.connect([{ host: _config.mqtt.hostname, port: _config.mqtt.port }])
    _client.on("connect", () => {
        connectcb()
        _client.subscribe("oi4/+/+/+/+/+/pub/mam/#", (err) => {
            console.log("[oi4Listener] Subscribed to 'oi4/+/+/+/+/+/pub/mam/#'")
            if (err)
                console.error(err)
        })
    })

    // Handle Errors
    _client.on("error", (error) => {
        console.error("[oi4Listener] " + error)
    })

    // Handle incoming messages
    _client.on("message", (topic, message) => {
        // Add MAM to _mams
        let messageobject = JSON.parse(message)
        if (typeof messageobject !== 'undefined'
            && typeof messageobject.PublisherId !== 'undefined'
            && typeof messageobject.Messages !== 'undefined') {
            if (messageobject.PublisherId !== _config.oi4.DeviceClass + "/" + _config.oi4.oi4Identifier) {
                messageobject.Messages.forEach(innerMessage => {
                    _mams[innerMessage.Payload.ProductInstanceUri] = { mam: innerMessage.Payload, PublisherId: messageobject.PublisherId }
                    console.log("[oi4Listener] MAM-Listener added: " + innerMessage.Payload.ProductInstanceUri)
                    console.log("[oi4Listener] MAMs are now: ")
                    console.log(Object.keys(_mams))
                    console.log()
                })
            }
        }
    })

    // Handle incoming mdns-queries
    mdns.on('query', (query) => {
        console.log("[mdns] Received Query, checking if adressed")
        let questions = query.questions
        let addressed = true
        questions.forEach(element => {
            element.name.split('.').forEach(split => {
                if (!_typeArray.includes(split)) {
                    addressed = false
                }
            })
        })
        if (addressed) {
            console.log("[oi4Listener] Service was addressed, sending mdns responses \n")
            Object.keys(_mams).forEach(key => {

                mdns.respond({
                    answers: [{
                        name: _mams[key].mam.ProductInstanceUri,
                        type: 'SRV',
                        data: {
                            port: _config.mdns.hostport,
                            weigth: 0,
                            priority: 10,
                            target: 'localhost'
                        }
                    }, {
                        name: _mams[key].mam.ProductInstanceUri + '._oi4-servicediscovery._http._tcp',
                        type: 'A',
                        ttl: 60,
                        data: _config.mdns.hostip
                    }, {
                        name: _mams[key].mam.ProductInstanceUri + '._oi4-servicediscovery._http._tcp',
                        type: 'TXT',
                        ttl: 60,
                        data: buildTXTOfMAM(_mams[key].mam)
                    }]
                })
            })
        }
    })

    // Monitor Health of registered Devices
    monitorHealthOfDevices()
}

// This function is used to monitor the health of all devices on the MQTT-Broker, 
// it checks whether the Device updates its health in a 60 second intervall
function monitorHealthOfDevices() {
    let statusUnknown = Object.keys(_mams)
    let tempMqttClient = mqtt.connect([{ host: _config.mqtt.hostname, port: _config.mqtt.port }])
    tempMqttClient.subscribe("oi4/+/+/+/+/+/pub/health/#", (err) => {
        console.log("[oi4Listener] Subscribed to health messages")
        if (err)
            console.error("[oi4Listener] " + err)
    })
    tempMqttClient.on('connect', () => {
        setTimeout(() => {
            console.log("[oi4Listener] Stop waiting for Health messages, removing " + statusUnknown.length + ": ")
            statusUnknown.forEach(oi4Identifier => {
                console.log(oi4Identifier)
                delete _mams[oi4Identifier]
            })
            statusUnknown = Object.keys(_mams)
        }, 60000)
    })
    tempMqttClient.on("message", (topic, message) => {
        let known = false
        statusUnknown.forEach(key => {
            console.log("[oi4Listener] Got Health message from: ")
            console.log(_mams[key])
            if (typeof _mams[key] !== 'undefined')
            {
                if (topic.includes(_mams[key].PublisherId)
                    && topic.includes(_mams[key].mam.ProductInstanceUri)) {
                    console.log("[oi4Listener] " + _mams[key].mam.ProductInstanceUri + " is ok")
                    let index = statusUnknown.indexOf(_mams[key].mam.ProductInstanceUri)
                    statusUnknown.splice(index, 1)
                }
                known = true
            }
        })
        Object.keys(_mams).forEach(mam => {
            if (topic.includes(mam.mam.ProductInstanceUri))
                known = true
        })
        if (!known)
        {
            // Request mam from device
            let messageobject = JSON.parse(message)
            
            if (typeof messageobject !== 'undefined')
            {
                let payload = messageobject.Messages[0].Payload
                tempMqttClient.publish("oi4/" + payload.DeviceClass 
                                        + "/" + payload.ProductInstanceUri 
                                        + "/get/mam/" + payload.ProductInstanceUri, JSON.stringify({
                                            MessageId: Date.now() + "-" + _config.oi4.DeviceClass + "/" + _config.oi4.oi4Identifier,
                                            MessageType: "ua-data",
                                            DataSetClassId: "360ca8f3-5e66-42a2-8f10-9cdf45f4bf58",
                                            PublisherId: _config.oi4.DeviceClass + "/" + _config.oi4.oi4Identifier,
                                            Messages: [{
                                                DataSetWriterId: _config.oi4.oi4Identifier,
                                                Timestamp: new Date().toISOString(),
                                                Status: 0,
                                                Payload: {}
                                            }],
                                            CorrelationId: ""
                                        }))
            }
        }
    })
}

// This function is used to build TXT-Records from a Master-Asset-Model
function buildTXTOfMAM(mam) {
    let txt = ["oi4=true"]
    Object.keys(mam).forEach(key => {
        txt.push(key + "=" + JSON.stringify(mam[key]))
    })
    txt.push("DataSetWriterId=" + _config.oi4.oi4Identifier)
    return txt
}