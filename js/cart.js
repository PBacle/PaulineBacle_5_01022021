/********* TOOLS **********/
function isValid(item,regex){ /*check if the value of an item (should be used for input for examples) matches with the regex*/
    if(!item.value.match(regex)){
        item.parentElement.firstElementChild.classList.add("formatError"); /* allows for error msg to be added below item */
        return false ; 
    }else {
        if(item.parentElement.firstElementChild.classList.contains("formatError")){ /* if a error msg existed for this item, it should be removed now it's ok */
            item.parentElement.firstElementChild.classList.remove("formatError"); 
        }
        return true;
    }
}
/**************************/

/**** PAGE COMPOSITION ****/
var nbItems = updateCartCounter(); 
if( nbItems != 0 ){ /* CASE 1 : cart is not empty */
    document.querySelectorAll("section").forEach(item => {item.style.display = "flex"; }) 
    var total = 0 ;
    var orderTable = []; /* this array will contain all id of items in cart  */
    for(let i = 0 ; i < localStorage.length ; i++){
        console.log(i, localStorage.key(i), nbItems);

        if(/cart-/.test(localStorage.key(i)) ){ /* only reading entries in localStorage that relates to the cart  */
            var typeItem = localStorage.key(i).match(/cart-([a-z]+)/i)[1];
            JSON.parse(localStorage[localStorage.key(i)]).elements.forEach( item => {
                orderTable.push(item.id);
                requestItem(typeItem, item.id)
                .then( data => {            
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
                    /* Dont forget about id of all price related elements, needed for updating when selecting another currency */
    
                    if(i == JSON.parse(localStorage[localStorage.key(i)]).elements.length - 1){ /* When infos of the last item of the cart has been added tothe table*/
                        fadeOutEffect(".loader") /* the loader should disappear */
                        .then(() => {
                            document.querySelector("table#cart-table").hidden = false; /* Table should be made visible */
                            document.querySelector('button[type="submit"]').classList.remove("unclickable"); /* submit button should be made clickable*/
                        })
                    };


                }    )               
            })           
        }else if(i == localStorage.length - 1){ /* When infos of the last item of the cart has been added tothe table*/
            fadeOutEffect(".loader") /* the loader should disappear */
            .then(() => {
                document.querySelector("table#cart-table").hidden = false; /* Table should be made visible */
                document.querySelector('button[type="submit"]').classList.remove("unclickable"); /* submit button should be made clickable*/
            })
        }
    }    
}else{ /* CASE 2 : cart empty, error message displayed */
    document.querySelectorAll("section").forEach(item => {item.style.display = "none"; }) 
    document.querySelectorAll(".emptyMsg").forEach(item => {item.hidden = false; }) 
    document.querySelector("main").classList.add("center");
}
/**************************/

/****** REQUESTS API ******/
document.querySelector('button[type="submit"]').addEventListener("click", function(e){ /* Event to send order */
    e.preventDefault();
    /* btn should not have class "unclickable" */
    if( !e.target.classList.contains("unclickable") &&   document.querySelector("form").reportValidity() && !e.target.classList.contains("unclickable")){ /* first checking if all required inputs are filled and submit button is avalaible  */
        /* Checking all inputs */
        let isFirstNameValid = isValid(document.getElementById('firstnameUser'),/^\s*[a-z]+\s*$/i);
        let isLastNameValid = isValid(document.getElementById('nameUser'),/^\s*[a-z]+\s*$/i);
        let isAddressValid =  isValid(document.getElementById('addressUser'),/^\s*[a-z0-9\s']+\s*$/i);
        let isCityValid = isValid(document.getElementById('cityUser'),/^\s*[a-z]+\s*$/i);
        let isEmailValid = isValid(document.getElementById('emailUser'),/^\s*[a-z0-9._-]+@[a-z0-9._-]+.[a-z]{2,}\s*$/i);

        if(isEmailValid && isFirstNameValid && isLastNameValid && isCityValid && isAddressValid){
            var order = { /* creating JSON containing infos of the customer */
                contact : {
                    firstName: document.getElementById('firstnameUser').value,
                    lastName: document.getElementById('nameUser').value,
                    address:document.getElementById('addressUser').value,
                    city: document.getElementById('cityUser').value,
                    email: document.getElementById('emailUser').value        
                },
                products : orderTable /* contains id of all items that were ordered */
            }
            
            var typeItem = Object.keys(localStorage)[Object.keys(localStorage).findIndex( x => /cart-/.test(x) )].match(/cart-([a-z]+)/)[1];
            /* typeItem is needed to send request to the right API */
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
/**************************/
