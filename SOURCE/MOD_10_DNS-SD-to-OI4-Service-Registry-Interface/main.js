var validator = require("./MOD_13_OI4-Conformity-Validator/oi4ConformityValidator")
var registry = require('./MOD_11_DNS-SD-Listener/addtoRegistry')
var dnssdListener = require('./MOD_11_DNS-SD-Listener/dnssdListener')


registry.start(undefined, undefined, () => {
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