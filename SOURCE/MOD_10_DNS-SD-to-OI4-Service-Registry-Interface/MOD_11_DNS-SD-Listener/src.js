var mdns = require('multicast-dns')();
const mqtt = require('mqtt');

var mqtt_client = mqtt.connect('mqtt://localhost')

mdns.on('query', function(query)  {
    //console.log(query);
    var authorities = query.authorities;
    var txt_records = [];
    var srv_records;
    authorities.forEach(element => {
        if (element.type == 'TXT')
            txt_records.push(element.data.toString())
        if (element.type == 'SRV')
            srv_records = element.data
    });
    console.log('TXT-Records: ')
    console.log(txt_records);
    console.log('SRV-Records: ')
    console.log(srv_records);
    console.log();
});
