
/* CART COUNTER  */
if( document.cookie.match(/cart-teddies=(.+);*/) ){
    document.getElementById("cart-counter").innerText = JSON.parse(document.cookie.match(/cart-teddies=(.+);*/)[1]).total;
}else{
    document.getElementById("cart-counter").innerText = "0";
}

/* */
function fadeOutEffect(item) {
    return new Promise((resolve) => {
        var fadeTarget = document.querySelector(item);
        var fadeEffect = setInterval(function () {
            if (!fadeTarget.style.opacity) {
                fadeTarget.style.opacity = 1;
            }
            if (fadeTarget.style.opacity > 0) {
                 fadeTarget.style.opacity -= 0.1;
            } else {
                clearInterval(fadeEffect);
                fadeTarget.classList.add("hidden");
                resolve(true);
            }
        }, 25);
    })
}


function requestItem(typeItem, idItem){
    return new Promise((resolve,reject) => {
        var urlAPI = "http://localhost:3000/api/" + typeItem + "/" + idItem  ;
        let request = new XMLHttpRequest();
        request.open("GET", urlAPI);
        request.onload = () => {
            if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
                resolve(request);
            }else{
                reject();
           }
        }
        request.onerror = () => reject();
        request.send();    
    })
}


function isValid(item,regex){
    if(!item.value.match(regex)){
        item.parentElement.firstElementChild.classList.add("formatError");
        return false ; 
    }else {
        if(item.parentElement.firstElementChild.classList.contains("formatError")){
            item.parentElement.firstElementChild.classList.remove("formatError"); 
        }
        return true;
    }
}
