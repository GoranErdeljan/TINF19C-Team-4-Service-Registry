/* Check out our GitHub: github.com/GoranErdeljan/TINF19C-Team-4-Service-Registry
 * This File creates a webserver that handles a Web-Interface for the DNS-SD Test-Application
*/

// Importing express for the webserver and serve-static to make serving static files easier
var express = require('express')
var serveStatic = require('serve-static')

// create a express instance
var _app = express()

// List that holds all currently active DNS-SD entries
var _dnssdEntries = []

// Hold configuration for the port the webserver should be reached at
var _config = {
    webInterface: { port: 8080 }
}

// This function is used to override the standard configuration
module.exports.setConfig = function (config){
    _config = config
}

// This function starts the webserver and schedules the updating of the _dnssdEntries list
module.exports.start = function () {
    _app.use(serveStatic('./MOD_21_Web-Interface/wwwroot'))
    _app.get('/DNSSD/Entries', function (req, res) {
        res.send(JSON.stringify(_dnssdEntries))
    })
    _app.listen(_config.webInterface.port, () => {
        console.log("[webInterface] Server running on " + _config.webInterface.port + " ...")
    })

    // Schedule updating of _dnssdEntries and logging of its length
    setInterval(() => {
        _dnssdEntries.forEach(entry => {
            if (entry.ttl < Date.now())
            {
                _dnssdEntries.splice(_dnssdEntries.indexOf(entry), 1)
            }
        })
    }, 10000)
    setInterval(() => {
        console.log("[webInterface] Current number of Entries is: " + _dnssdEntries.length )
    }, 60000);
}

// This function is used to add a DNS-SD entry to the list
module.exports.addDNS_SDEntry = function (entry) {

    let object = {
        srv: [],
        a: [],
        txt: [],
        ttl: Date.now()
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
            object.ttl = Date.now() + answer.ttl * 1000
        }
    })

    // Determine whether new entry already exists and doesn't need to be added
    let exists = false

    _dnssdEntries.forEach(element => {
        let same = true
        element.srv.forEach(srv => {
            if (!object.srv.includes(srv))
                same = false
        })
        element.txt.forEach(record => {
            if (!object.txt.includes(record))
                same = false
        })
        if (!same)
        {
            object.txt.forEach(record => {
                if (!element.txt.includes(record))
                    same = false
            })
        }
        if (same)
        {
            exists = true
            // If element already exists we need to update the time-to-live
            element.ttl = object.ttl
        }
    })
    if (!exists)
        _dnssdEntries.push(object)
}