var mqtt = require('mqtt')
// Device should have ttl and all payloads that need to be published on the oi4-Messagebus
// Health will always be reported as 100, except, when the device entry is older than its ttl, then 0 will be reported
var devices = {}

// Configuration
const SerialNumber = 'undefined'
const Model = 'DNS_SD_INTERFACE'
const Productcode = 'DNS_SD_INTERFACE'
const oi4Identifier = 'urn:undefined.com/' + Model + '/' + Productcode + '/' + SerialNumber
const DeviceClass = "Aggregation"

module.exports.start = function (hostname = "localhost", port = 1883) {

    // Connect to MQTT Broker
    client = mqtt.connect([{ host: hostname, port: port }])

    // Handle Connection
    client.on('connect', () => {
        client.subscribe('oi4/' + DeviceClass + '/' + oi4Identifier + '/#', (err) => {
            if (err)
                console.log(err)
        })
        client.publish('oi4/' + DeviceClass + '/' + oi4Identifier + '/pub/mam/' + oi4Identifier, buildmsg(buildmamMessage()))
        setInterval(() => {
            pubHealth()
        }, 60000)
    })

    // Handle Messages
    client.on('message', (topic, message) => {
        console.log('Topic: ' + topic + ' Message: ' + message)
        console.log()
        let correlationId
        if (JSON.parse(message).CorrelationId !== "") {
            correlationId = JSON.parse(message).CorrelationId
        }
        else {
            correlationId = JSON.parse(message).MessageId
        }
        if (topic.includes(oi4Identifier)) {
            if (topic.includes('get/mam')) // Handle Requests requesting the Master Asset Model
            {
                client.publish('oi4/' + DeviceClass + '/' + oi4Identifier + '/pub/mam/' + oi4Identifier, buildmsg(buildmamMessage(), '360ca8f3-5e66-42a2-8f10-9cdf45f4bf58', correlationId))
            }
            else if (topic.includes("get/health")) // Handle Requests concerning the Health of the Application
            {
                pubHealth(correlationId);
            }
            else if (topic.includes("get/config")) // Handle Requests concerning the Configuration of the Application
            {
                pubConfig(correlationId);
            }
            else if (topic.includes("get/licenseText/GNULGPL")) // Handle Requests concerning specific Licenses
            {
                pubLicenseText(correlationId)
            }
            else if (topic.includes("get/license/")) // Handle Requests concerning the License of the Application
            {
                pubLicense(correlationId)
            }
            else if (topic.includes("get/profile")) // Handle Requests concerning the Profile of the Application
            {
                pubProfile(correlationId)
            }
            else if (topic.includes("get/publicationList")) // Handle Requests concerning the PublicationList of the Application
            {
                pubPublicationList(correlationId)
            }
        }
        else
        {
            Object.keys(devices).forEach(device => {
                if (topic.includes(devices[device].oi4Identifier))
                {
                    if (topic.includes("get/mam"))
                    {
                        client.publish('oi4/Device/' + devices[device].oi4Identifier + '/pub/mam/' + oi4Identifier, 
                            buildmsg([{
                                DataSetWriterId: devices[device].oi4Identifier,
                                Timestamp: new Date().toISOString(),
                                Status: 0,
                                Payload:  devices[device].mam }],
                            '360ca8f3-5e66-42a2-8f10-9cdf45f4bf58', 
                            correlationId))
                    }
                    else if (topic.includes("get/health"))
                    {
                        client.publish('oi4/Device/' + devices[device].oi4Identifier + '/pub/mam/' + oi4Identifier,
                                        buildmsg(devices[device].mam, 
                                        "d8e7b6df-42ba-448a-975a-199f59e8ffeb",
                                        correlationId))
                    }
                    else if (topic.includes("get/profile"))
                    {
                        client.publish('oi4/Device/' + devices[device].oi4Identifier + '/pub/mam/' + oi4Identifier,
                                        buildmsg(devices[device].mam,
                                        "48017c6a-05c8-48d7-9d85-4b08bbb707f3",
                                        correlationId))
                    }
                }
            })
        }
    })

    client.on('error', (err) => {
        console.log(err)
    })
}

module.exports.addDevice = function (oi4identifier, mam, ttl = Date.now() + 60000)
{
    if (typeof devices[oi4identifier] === 'undefined') {
        devices[oi4Identifier] = {
            mam: mam,
            oi4identifier: oi4identifier,
            ttl: ttl
        }
    }
    else {
        devices[oi4identifier].mam = mam
        devices[oi4identifier].ttl = ttl
    }

    client.publish('oi4/' + DeviceClass + '/' + oi4Identifier + '/pub/mam/' + oi4Identifier,
        buildmsg([{
            DataSetWriterId: devices[device].oi4Identifier,
            Timestamp: new Date().toISOString(),
            Status: 0,
            Payload: devices[oi4Identifier].mam
        }],
        '360ca8f3-5e66-42a2-8f10-9cdf45f4bf58'))

}