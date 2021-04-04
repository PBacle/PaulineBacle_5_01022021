/****** REQUESTS API ******/
function requestList(type){
    return new Promise((resolve,reject) => {
        var urlAPI = "http://localhost:3000/api/" + type;
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

/**** PAGE COMPOSITION ****/
function creatingListContent(response, ul){ /* creates li elements in the list ul based on the data contained in response (Object containing items from a given category, obtained from API)  */
    return new Promise((resolve,reject) => {
        if(response.length == 0) reject(); /* nothing will be created */
        for( let i=0;i < response.length;i++){ 
            var li = document.createElement('li');
            li.classList.add("item");
            li.id = response[i]._id;
            li.style.animationDelay = delayItemAppearing*i+ 'ms';
            ul.appendChild(li); 

            var fig = document.createElement('figure');
            li.append(fig);
            var imgFig = document.createElement('img');
            imgFig.src = response[i].imageUrl; imgFig.alt = "";
            fig.append(imgFig);
            var figCap = document.createElement('figcaption');
            fig.append(figCap);
            var h3figCap = document.createElement('h3');
            h3figCap.classList.add("item-name");
            h3figCap.innerText = response[i].name;
            figCap.append(h3figCap);
            var btnItem = document.createElement('button');
            btnItem.classList.add("item-btn");
            btnItem.addEventListener("click", function(e) {
                e.preventDefault();
                var item = e.target.parentNode.parentNode.parentNode ;
                 location.assign("products.html?id="+item.id+"&type="+item.parentNode.id); /* Event to redirect to the page of the product selected by user */
            });
            figCap.append(btnItem);
            var pfigCap = document.createElement('p');
            pfigCap.classList.add("item-price","right","bold");
            pfigCap.innerText = updatePrice(response[i].price) ; /* use the function updatePrice to get the price in the right currency */
            pfigCap.id = "price-" + response[i].price; /* important to allow updating with select */
            figCap.append(pfigCap);

            /* The following promise makes sure that the items appear only when all the images are loaded (avoid ugly effect if the loading is slow) */
            Promise.all(Array.from(Array.from(document.querySelectorAll('#'+ul.id+' img'))).map(img => {
                if (img.complete) return Promise.resolve(img.naturalHeight !== 0);
                return loadImage(img);
            })).then(results => {
                if (results.every(res => res) && results.length == response.length){ /* All the img are correctly loaded */
                    resolve(true);
                }
            });
        } 
    })
}

function createList(arr){ /*for a given category of products : creates a section with a title, information regarding the nb of items and a list of items that are made visible or invisible by clicking on a "expandToggle" btn*/
    var name = arr[0]; /* category of products for the API */
    var title = arr[1]; /* name visible on screen for this category of products */
    return new Promise((resolve,reject) => {
        requestList(name) /* API request to get a JSON containing all products and their infos */
        .catch( ()  => { /* something went wrong with the request */
            window.setTimeout(function(){window.location.replace("error.html")},durationAnimationLong); 
        }) 
        .then( data => { /* data is the JSON obtained from API request */
            var secItems = document.createElement('section');
            secItems.classList.add("listItems",name);
            document.querySelector("main").append(secItems);
            var divLoader = document.createElement('div');
            divLoader.classList.add("loader");
            secItems.append(divLoader);
            var divSpinner = document.createElement('div');
            divSpinner.classList.add("spinner");
            divLoader.append(divSpinner);
            var headerSec = document.createElement('header');
            secItems.append(headerSec);
            var h2Item = document.createElement('h2');
            h2Item.classList.add("listItems-name","nav-btn-headband");
            h2Item.innerHTML = title +'<a href="#" data-content="&#xf077;" class="nav-btn right expandToggle showUL clickable"></a>'
            headerSec.append(h2Item);
            h2Item.children[0].addEventListener("click", function(e) { /* Event that will allow the items of the list to be visible or invisible by clicking on the btn*/
                e.preventDefault();
                var btn = this;
                if(this.classList.contains("showUL")){/* CASE 2 : to make items visible */
                    this.parentNode.parentNode.parentNode.lastElementChild.classList.remove("hidden");
                    this.parentNode.parentNode.parentNode.lastElementChild.classList.add("showed")
                    this.classList.remove("showUL");
                    this.classList.add("hideUL");
                    this.parentNode.parentNode.parentNode.lastElementChild.style.display = "flex";
                    sameRow();
                }else if(this.classList.contains("hideUL")){ /* CASE 2 : to make items invisible */
                    this.parentNode.parentNode.parentNode.lastElementChild.classList.remove("showed");
                    this.parentNode.parentNode.parentNode.lastElementChild.classList.add("hidden");
                    this.classList.remove("hideUL");
                    this.classList.add("showUL");
                    setTimeout( function() { /* Delay is added to allow the animation of items disappearing to be done before the list gets property "display" on "none" */
                        btn.parentNode.parentNode.parentNode.lastElementChild.style.display = "none";
                        }, (btn.parentNode.parentNode.parentNode.lastElementChild.children.length-1)*delayItemAppearing+durationAnimation);
                }
            })

            var pItem = document.createElement('p');
            pItem.classList.add("right");
            pItem.innerHTML = 'Produits disponibles : <span class="items-nb"></span>';
            headerSec.append(pItem);
            var ul = document.createElement('ul');
            ul.classList.add("listItems-content");ul.id = name;ul.style.display = "none";
            secItems.append(ul);

            var response = JSON.parse(data.responseText) ;  
            ul.previousElementSibling.lastElementChild.lastElementChild.innerText = response.length ;                    
            if(response.length > 0){ /* Case 1 : response of API isnt empty */
                creatingListContent(response, ul) /* Step 1 : creates content for the list of items */
                .then(() => { /* when the items of ul are ready */
                    fadeOutEffect('.'+name+' .loader') /* Step 2 : remove the loading spinner */
                    .then(() => { 
                        document.querySelector('.'+name+' .expandToggle.clickable').click(); /* makes the items of ul appear */
                        resolve();
                    });
                })
                .catch( () =>{
                    reject() });
            }else{ /* Case 2 : response of API is empty */
                fadeOutEffeect('.'+name+' .loader').then(()=>{resolve();});                
            } 
         })

    })
}

function doNextList(d,obj) {  /* makes sure that each category of items ("list") is created one after the other */
    createList(Object.entries(obj)[d])
    .then(() => {
        d++;
        if (d < Object.entries(obj).length){
            setTimeout(()=>{doNextList(d,obj);}, durationAnimation); /* small delay is added before creating the next list to make it more "smooth" with the animation of the items in the list */
        }
    })
}
/**************************/


/**** GRAPHICAL ASPECTS ***/
function sameRow() { /* determines if an li.item is positioned at the same vertical level as its next sibling (if yes, it will get a class "sameRow") */
    var liItems = document.querySelectorAll("li.item") ; 
    for( let i=0 ; i < liItems.length -1 ; i++ ){
        if(liItems[i].offsetTop == liItems[i+1].offsetTop){
            liItems[i].classList.add("sameRow");  
        }
    }
}
/**************************/

window.onload =  function(){ updateCartCounter();hideTags();doNextList(0,categories);createCurrencies()}
window.addEventListener('resize', function(){ hideTags(); sameRow();} );
