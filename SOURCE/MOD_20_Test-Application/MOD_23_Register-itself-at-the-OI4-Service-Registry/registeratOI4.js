/* Check out our GitHub: github.com/GoranErdeljan/TINF19C-Team-4-Service-Registry
 * This File creates a mqtt client, that is used to register the application at the oi4-Service-Registry
*/

// Import the mqtt package
var mqtt = require('mqtt')

// _client stores the mqtt client
var _client

// Set the standard configuration
var _config = {
    oi4: {
        SerialNumber: 'undefined',
        Model: 'DNS_SD_Test_Application',
        Productcode: 'DNS_SD_TEST',
        DeviceClass: 'Registry'

    },
    mqtt: {
        hostname: "localhost",
        port: 1883
    }
}
_config.oi4.oi4Identifier = 'urn:undefined.com/' + _config.oi4.Model + '/' + _config.oi4.Productcode + '/' + _config.oi4.SerialNumber,

// This function is used to change the configuration of the module
module.exports.setConfig = function (config) {
    _config = config
}

// This function is used to start the module
module.exports.start = function () {

    // Connect to MQTT Broker
    _client = mqtt.connect([{ host: _config.mqtt.hostname, port: _config.mqtt.port }])

    // Handle Connection
    _client.on('connect', () => {

        // Subscribe to all MQTT messages concerning this application
        _client.subscribe('oi4/' + _config.oi4.DeviceClass + '/' + _config.oi4.oi4Identifier + '/#', (err) => {
            if (err)
                console.log(err)
        })
        _client.publish('oi4/' + _config.oi4.DeviceClass 
                        + '/' + _config.oi4.oi4Identifier 
                        + '/pub/mam/' + _config.oi4.oi4Identifier, buildmsg(buildmamMessage()))
        
        // Set a interval for publishing health status as specified by the oi4
        setInterval(() => {
            pubHealth()
        }, 60000)

        // Handle Exiting by sending a goodbye message to the MQTT-Broker
        var exiting = false
        function exitHandler() {
            if (!exiting) {
                exiting = true
                console.log("[registeratoi4] Exiting...")
                _client.publish('oi4/' + _config.oi4.DeviceClass 
                                + '/' + _config.oi4.oi4Identifier 
                                + '/pub/health/' + _config.oi4.oi4Identifier, buildmsg([{
                    DataSetWriterId: _config.oi4.oi4Identifier,
                    Timestamp: new Date().toISOString(),
                    Status: 0,
                    Payload: {
                        health: 'NORMAL_0',
                        healthState: 0
                    }
                }], "d8e7b6df-42ba-448a-975a-199f59e8ffeb"), {}, (err) => {
                    // Set Timeout -> exiting process after five seconds
                    setTimeout(() => {
                        console.log("[registeratoi4] Killing now")
                        process.exit()
                    }, 5000)
                })
            }
            else {
                console.log("[registeratoi4] Already exiting")
            }
        }
        process.on('exit', exitHandler.bind());
        process.on('SIGINT', exitHandler.bind());
        process.on('SIGTERM', exitHandler.bind());
    })

    // Handle Messages
    _client.on('message', (topic, message) => {
        console.log('[registeratOI4] Topic: ' + topic + ' Message: ' + message)
        console.log()

        // Set the CorrelationId as specified by the OI4
        let correlationId
        if (JSON.parse(message).CorrelationId !== "") {
            correlationId = JSON.parse(message).CorrelationId
        }
        else {
            correlationId = JSON.parse(message).MessageId
        }

        if (topic.includes('get/mam')) // Handle Requests requesting the Master Asset Model
        {
            _client.publish('oi4/' + _config.oi4.DeviceClass 
                            + '/' + _config.oi4.oi4Identifier 
                            + '/pub/mam/' + _config.oi4.oi4Identifier, buildmsg(buildmamMessage(), '360ca8f3-5e66-42a2-8f10-9cdf45f4bf58', correlationId))
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
    })

    // Handle mqtt connection errors
    _client.on('error', (err) => {
        console.log(err)
    })
}

// This function publishes the health of the Device to the MQTT Broker, for example when requested by the Registry
function pubHealth(correlationId = '') {
    _client.publish('oi4/' + _config.oi4.DeviceClass + '/' + _config.oi4.oi4Identifier + '/pub/health/' + _config.oi4.oi4Identifier, buildmsg([{
        DataSetWriterId: _config.oi4.oi4Identifier,
        Timestamp: new Date().toISOString(),
        Status: 0,
        Payload: {
            health: 'NORMAL_0',
            healthState: 100
        }
    }], "d8e7b6df-42ba-448a-975a-199f59e8ffeb", correlationId))
}

// This function publishes the license to the MQTT Broker
function pubLicense(correlationId = '') {
    _client.publish('oi4/' + _config.oi4.DeviceClass + '/' + _config.oi4.oi4Identifier + '/pub/license/' + _config.oi4.oi4Identifier, buildmsg([{
        DataSetWriterId: _config.oi4.oi4Identifier,
        Timestamp: new Date().toISOString(),
        Payload: {
            licenses: [{
                licenseId: "GNULGPL",
                components: []
            }]
        }
    }], "2ae0505e-2830-4980-b65e-0bbdf08e2d45", correlationId))
}

// This function publishes the License Text to the MQTT Broker
function pubLicenseText(correlationId = '') {
    _client.publish('oi4/' + _config.oi4.DeviceClass + '/' + _config.oi4.oi4Identifier + '/pub/licenseText/GNULGPL', buildmsg([{
        DataSetWriterId: _config.oi4.oi4Identifier,
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
    }], "a6e6c727-4057-419f-b2ea-3fe9173e71cf", correlationId))
}

// This function publishes the config of the Device to the MQTT Broker, for example when it is requested by the Registry
function pubConfig(correlationId = '') {
    _client.publish('oi4/' + _config.oi4.DeviceClass + '/' + _config.oi4.oi4Identifier + '/pub/config/' + _config.oi4.oi4Identifier, buildmsg([{
        DataSetWriterId: _config.oi4.oi4Identifier,
        MetaDataVersion: {
            majorVersion: 0,
            minorVersion: 0
        },
        Timestamp: new Date().toISOString(),
        Payload: {}
    }], "9d5983db-440d-4474-9fd7-1cd7a6c8b6c2", correlationId))
}

// This function publishes the Profile of the Device to the MQTT Broker
function pubProfile(correlationId = '') {
    _client.publish('oi4/' + _config.oi4.DeviceClass + '/' + _config.oi4.oi4Identifier + '/pub/profile/' + _config.oi4.oi4Identifier, buildmsg([{
        DataSetWriterId: _config.oi4.oi4Identifier,
        Timestamp: new Date().toISOString(),
        Status: 0,
        Payload: {
            resource: ["health", "license", "config", "mam", "profile", "licenseText", "publicationList"]
        }
    }], "48017c6a-05c8-48d7-9d85-4b08bbb707f3", correlationId))
}

// This function publishes the PublicationList to the MQTT Broker
function pubPublicationList(correlationId = '') {
    _client.publish('oi4/' + _config.oi4.DeviceClass + '/' + _config.oi4.oi4Identifier + '/pub/publicationList', buildmsg([{
        DataSetWriterId: _config.oi4.oi4Identifier,
        Timestamp: new Date().toISOString(),
        Payload: {
            publicationList: []
        }
    }], "217434d6-6e1e-4230-b907-f52bc9ffe152", correlationId))
}

// This function builds the mam Message, as specified by the OI4
function buildmamMessage() {
    var mam = [{
        DataSetWriterId: _config.oi4.oi4Identifier,
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
                Text: _config.oi4.Model
            },
            ProductCode: _config.oi4.Productcode,
            HardwareRevision: "",
            SoftwareRevision: "0.0",
            DeviceRevision: "",
            DeviceManual: "Not available",
            DeviceClass: _config.oi4.DeviceClass,
            ProductInstanceUri: _config.oi4.oi4Identifier,
            RevisionCounter: 1,
            SerialNumber: _config.oi4.SerialNumber,
            Description: {
                Locale: "de-de",
                Text: _config.oi4.Model
            }
        }
    }]
    return mam
}

module.exports.mam = buildmamMessage

// This function builds a message, for publication at the MQTT Broker, it creates a wrapper around a given message
function buildmsg(messages, DataSetClassId = '360ca8f3-5e66-42a2-8f10-9cdf45f4bf58', CorrelationId = '') {
    var msgWrapper = {
        MessageId: Date.now().toString() + '-' + _config.oi4.DeviceClass + '/' + _config.oi4.oi4Identifier,
        MessageType: 'ua-data',
        PublisherId: _config.oi4.DeviceClass + '/' + _config.oi4.oi4Identifier,
        DataSetClassId: DataSetClassId,
        CorrelationId: CorrelationId,
        Messages: messages
    }
    return JSON.stringify(msgWrapper)
}