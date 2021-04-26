/* Check out our GitHub: github.com/GoranErdeljan/TINF19C-Team-4-Service-Registry
 * This File is the main File, which is the entrypoint of the DNS-SD Test-Application
*/

// Importing all submodules
var webInterface = require("./MOD_21_Web-Interface/webInterface")
var dnssdListener = require("./MOD_24_DNS-SD-listener/dnssdListener")
var announceService = require("./MOD_22_Announce_Service_via_DNS-SD/announceService")
var registeratOI4 = require("./MOD_23_Register-itself-at-the-OI4-Service-Registry/registeratOI4")

// Standard Configuration
var config = {
    webInterface: {
        port: 8080
    },
    oi4: {
        SerialNumber: 'undefined',
        Model: 'DNS_SD_Test_Application',
        Productcode: 'DNS_SD_TEST',
        DeviceClass: 'Registry',
        Urn: "urn:undefined.com"
    },
    mqtt: {
        hostname: "localhost",
        port: 1883
    },
    mdns: {
        hostip: "192.168.0.1",
        hostport: 8080
    }
}

// Get Configuration
var envvar = Object.keys(process.env)
if (envvar.includes("WEB_INTERFACE_PORT"))
    config.webInterface.port = process.env.WEB_INTERFACE_PORT
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

// Add oi4Identifier
config.oi4.oi4Identifier = config.oi4.Urn + '/' + config.oi4.Model + '/' + config.oi4.Productcode + '/' + config.oi4.SerialNumber

// logging configuration
console.log("[config] Configuration is:")
console.log(config)

// Start Services
webInterface.setConfig(config)
webInterface.start(config.webInterface.port)

dnssdListener.start()
dnssdListener.addCallback(function(entry) {
    webInterface.addDNS_SDEntry(entry)
})

announceService.setConfig(config)
announceService.start(registeratOI4.mam()[0].Payload)

registeratOI4.setConfig(config)
registeratOI4.start()