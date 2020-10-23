var mdns = require('multicast-dns')();
const mqtt = require('mqtt');

mdns.on('query', function(query)  {
    console.log(query);
});
