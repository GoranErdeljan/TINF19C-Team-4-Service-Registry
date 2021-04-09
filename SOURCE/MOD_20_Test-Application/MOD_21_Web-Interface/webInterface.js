var express = require('express')
var serveStatic = require('serve-static')

var app = express()

var dnssdEntries = []

var config = {
    port: 8080
}

module.exports.start = function (port) {
    // Set Port to input
    if (typeof port === 'number')
        config.port = port
    
    app.use(serveStatic('./MOD_21_Web-Interface/wwwroot'))
    app.get('/DNSSD/Entries', function (req, res) {
        res.send(JSON.stringify(dnssdEntries))
    })
    app.listen(config.port, () => {
        console.log("Server running on " + config.port + " ...")
    })
}

module.exports.emptyDNS_SDEntries = function () {
    dnssdEntries = []
}

module.exports.addDNS_SDEntry = function (entry) {

    let object = {
        srv: [],
        a: [],
        txt: []
    }

    entry.answers.forEach(answer => {
        if (answer.type == 'SRV') {
            object.srv.push(answer.name)
        }
        if (answer.type == 'A' || answer.type == 'AAAA') {
            object.a.push(answer.data)
        }
        if (answer.type == 'TXT') {
            answer.data.forEach(buffer => {
                object.txt.push(buffer.toString())
            })
        }
    })
    let exists = false

    dnssdEntries.forEach(element => {
        element.txt.forEach(record => {
            if (object.txt.includes(record))
                exists = true
        })
    })
    if (!exists)
        dnssdEntries.push(object)
}