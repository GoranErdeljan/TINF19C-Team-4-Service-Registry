var validator = require("./MOD_13_OI4-Conformity-Validator/oi4ConformityValidator")
var registry = require('./MOD_11_DNS-SD-Listener/addtoRegistry')

registry.start(undefined, undefined, () => {
    console.log('connected')
    registry.addDevice("urn:undefined.com/Test/Test/undefined", { blabla: 'blabla' }, Date.now() + 70000)
})
