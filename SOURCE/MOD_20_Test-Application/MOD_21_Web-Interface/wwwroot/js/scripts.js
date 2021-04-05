setInterval(getDNSSDEntries(), 60000)
getDNSSDEntries()
function getDNSSDEntries() {
    $.get('/DNSSD/Entries', {}, function (data) {
        data = JSON.parse(data)
        data.forEach(element => {
            console.log(element.answers)

            var srv = []
            var a = []
            var txt = []

            element.answers.forEach(answer => {
                if (answer.type == 'SRV') {
                    srv.push(answer.name)
                }
                if (answer.type == 'A' || answer.type == 'AAAA') {
                    a.push(answer.data)
                }
                if (answer.type == 'TXT') {
                    txt.push(JSON.stringify(answer.data))
                }
            })

            var tr = document.createElement("tr")
            var td = document.createElement("td")
            srv.forEach(element => {
                td.appendChild(document.createTextNode(element + " "))
            })
            tr.appendChild(td);

            td = document.createElement("td")
            a.forEach(element => {
                td.appendChild(document.createTextNode(element + " "))
            })
            tr.appendChild(td);

            td = document.createElement("td")
            txt.forEach(element => {
                td.appendChild(document.createTextNode(element + " "))
            })
            tr.appendChild(td);

            dnssd_Entries_List.firstElementChild.appendChild(tr);
        })
    })
}