setInterval(getDNSSDEntries(), 60000)
getDNSSDEntries()
function getDNSSDEntries() {
    $.get('/DNSSD/Entries', {}, function (data) {
        data = JSON.parse(data)
        data.forEach(entry => {
            console.log(entry)

            var tr = document.createElement("tr")
            var td = document.createElement("td")
            entry.srv.forEach(element => {
                td.appendChild(document.createTextNode(element + " "))
            })
            tr.appendChild(td);

            td = document.createElement("td")
            entry.a.forEach(element => {
                td.appendChild(document.createTextNode(element + " "))
            })
            tr.appendChild(td);

            td = document.createElement("td")
            entry.txt.forEach(element => {
                td.appendChild(document.createTextNode(element + "<br> "))
            })
            tr.appendChild(td);

            dnssd_Entries_List.firstElementChild.appendChild(tr);
        })
    })
}