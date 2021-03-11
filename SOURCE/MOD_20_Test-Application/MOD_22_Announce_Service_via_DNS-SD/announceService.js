var mdns = require('multicast-dns')()

const typeArray = ["", "_oi4-servicediscovery", "_http", "_tcp", "local"]

module.exports.start = function () {
    mdns.on('query', function (query) {
        let questions = query.questions
        let addressed = true
        questions.forEach(element => {
            element.name.split('.').forEach(split => {
                if (!typeArray.includes(split)) {
                    addressed = false
                }
            })
        })
        if (addressed) {
            console.log("Service was addressed, sending mdns response")
            mdns.respond({
                answers: [{
                    name: 'Service Discovery Test Application',
                    type: 'SRV',
                    data: {
                        port: 80,
                        weigth: 0,
                        priority: 10,
                        target: 'localhost'
                    }
                }, {
                    name: '_oi4-servicediscovery._http._tcp.local',
                    type: 'A',
                    ttl: 60,
                    data: '192.168.1.5'
                }, {
                    name: '_oi4-servicediscovery._http._tcp.local',
                    type: 'TXT',
                    ttl: 60,
                    data: [
                        // Put TXT Records in here
                        "port=90"
                    ]
                }]
            })
        }
    })
}