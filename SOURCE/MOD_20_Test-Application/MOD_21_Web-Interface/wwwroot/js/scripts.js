$.get('/DNSSD/Entries', {}, function(data) {
    data = JSON.parse(data)
    console.log(data)
    data.forEach(element => {
        console.log(element.answers)
        element.answers.forEach(answer => {
            if (answer.type == 'SRV')
            {                
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(answer.name));
                dnssd_Entries_List.appendChild(li);
            }
        })
    })
})