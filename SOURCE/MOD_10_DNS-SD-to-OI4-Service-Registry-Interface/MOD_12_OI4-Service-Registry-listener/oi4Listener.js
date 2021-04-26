var mqtt = require("mqtt")
var mdns = require("multicast-dns")()

const _typeArray = ["", "_oi4-servicediscovery", "_http", "_tcp", "local"]

var _mams = {}

var _client

var _config = undefined

var _validator = undefined

module.exports.setConfig = function (config) {
    _config = config
}

module.exports.setValidator = function (validator) {
    _validator = validator
}

module.exports.start = (connectcb = () => { }) => {
    if (typeof _validator === 'undefined') {
        console.error("[oi4Listener] No Validator specified")
        return
    }
    if (typeof _config === 'undefined') {
        console.error("[oi4Listener] No config specified")
        return
    }
    _client = mqtt.connect([{ host: _config.mqtt.hostname, port: _config.mqtt.port }])
    _client.on("connect", () => {
        connectcb()
        _client.subscribe("oi4/+/+/+/+/+/pub/mam/#", (err) => {
            console.log("[oi4Listener] Subscribed to 'oi4/+/+/+/+/+/pub/mam/#'")
            if (err)
                console.error(err)
        })
    })
    _client.on("error", (error) => {
        console.error("[oi4Listener] " + error)
    })
    _client.on("message", (topic, message) => {
        // Add MAM to mams
        // TODO: Add checks for undefined values        
        let messageobject = JSON.parse(message)
        if (messageobject.PublisherId !== _config.oi4.DeviceClass + "/" + _config.oi4.oi4Identifier) {
            messageobject.Messages.forEach(innerMessage => {
                _mams[innerMessage.Payload.ProductInstanceUri] = { mam: innerMessage.Payload, PublisherId: messageobject.PublisherId }
                console.log("[oi4Listener] MAM-Listener added: " + innerMessage.Payload.ProductInstanceUri)
                console.log("[oi4Listener] MAMs are now: ")
                console.log(Object.keys(_mams))
                console.log()
            })
        }
    })
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
    monitorHealthOfDevices()
}

function monitorHealthOfDevices() {
    let statusUnknown = Object.keys(_mams)
    let tempMqttClient = mqtt.connect([{ host: _config.mqtt.hostname, port: _config.mqtt.port }])
    tempMqttClient.subscribe("oi4/+/+/+/+/+/pub/health/#", (err) => {
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
        statusUnknown.forEach(key => {
            console.log("[oi4Listener] Got Health message from: ")
            console.log(_mams[key])
            if (typeof _mams[key] !== 'undefined')
                if (topic.includes(_mams[key].PublisherId)
                    && topic.includes(_mams[key].mam.ProductInstanceUri)) {
                    console.log("[oi4Listener] " + _mams[key].mam.ProductInstanceUri + " is ok")
                    let index = statusUnknown.indexOf(_mams[key].mam.ProductInstanceUri)
                    statusUnknown.splice(index, 1)
                }

        })
    })
}

function buildTXTOfMAM(mam) {
    let txt = ["oi4=true"]
    Object.keys(mam).forEach(key => {
        txt.push(key + "=" + JSON.stringify(mam[key]))
    })
    txt.push("DataSetWriterId=" + _config.oi4.oi4Identifier)
    return txt
}