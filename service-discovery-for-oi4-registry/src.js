const mdns = require('mdns');
const discoveralltypes = mdns.browseThemAll();
discoveralltypes.on('serviceUp', service => {
    console.log('Service Up:');
    console.log(service);
});
discoveralltypes.on('serviceDown', service => {
    console.log('Service Down:');
    console.log(service);
});

discoveralltypes.start();