var validator = require("./MOD_13_OI4-Conformity-Validator/oi4ConformityValidator")
var registry = require('./MOD_11_DNS-SD-Listener/addtoRegistry')
var dnssdListener = require('./MOD_11_DNS-SD-Listener/dnssdListener')


registry.start(undefined, undefined, () => {
    registry.addDevice("urn:undefined.com/Test/Test/undefined", {
        Manufacturer: {
            Locale: "de-de",
            Text: "TINF19C-Team4"
        },
        ManufacturerUri: "urn:undefined.com",
        Model: {
            Locale: "de-de",
            Text: "Test"
        },
        ProductCode: "Test",
        HardwareRevision: "",
        SoftwareRevision: "0.0",
        DeviceRevision: "",
        DeviceManual: "Not available",
        DeviceClass: "Device",
        ProductInstanceUri: "urn:undefined.com/Test/Test/undefined",
        RevisionCounter: 1,
        SerialNumber: "",
        Description: {
            Locale: "de-de",
            Text: "Test"
        }
    }, Date.now() + 70000)
})


dnssdListener.start()
dnssdListener.addCallback((response) => {

    let txtrecords = []

    response.answers.forEach(answer => {
        if (answer.type == 'TXT') {
            answer.data.forEach(buffer => {
                txtrecords.push(buffer.toString())
            })
        }
    })

    let mam = validator.buildmam(txtrecords)

    console.log("Found service")
    console.log(mam)
    registry.addDevice(mam.ProductInstanceUri, mam)
})