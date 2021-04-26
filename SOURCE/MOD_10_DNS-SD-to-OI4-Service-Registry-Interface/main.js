/* Check out our GitHub: github.com/GoranErdeljan/TINF19C-Team-4-Service-Registry
 * This File is the entrypoint of the DNS-SD to OI4-Service-Registry Interface
*/

// Import submodules
var validator = require("./MOD_13_OI4-Conformity-Validator/oi4ConformityValidator")
var addToRegistry = require('./MOD_11_DNS-SD-Listener/addtoRegistry')
var dnssdListener = require('./MOD_11_DNS-SD-Listener/dnssdListener')
var oi4Listener = require("./MOD_12_OI4-Service-Registry-listener/oi4Listener.js")

// Standard configuration
var config = {
    mqtt: {
        hostname: "localhost",
        port: 1883
    },
    mdns: {
        hostport: 8080,
        hostip: "192.168.0.1"
    },
    oi4: {
        SerialNumber: 'undefined',
        Model: 'DNS_SD_INTERFACE',
        Productcode: 'DNS_SD_INTERFACE',
        DeviceClass: "Aggregation",
        Urn: "urn:undefined.com"
    }
}

// Get configuration from environment variables
var envvar = Object.keys(process.env)
if (envvar.includes("MDNS_HOSTPORT"))
    config.mdns.hostport = process.env.MDNS_HOSTPORT
if (envvar.includes("MDNS_HOSTIP"))
    config.mdns.hostip = process.env.MDNS_HOSTIP
if (envvar.includes("MQTT_HOSTNAME"))
    config.mqtt.hostname = process.env.MQTT_HOSTNAME
if (envvar.includes("MQTT_PORT"))
    config.mqtt.port = process.env.MQTT_PORT
if (envvar.includes("OI4_SERIALNUMBER"))
    config.oi4.SerialNumber = process.env.OI4_SERIALNUMBER
if (envvar.includes("OI4_MODEL"))
    config.oi4.Model = process.env.OI4_MODEL
if (envvar.includes("OI4_PRODUCTCODE"))
    config.oi4.Productcode = process.env.OI4_PRODUCTCODE
if (envvar.includes("OI4_DEVICECLASS"))
    config.oi4.DeviceClass = process.env.OI4_DEVICECLASS
if (envvar.includes("OI4_URN"))
    config.oi4.Urn = process.env.OI4_URN

// Update oi4Identifier
config.oi4.oi4Identifier = config.oi4.Urn + '/' + config.oi4.Model + '/' + config.oi4.Productcode + '/' + config.oi4.SerialNumber

// logging configuration
console.log("[config] Configuration is:")
console.log(config)

// Set validator configuration
validator.setConfig(config)

// Start the addtoRegistry submodule
addToRegistry.setConfig(config)
addToRegistry.start(() => {
})

// Start the oi4Listener and give it a reference to the validator
oi4Listener.setConfig(config)
oi4Listener.setValidator(validator)
oi4Listener.start(() => {
})

// Start dnssdListener and add callback for adding them to the registry
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

    console.log("[dnssdListener] Found service")
    console.log(mam)
    addToRegistry.addDevice(mam.ProductInstanceUri, mam, ttl)
})