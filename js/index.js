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

function creatingList(data, listID){
    var response = JSON.parse(data.responseText) ;  
    var ul = document.getElementById(listID);
    ul.previousElementSibling.lastElementChild.lastElementChild.innerText = response.length ;    
    for( let i=0;i < response.length;i++){
        var li = document.createElement('li');
        li.classList.add("item");
        li.id = response[i]._id;
        li.innerHTML = '<figure><img src="'+response[i].imageUrl+'"alt=""><figcaption><h3 class="item-name">'+
                    response[i].name+'</h3><button class="item-btn"></button><p class="item-price right bold">'+
                        response[i].price/100+' €</p></figcaption></figure>';
        li.style.animationDelay = 100*i+ 'ms';
        ul.appendChild(li); 

        Promise.all(Array.from(document.images).map(img => {
            if (img.complete) return Promise.resolve(img.naturalHeight !== 0);
            return new Promise(resolve => {
                img.addEventListener('load', () => resolve(true));
                img.addEventListener('error', () => resolve(false));
            });
        })).then(results => {
            if (results.every(res => res) && results.length == response.length){
                console.log('all images loaded successfully');
                setTimeout(function(){
                    fadeOutEffect("#teddies .loader");
                    document.getElementById("teddies").classList.add("showed");},300);
            }
        });
    }
}

window.onload =  function(){ 
    var categories = ["teddies"];
    for (const listID of categories){ 
    requestList(listID)
        .catch( ()  => { 
            window.setTimeout(function(){window.location.replace("error.html")},1000); 
        }) 
        .then( data => { creatingList(data, listID); })
        .catch( () => {console.log('Error : no ul created for this category')})
    }
}

document.querySelector(".expandToggle.clickable").addEventListener("click", function(e) {
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
            }, (btn.parentNode.parentNode.parentNode.lastElementChild.children.length-1)*100+500);
    }
})

document.querySelectorAll(".listItems-content").forEach(item =>{
    item.addEventListener("click", function(e) {
        if(e.target && e.target.nodeName === "BUTTON") {
            location.assign("products.html?id="+e.target.parentNode.parentNode.parentNode.id+"&type="+item.id);
        }
    });
});