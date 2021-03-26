var mqtt = require('mqtt')
var crypto = require('crypto')
var client

const SerialNumber = 'undefined'
const Model = 'DNS_SD_Test_Application'
const Productcode = 'DNS_SD_TEST'
const oi4Identifier = 'urn:undefined.com/' + Model + '/' + Productcode + '/' + SerialNumber
const DeviceClass = 'Aggregation'

var config = {
    mqtt: 'mqtt://localhost'
}

module.exports.start = function() {
    // Connect to MQTT Broker
    client = mqtt.connect('mqtt://localhost')

    // Handle Connection
    client.on('connect', () => {
        client.subscribe('oi4/'+ DeviceClass + '/' + oi4Identifier + '/#', (err) => {
            if (err)
                console.log(err)
        })
        client.publish('oi4/'+ DeviceClass + '/' + oi4Identifier + '/pub/mam/' + oi4Identifier, buildmsg(buildmamMessage()))
        pubConfig()
        setInterval(() => {
            pubHealth()
        }, 60000)
    })

    // Handle Messages
    client.on('message', (topic, message) => {
        console.log('Topic: ' + topic + ' Message: ' + message)
        if (topic.includes('get') && topic.includes('mam'))
        {
            client.publish('oi4/'+ DeviceClass + '/' + oi4Identifier + '/pub/mam/' + oi4Identifier, buildmsg(buildmamMessage()))
        }
        else if (topic.includes("get") && topic.includes("health"))
        {
            pubHealth();
        }
        else if (topic.includes("get") && topic.includes("config"))
        {
            pubConfig();
        }
        else if (topic.includes("get") && topic.includes("license"))
        {
            pubLicense()
        }
    })
}

// This function publishes the health of the Device to the MQTT Broker, for example when requested by the Registry
function pubHealth()
{
    client.publish('oi4/'+ DeviceClass + '/' + oi4Identifier + '/pub/health/' + oi4Identifier, buildmsg([{
        DataSetWriterId: oi4Identifier,
        Timestamp: new Date().toISOString(),
        Status: 0,
        Payload: {
            health: 'NORMAL_0',
            healthState: 100
        }
    }]))
}

// This function publishes the license to the MQTT Broker
function pubLicense()
{
    client.publish('oi4/'+ DeviceClass + '/' + oi4Identifier + '/pub/license/' + oi4Identifier, buildmsg([{
        DataSetWriterId: oi4Identifier,
        Timestamp: new Date().toISOString(),
        Payload: {
            licenses: [ { 
                licenseId: "Apache2.0"
            } ]
        }
    }]))
}

// This function publishes the config of the Device to the MQTT Broker, for example when it is requested by the Registry
function pubConfig() {
    client.publish('oi4/'+ DeviceClass + '/' + oi4Identifier + '/pub/config/' + oi4Identifier, buildmsg({
        DataSetWriterId: oi4Identifier,
        MetaDataVersion: {
            majorVersion: 0,
            minorVersion: 0 
        }, 
        Timestamp: new Date().toISOString(), 
        Payload: config
    }))
}

// This function builds the mam Message, as specified by the OI4
function buildmamMessage() {
    var mam = [{
        DataSetWriterId: oi4Identifier,
        Timestamp: new Date().toISOString(),
        Status: 0,
        Payload: { 
            Manufacturer: { 
                Locale: "de-de",
                Text: "TINF19C-Team4" 
            }, 
            ManufacturerUri: "urn:undefined.com",
            Model: { 
                Locale: "de-de", 
                Text: Model 
            },
            ProductCode: Productcode,
            HardwareRevision: "",
            SoftwareRevision: "0.0",
            DeviceRevision: "", 
            DeviceManual: "Not available",
            DeviceClass: DeviceClass,
            ProductInstanceUri: oi4Identifier,
            RevisionCounter: 1,
            Description: { 
                Locale: "de-de",
                Text: Model 
            }
        }
    }]
    return mam
}

// This function builds a message, for publication at the MQTT Broker, it creates a wrapper around a given message
function buildmsg(messages) {
    var msgWrapper = {
        MessageId: Date.now().toString() + '-' + DeviceClass + '/' + oi4Identifier,
        MessageType: 'ua-data',
        PublisherId: DeviceClass + '/' + oi4Identifier,
        DataSetClassId: '360ca8f3-5e66-42a2-8f10-9cdf45f4bf58',
        CorrelationId: '',
        Messages: messages
    }
    return JSON.stringify(msgWrapper)
}   