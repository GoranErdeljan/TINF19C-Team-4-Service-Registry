var express = require('express')
var serveStatic = require('serve-static')

var app = express()

var serviceRegistryEntries = []
var dnssdEntries = []


module.exports.start = function() {
    app.use(serveStatic('./MOD_21_Web-Interface/wwwroot'))
    app.get('/ServiceRegistry/Entries', function(req, res) {
        res.send(JSON.stringify(serviceRegistryEntries))
    })
    app.get('/DNSSD/Entries', function (req, res) {
        res.send(JSON.stringify(dnssdEntries))
    })
    app.listen(8080, () => {
        console.log("Server running on 8080 ...")
    })
}

module.exports.emptyServiceRegistryEntries = function () {
    serviceRegistryEntries = []
}

module.exports.addServiceRegistryEntry = function(entry) {
    serviceRegistryEntries.push(entry)
}

module.exports.emptyDNS_SDEntries = function() {
    dnssdEntries = []
}

module.exports.addDNS_SDEntry = function(entry){
    dnssdEntries.push(entry)
}