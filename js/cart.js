if( document.cookie.match(/cart-teddies=(.+);*/) ){
    var nbItems = JSON.parse(document.cookie.match(/cart-teddies=(.+);*/)[1]).total; 
}

if( typeof nbItems !== 'undefined' && nbItems != 0 ){
    var orderTable = JSON.parse(document.cookie.match(/cart-teddies=(.+);*/)[1]).elements.map(key => key.id);
    var total = 0 ;
    document.querySelectorAll("section").forEach(item => {item.style.display = "flex"; }) 
    JSON.parse(document.cookie.match(/cart-teddies=(.+);*/)[1]).elements.forEach(item => {

        requestItem("teddies", item.id)
        .then( data => {            
            if(!document.querySelector(".loader").classList.contains("hidden")){
                fadeOutEffect(".loader")
                .then(() => {document.querySelector("table#cart-table").hidden = false;})
            };

            var response = JSON.parse(data.responseText);
            var tr = document.createElement('tr');
            tr.innerHTML = '<td>'+response.name+'</td><td>'+response.price/100+' €</td><td>'
                +item.count+'</td><td>'+item.count*response.price/100+' €</td>';
            document.querySelector("#table-total").parentNode.insertBefore(tr, document.querySelector("#table-total")); 
            total += item.count*response.price/100 ;
            document.querySelector("#table-total td:last-child").innerHTML = total + " €";
        } )               
    }) ;
}else{
    document.querySelectorAll("section").forEach(item => {item.style.display = "none"; }) 
    document.querySelectorAll(".emptyMsg").forEach(item => {item.hidden = false; }) 
    document.querySelector("main").classList.add("center");
}

document.querySelector('button[type="submit"]').addEventListener("click", function(e){
    e.preventDefault();
    if( document.querySelector("form").reportValidity() ){
        /*var isValidCheck = true ;
         document.querySelectorAll('input[type="text"]:not(#addressUser)').forEach(item => {
            isValid = isValid(item,/^\s*[a-z]+\s*$/i);
        }); */
        let isFirstNameValid = isValid(document.getElementById('firstnameUser'),/^\s*[a-z]+\s*$/i);
        let isLastNameValid = isValid(document.getElementById('nameUser'),/^\s*[a-z]+\s*$/i);
        let isAddressValid =  isValid(document.getElementById('addressUser'),/^\s*[a-z0-9\s]+\s*$/i);
        let isCityValid = isValid(document.getElementById('cityUser'),/^\s*[a-z]+\s*$/i);
        let isEmailValid = isValid(document.getElementById('emailUser'),/^\s*[a-z0-9._-]+@[a-z0-9._-]+.[a-z]{2,}\s*$/i);

        /* isValid(document.getElementById('addressUser'),/^\s*[a-z0-9\s]+\s*$/i,isValidCheck);
        isValid(document.getElementById('emailUser'),/^\s*[a-z0-9._-]+@[a-z0-9._-]+.[a-z]{2,}\s*$/i,isValidCheck); */

        if(isEmailValid && isFirstNameValid && isLastNameValid && isCityValid && isAddressValid){
            var order = {
                contact : {
                    firstName: document.getElementById('firstnameUser').value,
                    lastName: document.getElementById('nameUser').value,
                    address:document.getElementById('addressUser').value,
                    city: document.getElementById('cityUser').value,
                    email: document.getElementById('emailUser').value        
                },
                products : orderTable
            }
            
            sendOrder("teddies", order)
            .then( data => {
                var form = document.createElement('form') ;
                form.action = "confirmation.html" ; 
                form.method = "get" ; 
                form.style.display = "none";
                form.innerHTML =  '<input type="text" name="ref" value="' + JSON.parse(data.responseText).orderId + '" /><input type="text" name="tot" value="' 
                + document.querySelector("#table-total td:last-child").innerHTML.match(/([0-9]+)\s*€/)[1] + '" />' ;
                document.body.append(form);
                document.cookie = "cart-teddies=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ";
                form.submit();
            } )
            .catch( data => {
                window.setTimeout(function(){window.location.replace("error.html")},250); 
            })            
        };
    }   
})

function sendOrder(typeItem, order){
    return new Promise((resolve,reject) => {
        var urlAPI = "http://localhost:3000/api/" + typeItem + "/order"   ;
        let request = new XMLHttpRequest();
        request.open("POST", urlAPI);
        request.setRequestHeader("Content-Type","application/json");
        request.send(JSON.stringify(order),'./confirmation.html');
        request.onload = () => {
            if (request.readyState == XMLHttpRequest.DONE && request.status == 201) {
                resolve(request);
            }else{
                reject();
           }
        }
        request.onerror = () => reject();
    })
}

