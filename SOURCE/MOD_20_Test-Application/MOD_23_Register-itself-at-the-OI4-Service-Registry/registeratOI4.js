var mqtt = require('mqtt')
var crypto = require('crypto')
var client

const SerialNumber = 'undefined'
const Model = 'DNS_SD_Test_Application'
const Productcode = 'DNS_SD_TEST'
const oi4Identifier = 'urn:undefined.com/' + Model + '/' + Productcode + '/' + SerialNumber
const DeviceClass = 'Registry'

module.exports.start = function() {
    // Send mam to: 'oi4/Aggregation/<appId>/pub/mam/<oi4Identifier>'
    client = mqtt.connect('mqtt://localhost')
    client.on('connect', () => {
        client.publish('oi4/'+ DeviceClass + '/' + oi4Identifier + '/pub/mam/' + oi4Identifier, buildmsg(buildmamMessage()))
        setInterval(() => {
            pubHealth()
        }, 5000)
    })
    client.on('message', (topic, message) => {
        console.log('Topic: ' + topic + ' Message: ' + message)

    })
}

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

function buildmamMessage() {
    var mam = [{
        DataSetWriterId: oi4Identifier,
        Timestamp: new Date().toUTCString(),
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
            RevisionCounter: '1',
            Description: { 
                Locale: "de-de",
                Text: Model 
            } 
        }
    }]
    return mam
}

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