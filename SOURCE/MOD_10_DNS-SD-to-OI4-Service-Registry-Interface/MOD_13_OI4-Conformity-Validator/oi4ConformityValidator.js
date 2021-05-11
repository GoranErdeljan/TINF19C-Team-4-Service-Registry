/* Check out our GitHub: github.com/GoranErdeljan/TINF19C-Team-4-Service-Registry
 * This file offers functionality to check whether TXT-Records are conform with the OI4-Specifications
*/

// This variable stores the configuration
var _config

// This function is used to set the configuration used by the module
module.exports.setConfig = function(config) {
    _config = config
}

// This function checks whether the TXT-Records are meant for the OI4-Service-Registry 
module.exports.check = function (txtrecords) {
    if (txtrecords.includes("oi4=true") && !txtrecords.includes("DataSetWriterId=" + _config.oi4.oi4Identifier))
    {
        return true
    }
    else
        return false
}

// This function builds a JavaScript-object containing the Master-Asset-Model specified in the txtrecords
module.exports.buildmam = function (txtrecords) {
    if (module.exports.check(txtrecords))
    {
        let mam = {}

        txtrecords.forEach(entry => {
            let json = entry.slice(entry.indexOf('=') + 1, entry.length)
            let key = entry.slice(0, entry.indexOf('='))
            if (key !== 'oi4' && key !== "DataSetWriterId")
            {
                mam[key] = JSON.parse(json)
            }
        })
        return mam
    }
    else
    {
        console.log("[oi4ConformityValidator] TXTRecords are not meant for the OI4-Service-Registry or are announced by this interface")
        return undefined
    }
}
