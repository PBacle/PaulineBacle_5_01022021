var nbItems = updateCartCounter();
if( nbItems != 0 ){
    document.querySelectorAll("section").forEach(item => {item.style.display = "flex"; }) 
    var total = 0 ;
    var orderTable = [];
    for(let i = 0 ; i < localStorage.length ; i++){
        if(/cart-/.test(localStorage.key(i)) ){
            var typeItem = localStorage.key(i).match(/cart-([a-z]+)/i)[1];
            JSON.parse(localStorage[localStorage.key(i)]).elements.forEach( item => {
                orderTable.push(item.id);
                requestItem(typeItem, item.id)
                .then( data => {            
                    if(!document.querySelector(".loader").classList.contains("hidden")){
                        fadeOutEffect(".loader")
                        .then(() => {
                            document.querySelector("table#cart-table").hidden = false;
                            document.querySelector('button[type="submit"]').classList.remove("unclickable");
                        })
                    };
    
                    var response = JSON.parse(data.responseText);
                    var tr = document.createElement('tr');

                    document.querySelector(".item-price").innerText= updatePrice(response.price);
                    document.querySelector(".item-price").id = "price-" + response.price;
        
                    tr.innerHTML = '<td>'+response.name+'</td><td class="nowrap item-price" id="price-'+ response.price +'">'+ updatePrice(response.price)+'</td><td>'
                        +item.count+'</td><td class="nowrap item-price" id="price-'+item.count*response.price+'">'+updatePrice(item.count*response.price)+'</td>';
                    document.querySelector("#cart-table tbody").append(tr);
                    total += item.count*response.price ;
                    document.querySelector("#table-total :last-child").id = "price-" + total ;
                    document.querySelector("#table-total :last-child").innerHTML = updatePrice(total);
                } )               
            })           
            count = +JSON.parse(localStorage[localStorage.key(i)]).total;
        }
    }    
}else{
    document.querySelectorAll("section").forEach(item => {item.style.display = "none"; }) 
    document.querySelectorAll(".emptyMsg").forEach(item => {item.hidden = false; }) 
    document.querySelector("main").classList.add("center");
}

document.querySelector('button[type="submit"]').addEventListener("click", function(e){
    e.preventDefault();
    if( document.querySelector("form").reportValidity() && !e.target.classList.contains("unclickable")){
        let isFirstNameValid = isValid(document.getElementById('firstnameUser'),/^\s*[a-z]+\s*$/i);
        let isLastNameValid = isValid(document.getElementById('nameUser'),/^\s*[a-z]+\s*$/i);
        let isAddressValid =  isValid(document.getElementById('addressUser'),/^\s*[a-z0-9\s]+\s*$/i);
        let isCityValid = isValid(document.getElementById('cityUser'),/^\s*[a-z]+\s*$/i);
        let isEmailValid = isValid(document.getElementById('emailUser'),/^\s*[a-z0-9._-]+@[a-z0-9._-]+.[a-z]{2,}\s*$/i);

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
            
            var typeItem = Object.keys(localStorage)[Object.keys(localStorage).findIndex( x => /cart-/.test(x) )].match(/cart-([a-z]+)/)[1];

            sendOrder(typeItem, order)
            .then( data => {
                localStorage.setItem("orderId",JSON.parse(data.responseText).orderId );
                localStorage.setItem("orderTotal",document.querySelector("#table-total th:last-child").id.match(/[0-9]+/));
                window.location.replace("confirmation.html"); 

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

