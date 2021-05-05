/* Check out our GitHub: github.com/GoranErdeljan/TINF19C-Team-4-Service-Registry
 * This File handles the updating of the table of DNS-SD entries on the webInterface of the DNS-SD Test-Application
*/

// Schedule updating and call once, when the file is loaded
setInterval(getDNSSDEntries, 10000)
getDNSSDEntries()

// This function uses jquery to get current DNS-SD entries from the webserver and update the table accordingly
function getDNSSDEntries() {
    $.get('/DNSSD/Entries', {}, function (data) {
        data = JSON.parse(data)

        $("tbody tr").remove()

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
                td.appendChild(document.createTextNode(element))
                td.appendChild(document.createElement("br"))
            })
            tr.appendChild(td);

            dnssd_Entries_List.lastElementChild.appendChild(tr);
        })
    })
}