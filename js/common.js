/******* VARIABLES *******/
var delayItemAppearing = 100; var durationAnimation = 500; var durationAnimationLong = 1000;

var categories = {
    teddies: 'Ours en peluche faits main',
    cameras: 'Caméras vintages',
    furniture: 'Meubles en chêne'
};

var currencies = {
    eur: { rate:1, symbol:"€"},
    usd: { rate:1.18, symbol:"$"},
    gpb: { rate:0.85, symbol:"£"},
}
/**************************/

/****** CART COUNTER ******/
function updateCartCounter(){ /* Calculates nb of items in cart from localStorage and updates the cart counter */
    if(localStorage.length != 0){
        var count = 0 ; 
        for(let i = 0 ; i < localStorage.length ; i++){ /* searching in all localStorage */
            if(/cart-/.test(localStorage.key(i)) ) /* makes sure to only count the [key, value] pair related to cart in localStorage */
            count = parseInt(count) + parseInt(JSON.parse(localStorage[localStorage.key(i)]).total);
        }
        document.getElementById("cart-counter").innerText = count;
        return count;    
    }else{
        document.getElementById("cart-counter").innerText = "0";
        return "0";    
    }    
}
/**************************/

/****** REQUESTS API ******/
function requestItem(typeItem, idItem){ /* typeItem should be a key from the array categories, idItem is the id of an item from this category  */
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
/**************************/

/******* CURRENCIES *******/
function createCurrencies(){ /* Creates a list of options for different currencies available in above array */
    if(Object.entries(currencies).length != 0){
        for(let i=0 ; i < Object.entries(currencies).length; i++){
            var option = document.createElement('option');
            option.value = Object.keys(currencies)[i];
            option.innerText = Object.keys(currencies)[i].toUpperCase() + " (" + Object.values(currencies)[i].symbol + ")";
            if(!Object.keys(localStorage).includes("currency")){
                if( Object.values(currencies)[i].rate == 1 ) { /* euro is the default currency if none is already saved in localStorage */
                    option.selected = "selected" ; 
                     localStorage.setItem("currency",Object.keys(currencies)[i]);
                    }; 
            }else if(Object.keys(currencies)[i] == localStorage.getItem("currency")){
                option.selected = "selected" ; 
            }
            document.querySelector("select#devise-option").append(option);
        }
    }else{
        console.log("error"); /* What to do if no currency is defined in the array ?*/
    }
}

function updatePrice(price){ /* Calculates the price with the rate (compared to eur) of the currency saved in localStorage (current) */
    var currency = localStorage.getItem("currency");
    var rate = Object.values(currencies)[Object.keys(currencies).findIndex( x => x == currency)].rate ; 
    var symbol = Object.values(currencies)[Object.keys(currencies).findIndex( x => x == currency)].symbol;
    return price/100*rate + " " + symbol ; /* TO FIX => SHOULD LIMIT THE NB OF DECIMALS */
}

document.querySelector("#devise-option").addEventListener('change', function(e){ /* Event that register any change of current currency*/
    localStorage.setItem("currency",e.target.children[e.target.selectedIndex].value);
    document.querySelectorAll(".item-price").forEach(item => { /* Change all prices displayed with updated rate of current currency*/
        item.innerText = updatePrice(item.id.match(/[0-9]+/)[0]); /* The id of each price element should contains the price given by the API*/
    })
})
/**************************/

/**** GRAPHICAL ASPECTS ***/
function hideTags() { /* Makes the unused navigation tabs appear and disappear based on the width of the screen*/
    var widthNav = document.querySelector("body > header > nav").offsetWidth ;
    var Tags = document.querySelectorAll("body > header > nav ul > li:not(.last-tab)  li  ") ; 
    var limVis=-1;
    /* The active tab is always visible + the tab at the right end ("More")*/
    sum = document.querySelector("body > header >  nav ul > li.last-tab  ").scrollWidth 
    +  document.querySelector("body > header >  nav ul > li:not(.last-tab)  li.active    ").scrollWidth;  

    while( sum < widthNav  && limVis < Tags.length -1){ 
        limVis++ ;
        if(!Tags[limVis].classList.contains("active") ){ /* Already counted above */
            sum +=  Tags[limVis].scrollWidth;  /* limVis is the index of the first tab that wont fit in the width */
        }
    }

    if(limVis == Tags.length-1 && sum < widthNav ){ /* Case 1 : all tags are visible */
        document.querySelectorAll("body > header > nav ul > li:not(.last-tab)  li").forEach( item => {
            if(item.classList.contains("hidden")) item.classList.remove("hidden") ;
        })      
    }else{ /* Case 2 : tags are visible from 0 to limVis-1*/
        for( let i = 0; i < limVis ; i++){ if(Tags[i].classList.contains("hidden")) Tags[i].classList.remove("hidden") ; }
        for( let i = limVis; i < Tags.length ; i++){ if(!Tags[i].classList.contains("hidden") && !Tags[i].classList.contains("active")) Tags[i].classList.add("hidden"); }
    }
}

function fadeOutEffect(item) { /* Makes item fade out (usud mainly for the loading spinners) */
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

function loadImage(img) { /* will be used to make sure images are loaded before anything is shown on the screen */
    return new  Promise(resolve => {
        img.addEventListener('load', () => resolve(true));
        img.addEventListener('error', () => resolve(false));
    });
}
/**************************/

window.onload =  function(){ hideTags();updateCartCounter();createCurrencies() }
window.addEventListener('resize', hideTags);