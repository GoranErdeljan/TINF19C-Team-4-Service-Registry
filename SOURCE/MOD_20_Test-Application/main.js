/* Check out our GitHub: github.com/GoranErdeljan/TINF19C-Team-4-Service-Registry
 * This File is the main File, that is the entrypoint of the DNS-SD Test-Application
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
    announceService: {
        port: 8080,
        ip: "192.168.0.1"
    },
    oi4: {
        SerialNumber: 'undefined',
        Model: 'DNS_SD_Test_Application',
        Productcode: 'DNS_SD_TEST',
        DeviceClass: 'Registry'

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
if (envvar.includes("HOST_IP"))
    config.announceService.ip = process.env.HOST_IP
if (envvar.includes("HOST_PORT"))
    config.announceService.port = process.env.HOST_PORT
if (envvar.includes("MQTT_HOSTNAME"))
    config.mqtt.hostname = process.env.MQTT_HOSTNAME
if (envvar.includes("MQTT_PORT"))
    config.mqtt.port = process.env.MQTT_PORT

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