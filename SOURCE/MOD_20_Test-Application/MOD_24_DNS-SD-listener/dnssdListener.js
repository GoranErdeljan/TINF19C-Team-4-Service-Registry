/* Check out our GitHub: github.com/GoranErdeljan/TINF19C-Team-4-Service-Registry
 * This File offers functionality to add callbacks to the discovery of Services using mdns and dns-sd.
*/

// Importing the multicast-dns package
var mdns = require('multicast-dns')();

// This variable stores all registered callbacks
var callbacks = []

// This function needs to be called to start the module, 
// it schedules querying for dns-sd entries and calls registered callbacks with answers
module.exports.start = function () {
    setInterval(() => {
        mdns.query({
            questions: [{
                name: '',
                type: 'A'
            }]
        })
    }, 30000)
    mdns.on('response', function (query) {
        callbacks.forEach(cb => {
            cb(query)
        })
    })
}

// This function is used to register a callback
module.exports.addCallback = function (callback) {
    callbacks.push(callback)
}