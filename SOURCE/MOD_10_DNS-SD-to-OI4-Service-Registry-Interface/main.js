var validator = require("./MOD_13_OI4-Conformity-Validator/oi4ConformityValidator")
var registry = require('./MOD_11_DNS-SD-Listener/addtoRegistry')
var dnssdListener = require('./MOD_11_DNS-SD-Listener/dnssdListener')
var oi4Listener = require("./MOD_12_OI4-Service-Registry-listener/oi4Listener.js")

registry.start(undefined, undefined, () => {
})

oi4Listener.start()

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

