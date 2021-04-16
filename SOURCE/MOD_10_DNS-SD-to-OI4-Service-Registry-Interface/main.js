var validator = require("./MOD_13_OI4-Conformity-Validator/oi4ConformityValidator")
var registry = require('./MOD_11_DNS-SD-Listener/addtoRegistry')

registry.start()

registry.addDevice("", {}, Date.now() + 70000)