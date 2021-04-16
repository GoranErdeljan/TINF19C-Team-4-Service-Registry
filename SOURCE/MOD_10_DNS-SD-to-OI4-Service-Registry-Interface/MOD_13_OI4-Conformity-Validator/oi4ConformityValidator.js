module.exports.check = function (txtrecords) {
    txtrecords.forEach(element => {
        if (element == "oi4=true")
            return true  
    })
    return false
}