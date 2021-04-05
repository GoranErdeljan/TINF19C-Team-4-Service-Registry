setInterval(getDNSSDEntries(), 60000)
getDNSSDEntries()
function getDNSSDEntries() {
    $.get('/DNSSD/Entries', {}, function (data) {
        data = JSON.parse(data)
        data.forEach(entry => {
            dnssd_Entries_List.innerHtml = ""
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
                td.appendChild(document.createTextNode(element))
                td.appendChild(document.createElement("br"))
            })
            tr.appendChild(td);

            dnssd_Entries_List.firstElementChild.appendChild(tr);
        })
    })
}