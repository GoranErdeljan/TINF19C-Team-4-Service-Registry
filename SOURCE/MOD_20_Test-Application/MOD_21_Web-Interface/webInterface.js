var express = require('express')
var serveStatic = require('serve-static')

var app = express()

var dnssdEntries = []


module.exports.start = function () {
    app.use(serveStatic('./MOD_21_Web-Interface/wwwroot'))
    app.get('/DNSSD/Entries', function (req, res) {
        res.send(JSON.stringify(dnssdEntries))
    })
    app.listen(8080, () => {
        console.log("Server running on 8080 ...")
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
            console.log(answer.data)
            answer.data.forEach(buffer => {
                object.txt.push(buffer.toString())
            })
            //object.txt.push(JSON.stringify(answer.data))
        }
    })
    let exists = false

    dnssdEntries.forEach(element => {
        if (element.txt === object.txt)
            exists = true
    })
    if (!exists)
        dnssdEntries.push(object)
}