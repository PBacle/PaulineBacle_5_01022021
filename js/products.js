function loadImage(img, urlImg) {
    return new  Promise(resolve => {
        img.addEventListener('load', () => resolve(true));
        img.addEventListener('error', () => resolve(false));
        img.src = urlImg; 
    });
}

const url = window.location.search; 
const urlParams = new URLSearchParams(url);
const typeItem = urlParams.get('type');
if(urlParams.has('id') && urlParams.has('type') && urlParams.getAll('id')[0].length != 0 && urlParams.getAll('type')[0].length != 0){
    requestItem(typeItem, urlParams.get('id'))
    .then( data => {
        var response = JSON.parse(data.responseText);
                  
        loadImage(document.getElementById("item-image"), response.imageUrl)
        .then( () => {
            fadeOutEffect(".loader");
            document.querySelectorAll(".item-name").forEach(item => {item.innerText = response.name ;}) ;
            document.querySelector("#categorie a").innerText = Object.values(categories)[Object.keys(categories).findIndex( x => x === typeItem)];
            document.querySelector("#categorie a").href = "index.html#"+typeItem;
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
    .catch( () => { 
        window.setTimeout(function(){window.location.replace("error.html")},250); 
    })        
}else{
    document.querySelector("#nav-product").hidden = true ;
    document.querySelector(".loader").style.display =  'none' ;
    document.querySelector(".errorDialog").style.display = 'flex';
    document.querySelector("main").classList.add("center");
}

function checkCart() {
    console.log(localStorage);
    return new Promise( (resolve,reject) => {
        if(localStorage.getItem("cart-"+ typeItem)){
            resolve(true);
        }else if(Object.keys(localStorage).map( x => /cart-/.test(x)).includes(true) ){
            var oldType = Object.keys(localStorage)[Object.keys(localStorage).findIndex( x => /cart-/.test(x))].match(/cart-([a-z]+)/)[1] ;
            reject(oldType);
        }else{
            resolve(false);
        }
    })
}

document.querySelector(".btn-deleteCart").addEventListener("click", function(e) {
    e.preventDefault();
    localStorage.removeItem("cart-"+Object.keys(localStorage)[Object.keys(localStorage).findIndex( x => /cart-/.test(x))].match(/cart-([a-z]+)/)[1]
    );
    document.querySelector(".Dialog.existingCart").style.display = "none";
    document.querySelector(".btn-addToCart").click();    
})

document.querySelector(".btn-addToCart").addEventListener("click", function(e) {
    e.preventDefault();
    var form = document.querySelector("form") ;
    form.reportValidity();   
    if(form.checkValidity() ){

        checkCart()
        .then( (data) => {
 
            document.querySelector("#item h1").hidden = true;
            document.querySelector(".recap.Dialog").style.display = 'flex';
            document.querySelector(".recap.Dialog span.item-option").innerText = document.getElementById("item-option").value;
            
            if(data){
                var cartObj = JSON.parse(localStorage.getItem("cart-"+ typeItem));
                var index = cartObj.elements.findIndex( x => x.id === document.getElementById("item-id").value) ;
    
                if( index != -1){
                    cartObj.elements[index]['count']++ ;
                }else{
                    cartObj.elements.push({id: document.getElementById("item-id").value, count:'1'});
                } 
                cartObj.total = ++cartObj.total ;
                localStorage.setItem("cart-"+ typeItem, JSON.stringify(cartObj));  
            }else{
                localStorage.setItem("cart-"+ typeItem, JSON.stringify({total : '1',  
                elements: [{ id : document.getElementById("item-id").value, count: '1',}]} ) );
            }
    
            document.getElementById("cart-counter").classList.add("addOne");    
            updateCartCounter();
        })
        .catch( (oldType) => {
            document.querySelector("#item h1").hidden = true;
            document.querySelector(".item-type--old").innerText = Object.values(categories)[Object.keys(categories).findIndex( x => x === oldType)].toLowerCase() ;
            document.querySelector(".existingCart.Dialog").style.display = 'flex';
        })
    }
 })

 document.querySelectorAll(".btn-close").forEach(item => {
    item.addEventListener("click", function(e){
        e.preventDefault();
        e.target.parentNode.parentNode.style.display = 'none';
        document.querySelector("#item h1").hidden = false;
        if(document.getElementById("cart-counter").classList.contains("addOne") ){
            document.getElementById("cart-counter").classList.remove("addOne")
        }
    })
 })
