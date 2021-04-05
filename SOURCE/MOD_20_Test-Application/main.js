var webInterface = require("./MOD_21_Web-Interface/webInterface")
var dnssdListener = require("./MOD_24_DNS-SD-listener/dnssdListener")
var announceService = require("./MOD_22_Announce_Service_via_DNS-SD/announceService")
var registeratOI4 = require("./MOD_23_Register-itself-at-the-OI4-Service-Registry/registeratOI4")

// Get Configuration



// Start Services
webInterface.start()
dnssdListener.start()
dnssdListener.addCallback(function(entry) {
    webInterface.addDNS_SDEntry(entry)
})

announceService.start(registeratOI4.mam()[0].Payload)
registeratOI4.start()