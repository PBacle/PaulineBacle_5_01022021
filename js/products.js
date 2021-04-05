/******** TOOLS ********/
function checkCart(typeItem) { /* checks if a cart for this type of items already exists in localStorage or not   */
    return new Promise( (resolve,reject) => {
        if(localStorage.getItem("cart-"+ typeItem)){
            resolve(true); /*  a cart for this type of items already exists  */
        }else if(Object.keys(localStorage).map( x => /cart-/.test(x)).includes(true) ){
            var oldType = Object.keys(localStorage)[Object.keys(localStorage).findIndex( x => /cart-/.test(x))].match(/cart-([a-z]+)/)[1] ;
            reject(oldType); /*  a cart for another type of items already exists */
        }else{
            resolve(false); /* no cart exists */
        }
    })
}
/**************************/

/**** PAGE COMPOSITION ****/
const urlParams = new URLSearchParams(window.location.search);
const typeItem = urlParams.get('type');
if(urlParams.has('id') && urlParams.has('type')  /* at least 1 type and 1 id */
&& urlParams.getAll('id').length == 1 && urlParams.getAll('type').length == 1 /* only 1 type and 1 id */
&& urlParams.getAll('id')[0].length != 0 && urlParams.getAll('type')[0].length != 0){ /* id and type are not null */
    requestItem(typeItem, urlParams.get('id')) 
    .then( data => { /* Item found by API request */
        var response = JSON.parse(data.responseText);
                  
        document.getElementById("item-image").src = response.imageUrl;
        loadImage(document.getElementById("item-image"))
        .then( () => { /* once image is loaded, page is displayed */
            fadeOutEffect(".loader");
            /*Secondary nav bar updated as follow :  */
            document.querySelector("#categorie a").innerText = Object.values(categories)[Object.keys(categories).findIndex( x => x === typeItem)];
            document.querySelector("#categorie a").href = "index.html#"+typeItem;
            /* Item infos updated as follow : */
            document.querySelectorAll(".item-name").forEach(item => {item.innerText = response.name ;}) ;
            document.getElementById("item-description").innerText= response.description;
            document.querySelector(".item-price").innerText= updatePrice(response.price);
            document.querySelector(".item-price").id = "price-" + response.price;
            document.getElementById("item-id").value= response._id;
            const isOption = (element) => Array.isArray(element[1]) === true;
            const index = Object.entries(response).findIndex(isOption) ;                            
            var selectList = document.getElementById("item-option");
            for(let i = 0 ; i < Object.entries(response)[index][1].length ; i++){
                var option = document.createElement('option');
                option.value = Object.entries(response)[index][1][i];
                option.innerText = Object.entries(response)[index][1][i];
                selectList.append(option);
            }
            document.querySelector("#item").style.display = "flex";            
        })
    })
    .catch( () => { /* Nothing found by API request */
        window.setTimeout(function(){window.location.replace("error.html")},250); 
    })        
}else{ /* Issue in the url : the id and/or the type of the item is missing or multiples */
    document.querySelector("#nav-product").hidden = true ;
    document.querySelector(".loader").style.display =  'none' ;
    document.querySelector(".errorDialog").style.display = 'flex';
    document.querySelector("main").classList.add("center");
}
/**************************/

/******** BUTTONS  ********/
document.querySelector(".btn-deleteCart").addEventListener("click", function(e) { /* Replace current cart in localStorage by new one */
    e.preventDefault();
    localStorage.removeItem("cart-"+Object.keys(localStorage)[Object.keys(localStorage).findIndex( x => /cart-/.test(x))].match(/cart-([a-z]+)/)[1] );
    document.querySelector(".Dialog.existingCart").style.display = "none"; /* Removing dialog panel for warning of previous existing cart */
    document.querySelector(".btn-addToCart").click();    /* New cart is created */
})

document.querySelector(".btn-addToCart").addEventListener("click", function(e) { /* Add the item in the cart */
    e.preventDefault();
    var form = document.querySelector("form") ;
    form.reportValidity();   
    if(form.checkValidity() ){ /* makes sure that an option is selected */

        checkCart(typeItem) 
        .then( (data) => {
 
            document.querySelector("#item h1").hidden = true;
            document.querySelector(".recap.Dialog").style.display = 'flex';
            document.querySelector(".recap.Dialog span.item-option").innerText = document.getElementById("item-option").value;
            
            if(data){ /* updating the cart already existing */
                var cartObj = JSON.parse(localStorage.getItem("cart-"+ typeItem));
                var index = cartObj.elements.findIndex( x => x.id === document.getElementById("item-id").value) ;
    
                if( index != -1){
                    cartObj.elements[index]['count']++ ;
                }else{
                    cartObj.elements.push({id: document.getElementById("item-id").value, count:'1'});
                } 
                cartObj.total = ++cartObj.total ;
                localStorage.setItem("cart-"+ typeItem, JSON.stringify(cartObj));  
            }else{ /* creating a cart */
                localStorage.setItem("cart-"+ typeItem, JSON.stringify({total : '1',  
                elements: [{ id : document.getElementById("item-id").value, count: '1',}]} ) );
            }
            document.getElementById("cart-counter").classList.add("addOne"); /* creates an animation on the cart counter */
            updateCartCounter(); /* update the cart counter */
        })
        .catch( (oldType) => { /* another cart already exists */
            document.querySelector("#item h1").hidden = true; 
            document.querySelector(".item-type--old").innerText = Object.values(categories)[Object.keys(categories).findIndex( x => x === oldType)].toLowerCase() ;
            document.querySelector(".existingCart.Dialog").style.display = 'flex';
        })
    }
 })

 document.querySelectorAll(".btn-close").forEach(item => { /* close any dialog panel on which this button is */
    item.addEventListener("click", function(e){
        e.preventDefault();
        e.target.parentNode.parentNode.style.display = 'none';
        document.querySelector("#item h1").hidden = false;
        if(document.getElementById("cart-counter").classList.contains("addOne") ){ /* if an item just got added in the cart, this class should be removed to allow for the animation if another one is added */
            document.getElementById("cart-counter").classList.remove("addOne")
        }
    })
 })
/**************************/
