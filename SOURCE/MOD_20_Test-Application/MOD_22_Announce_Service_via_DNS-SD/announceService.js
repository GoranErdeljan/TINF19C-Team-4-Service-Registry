/* Check out our GitHub: github.com/GoranErdeljan/TINF19C-Team-4-Service-Registry
 * This File announces the service using mdns and DNS-SD
*/

// Import the multicast-dns package
var mdns = require('multicast-dns')()

// Define the name of service, this is used to determine whether a mdns query matches this service
const _typeArray = ["", "_oi4-servicediscovery", "_http", "_tcp", "local"]

// The _config object holds all configuration for announcing the service
var _config = {
    mdns: {
        hostip: "192.168.0.1",
        hostport: 8080
    }

}

// This function is used to set the configuration of the module
module.exports.setConfig = function (config) {
    _config = config
}

// This function is used to start the module. mam is the Master-Asset-Model the service should be announced with
module.exports.start = function (mam) {

    // Build txt Messages, that are sent when announcing the service
    let txt = [
        "oi4=true"
    ]

    Object.keys(mam).forEach(key => {
        txt.push(key + "=" + JSON.stringify(mam[key]))
    })

    // Responding to mdns queries when addressed
    mdns.on('query', function (query) {
        let questions = query.questions
        let addressed = true
        questions.forEach(element => {
            element.name.split('.').forEach(split => {
                if (!_typeArray.includes(split)) {
                    addressed = false
                }
            })
        })
        if (addressed) {
            console.log("[announceService] Service was addressed, sending mdns response")
            mdns.respond({
                answers: [{
                    name: 'Service Discovery Test Application',
                    type: 'SRV',
                    data: {
                        port: _config.mdns.hostport,
                        weigth: 0,
                        priority: 10,
                        target: 'localhost'
                    }
                }, {
                    name: '_oi4-servicediscovery._http._tcp.local',
                    type: 'A',
                    ttl: 60,
                    data: _config.mdns.hostip
                }, {
                    name: '_oi4-servicediscovery._http._tcp.local',
                    type: 'TXT',
                    ttl: 60,
                    data: txt
                }]
            })
        }
    })
}