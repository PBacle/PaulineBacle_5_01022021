/* VARIABLES */
var delayItemAppearing = 100; 
var durationAnimation = 500;
var durationAnimationLong = 1000;

var categories = {
    teddies: 'Ours en peluche faits main',
    cameras: 'Caméras vintages',
    furniture: 'Meubles en chêne'
};

var currencies = {
    eur: {
        rate:1,
        symbol:"€"},
    usd: {
        rate:1.18,
        symbol:"$"},
    gpb: {
        rate:0.85,
        symbol:"£"},
}


function createCurrencies(){
    if(Object.entries(currencies).length != 0){
        for(let i=0 ; i < Object.entries(currencies).length; i++){
            var option = document.createElement('option');
            option.value = Object.keys(currencies)[i];
            option.innerText = Object.keys(currencies)[i].toUpperCase() + " (" + Object.values(currencies)[i].symbol + ")";
/*            option.id = Object.keys(currencies)[i] + '-' + Object.values(currencies)[i].rate ;*/
            if(!Object.keys(localStorage).includes("currency")){
                if( Object.values(currencies)[i].rate == 1 ) {
                    option.selected = "selected" ; option.id = "selected";
                     localStorage.setItem("currency",Object.keys(currencies)[i]);
                    }; 
            }else if(Object.keys(currencies)[i] == localStorage.getItem("currency")){
                option.selected = "selected" ; option.id = "selected";
            }
            document.querySelector("select#devise-option").append(option);
        }
    }else{
        console.log("error");
    }
}

function updatePrice(price){
    var currency = localStorage.getItem("currency");
    var rate = Object.values(currencies)[Object.keys(currencies).findIndex( x => x == currency)].rate ; 
    var symbol = Object.values(currencies)[Object.keys(currencies).findIndex( x => x == currency)].symbol;
    return price/100*rate + " " + symbol ;
}

document.querySelector("#devise-option").addEventListener('change', function(e){
    document.querySelector('#devise-option option#selected').removeAttribute("id");
    e.target.children[e.target.selectedIndex].id = "selected";
    localStorage.setItem("currency",e.target.children[e.target.selectedIndex].value);
    document.querySelectorAll(".item-price").forEach(item => {
        item.innerText = updatePrice(item.id.match(/[0-9]+/)[0]);
    })
})

/* CART COUNTER  */
function updateCartCounter(){
    if(localStorage.length != 0){
        var count = 0 ; 
        for(let i = 0 ; i < localStorage.length ; i++){
            if(/cart-/.test(localStorage.key(i)) ) count = parseInt(count) + parseInt(JSON.parse(localStorage[localStorage.key(i)]).total);
        }
        document.getElementById("cart-counter").innerText = count;
        return count;    
    }else{
        document.getElementById("cart-counter").innerText = "0";
        return "0";    
    }    
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

function hideTags() {
    var widthNav = document.querySelector("body > header > nav").offsetWidth ;
    var Tags = document.querySelectorAll("body > header > nav ul > li:not(.last-tab)  li  ") ; 
    limVis=0;
    sum = document.querySelector("body > header >  nav ul > li.last-tab  ").scrollWidth +  Tags[limVis].scrollWidth;

    while( sum < widthNav  && limVis < Tags.length -1){ limVis++ ; sum +=  Tags[limVis].scrollWidth; }
    
    if(limVis == Tags.length-1 && sum < widthNav ){
        document.querySelectorAll("body > header > nav ul > li:not(.last-tab)  li").forEach( item => {
            if(item.classList.contains("hidden")) item.classList.remove("hidden") ;
        })      
    }else{
        for( let i = 0; i < limVis ; i++){ if(Tags[i].classList.contains("hidden")) Tags[i].classList.remove("hidden") ; }
        for( let i = limVis; i < Tags.length ; i++){ if(!Tags[i].classList.contains("hidden")) Tags[i].classList.add("hidden"); }
    }
}

window.onload =  function(){ hideTags();updateCartCounter();createCurrencies() }
window.addEventListener('resize', hideTags);