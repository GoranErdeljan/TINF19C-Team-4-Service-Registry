module.exports.check = function (txtrecords) {
    txtrecords.forEach(element => {
        if (element == "oi4=true")
            return true  
    })
    return false
}

module.exports.buildmam = function (txtrecords) {
    if (module.exports.check(txtrecords))
    {
        let mam = {}

        txtrecords.forEach(entry => {
            let json = entry.slice(entry.indexOf('='), entry.length - 1)
            let key = entry.slice(0, entry.indexOf('='))
            if (key !== 'oi4')
            {
                mam[key] = JSON.parse(json)
            }
        })
        return mam
    }
    else
    {
        console.log("not for oi4")
        return undefined
    }
}