module.exports.check = function (txtrecords) {
    if (txtrecords.includes("oi4=true"))
    {
        return true
    }
    else
        return false
}

module.exports.buildmam = function (txtrecords) {
    console.log(txtrecords)
    if (module.exports.check(txtrecords))
    {
        let mam = {}

        txtrecords.forEach(entry => {
            let json = entry.slice(entry.indexOf('=') + 1, entry.length - 1)
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