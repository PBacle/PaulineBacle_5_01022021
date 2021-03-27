function requestList(listID){
    return new Promise((resolve,reject) => {
        var urlAPI = "http://localhost:3000/api/" + listID;
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

function creatingListContent(response, ul){
    return new Promise((resolve) => {
        for( let i=0;i < response.length;i++){
            var li = document.createElement('li');
            li.classList.add("item");
            li.id = response[i]._id;
            li.innerHTML = '<figure><img src="'+response[i].imageUrl+'"alt=""><figcaption><h3 class="item-name">'+
                        response[i].name+'</h3><button class="item-btn"></button><p class="item-price right bold">'+
                            response[i].price/delayItemAppearing+' €</p></figcaption></figure>';
            li.style.animationDelay = delayItemAppearing*i+ 'ms';
            ul.appendChild(li); 
            
            Promise.all(Array.from(Array.from(document.querySelectorAll('#'+ul.id+' img'))).map(img => {
                if (img.complete) return Promise.resolve(img.naturalHeight !== 0);
                return new Promise(resolve => {
                    img.addEventListener('load', () => resolve(true));
                    img.addEventListener('error', () => resolve(false));
                });
            })).then(results => {
                if (results.every(res => res) && results.length == response.length){
                    console.log('all images loaded successfully');
                    resolve(true);
                }
            });
        } 
    })
}


function createList(arr){
    var name = arr[0];
    var title = arr[1];
    return new Promise((resolve,reject) => {
        requestList(name)
        .catch( ()  => {
            window.setTimeout(function(){window.location.replace("error.html")},durationAnimationLong); 
        }) 
        .then( data => { 
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
            h2Item.classList.add("listItems-name","nav-btn");
            h2Item.innerHTML = title +'<a href="#" data="&#xf077" class="right expandToggle showUL clickable"></a>'
            headerSec.append(h2Item);
            h2Item.children[0].addEventListener("click", function(e) {
                e.preventDefault();
                var btn = this;
                if(this.classList.contains("showUL")){
                    this.parentNode.parentNode.parentNode.lastElementChild.classList.remove("hidden");
                    this.parentNode.parentNode.parentNode.lastElementChild.classList.add("showed")
                    this.classList.remove("showUL");
                    this.classList.add("hideUL");
                    this.parentNode.parentNode.parentNode.lastElementChild.style.display = "flex";
                }else if(this.classList.contains("hideUL")){
                    this.parentNode.parentNode.parentNode.lastElementChild.classList.remove("showed");
                    this.parentNode.parentNode.parentNode.lastElementChild.classList.add("hidden");
                    this.classList.remove("hideUL");
                    this.classList.add("showUL");
                    setTimeout( function() {
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
            if(response.length > 0){
                creatingListContent(response, ul)
                .then(() => {
                    fadeOutEffect('.'+name+' .loader')
                    .then(() => {
                        document.querySelector('.'+name+' .expandToggle.clickable').click();
                        resolve();
                    });
                })
                .catch( () =>{ reject() });
            }else{
                fadeOutEffect('.'+name+' .loader').then(()=>{resolve();});                
            } 
         })

    })
}


const doNextList = (d,obj) => {  
    createList(Object.entries(obj)[d])
    .then(() => {
        console.log(Object.entries(obj)[d]);
        console.log("One done ("+d+"/"+Object.entries(obj).length+")!")
        d++;
        if (d < Object.entries(obj).length){
            /*console.log("One more to do ("+d+"/"+Object.entries(obj).length+")in 3...2...1... ")
            setTimeout(()=>{console.log('NOW');*/
            doNextList(d,obj); /*},durationAnimationLong);*/
        }else{
            console.log(`Done completely.`);                
        }
    })
}

window.onload =  function(){ doNextList(0,categories); }

document.querySelectorAll(".listItems-content").forEach(item =>{
    item.addEventListener("click", function(e) {
        if(e.target && e.target.nodeName === "BUTTON") {
            location.assign("products.html?id="+e.target.parentNode.parentNode.parentNode.id+"&type="+item.id);
        }
    });
});
