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
            li.style.animationDelay = delayItemAppearing*i+ 'ms';
            ul.appendChild(li); 

            var fig = document.createElement('figure');
            li.append(fig);
            var imgFig = document.createElement('img');
            imgFig.src = response[i].imageUrl;
            imgFig.alt = "";
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
                 location.assign("products.html?id="+item.id+"&type="+item.parentNode.id);
            });
            figCap.append(btnItem);
            var pfigCap = document.createElement('p');
            pfigCap.classList.add("item-price","right","bold");
            pfigCap.innerText = response[i].price/delayItemAppearing + ' €';
            figCap.append(pfigCap);

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
            h2Item.classList.add("listItems-name","nav-btn-headband");
            h2Item.innerHTML = title +'<a href="#" data-content="&#xf077;" class="nav-btn right expandToggle showUL clickable"></a>'
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
                    sameRow();
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
        d++;
        if (d < Object.entries(obj).length){
            setTimeout(()=>{doNextList(d,obj);} ,durationAnimation);
        }
    })
}



function sameRow() {
    var liItems = document.querySelectorAll("li.item") ; 
    for( let i=0 ; i < liItems.length -1 ; i++ ){
        if(liItems[i].offsetTop == liItems[i+1].offsetTop){
            liItems[i].classList.add("sameRow");
        }
    }
}

window.onload =  function(){ hideTags();doNextList(0,categories);}
window.addEventListener('resize', function(){ hideTags(); sameRow();} );
