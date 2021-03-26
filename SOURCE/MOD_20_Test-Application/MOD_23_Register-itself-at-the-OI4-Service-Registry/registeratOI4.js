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
        else if (topic.includes("get") && topic.includes("licenseText") && topic.includes("GNULGPL"))
        {
            pubLicenseText()
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
    }], "360ca8f3-5e66-42a2-8f10-9cdf45f4bf58"))
}

// This function publishes the license to the MQTT Broker
function pubLicense()
{
    client.publish('oi4/'+ DeviceClass + '/' + oi4Identifier + '/pub/license/' + oi4Identifier, buildmsg([{
        DataSetWriterId: oi4Identifier,
        Timestamp: new Date().toISOString(),
        Payload: {
            licenses: [ { 
                licenseId: "GNULGPL",
                components: []
            } ]
        }
    }], "2ae0505e-2830-4980-b65e-0bbdf08e2d45"))
}

// This function publishes the License Text to the MQTT Broker
function pubLicenseText()
{
    client.publish('oi4/'+ DeviceClass + '/' + oi4Identifier + '/pub/licenseText/GNULGPL', buildmsg([{
        DataSetWriterId: oi4Identifier,
        Timestamp: new Date().toISOString(),
        Payload: {
            licText: "This library is free software; you can redistribute it and/or " + 
            "modify it under the terms of the GNU Lesser General Public " + 
            "License as published by the Free Software Foundation; either " + 
            "version 2.1 of the License, or (at your option) any later version. " +
            "This library is distributed in the hope that it will be useful, " +
            "but WITHOUT ANY WARRANTY; without even the implied warranty of " +
            "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU " +
            "Lesser General Public License for more details. " +
            "You should have received a copy of the GNU Lesser General Public " +
            "License along with this library; if not, write to the Free Software " +
            "Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301 " +
            "USA"
        }
    }], "a6e6c727-4057-419f-b2ea-3fe9173e71cf"))
}

// This function publishes the config of the Device to the MQTT Broker, for example when it is requested by the Registry
function pubConfig() {
    client.publish('oi4/'+ DeviceClass + '/' + oi4Identifier + '/pub/config/' + oi4Identifier, buildmsg([{
        DataSetWriterId: oi4Identifier,
        MetaDataVersion: {
            majorVersion: 0,
            minorVersion: 0 
        }, 
        Timestamp: new Date().toISOString(), 
        Payload: config
    }], "9d5983db-440d-4474-9fd7-1cd7a6c8b6c2"))
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
function buildmsg(messages, DataSetClassId = '360ca8f3-5e66-42a2-8f10-9cdf45f4bf58', CorrelationId = '') {
    var msgWrapper = {
        MessageId: Date.now().toString() + '-' + DeviceClass + '/' + oi4Identifier,
        MessageType: 'ua-data',
        PublisherId: DeviceClass + '/' + oi4Identifier,
        DataSetClassId: DataSetClassId,
        CorrelationId: CorrelationId,
        Messages: messages
    }
    return JSON.stringify(msgWrapper)
}   