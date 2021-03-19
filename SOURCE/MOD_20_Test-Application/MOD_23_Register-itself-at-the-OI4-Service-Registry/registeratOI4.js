var mqtt = require('mqtt')
var crypto = require('crypto')
var client

const SerialNumber = 'undefined'
const Model = 'DNS_SD_Test_Application'
const Productcode = 'DNS_SD_TEST'
const oi4Identifier = 'urn:undefined/' + Model + '/' + Productcode + '/' + SerialNumber


module.exports.start = function() {
    // Send mam to: 'oi4/Aggregation/<appId>/pub/mam/<oi4Identifier>'
    client = mqtt.connect('mqtt://localhost')
    client.on('connect', () => {
        client.publish('oi4/Aggregation/' + oi4Identifier + '/pub/mam/' + oi4Identifier, buildmsg(buildmamMessage()))
    })
    client.on('message', (topic, message) => {
        console.log('Topic: ' + topic + ' Message: ' + message)

    })
}

function buildmamMessage() {
    var mam = {
        DataSetWriterId: oi4Identifier,
        Timestamp: new Date().getTime(),
        Payload: { 
            Manufacturer: { 
                Locale: "de-de",
                Text: "TINF19C-Team4" 
            }, 
            ManufacturerUri: "",
            Model: { 
                Locale: "de-de", 
                Text: "<String>" 
            },
            ProductCode: "",
            HardwareRevision: "",
            SoftwareRevision: "",
            DeviceRevision: "", 
            DeviceManual: "",
            DeviceClass: "",
            SerialNumber: "",
            ProductInstanceUri: oi4Identifier,
            RevisionCounter: '<INT32>',
            Description: { 
                Locale: "<localeId>",
                Text: "<String>" 
            } 
        }
    }
    return mam
}

function buildmsg(messages) {
    var msgWrapper = {
        MessageId: Date.now().toString(),
        MessageType: 'ua-data',
        PublisherId: '<serviceType>/<appId>',
        DataSetClassId: '360ca8f3-5e66-42a2-8f10-9cdf45f4bf58',
        CorrelationId: '<empty/not present> or <initial MessageId>',
        Messages: messages
    }
    return JSON.stringify(msgWrapper)
}