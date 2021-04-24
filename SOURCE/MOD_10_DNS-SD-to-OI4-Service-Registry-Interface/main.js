var validator = require("./MOD_13_OI4-Conformity-Validator/oi4ConformityValidator")
var registry = require('./MOD_11_DNS-SD-Listener/addtoRegistry')
var dnssdListener = require('./MOD_11_DNS-SD-Listener/dnssdListener')
var oi4Listener = require("./MOD_12_OI4-Service-Registry-listener/oi4Listener.js")

var config = {
    hostport: 8080,
    hostip: "192.168.0.1",
    mqtthost: "localhost",
    mqttport:  "1883",
    oi4: {
        SerialNumber: 'undefined',
        Model: 'DNS_SD_INTERFACE',
        Productcode: 'DNS_SD_INTERFACE',
        oi4Identifier: 'urn:undefined.com/' + config.oi4.Model + '/' + config.oi4.Productcode + '/' + config.oi4.SerialNumber,
        DeviceClass: "Aggregation"
    }
}

registry.start(undefined, undefined, () => {
})


oi4Listener.setConfig(config)
oi4Listener.setValidator(validator)
oi4Listener.start(() => {
    console.log("Connected")
})

dnssdListener.start()
dnssdListener.addCallback((response) => {

    let txtrecords = []
    let ttl

    response.answers.forEach(answer => {
        if (answer.type == 'TXT') {
            answer.data.forEach(buffer => {
                txtrecords.push(buffer.toString())
                ttl = answer.ttl
            })
        }
    })

    let mam = validator.buildmam(txtrecords)

    console.log("Found service")
    console.log(mam)
    registry.addDevice(mam.ProductInstanceUri, mam, ttl)
})

