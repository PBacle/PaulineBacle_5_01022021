


window.onload =  function(){
    creatingLists("teddies"); 

/*    setTimeout(function(){
        fadeOutEffect("#teddies .loader");
    }, 500);*/
};

document.querySelector(".expandToggle.clickable").addEventListener("click", function(e) {
    e.preventDefault();
    if(this.classList.contains("showUL")){
        this.parentNode.parentNode.parentNode.lastElementChild.style.display = "flex";
        this.parentNode.parentNode.parentNode.lastElementChild.classList.add("showed")
        this.classList.remove("showUL");
        this.classList.add("hideUL");
    }else if(this.classList.contains("hideUL")){
        this.parentNode.parentNode.parentNode.lastElementChild.style.display = "none";
        this.parentNode.parentNode.parentNode.lastElementChild.classList.add("hidden");
        this.classList.remove("hideUL");
        this.classList.add("showUL");
    }
})

function creatingLists(listID){
    var request = new XMLHttpRequest();
    var ul = document.getElementById(listID);
    var urlAPI = "http://localhost:3000/api/" + listID;

    request.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            var response = JSON.parse(this.responseText);
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
                    if (img.complete)
                        return Promise.resolve(img.naturalHeight !== 0);
                    return new Promise(resolve => {
                        img.addEventListener('load', () => resolve(true));
                        img.addEventListener('error', () => resolve(false));
                    });
                })).then(results => {
                    if (results.every(res => res) && results.length == response.length){
                        console.log('all images loaded successfully');
                        setTimeout(fadeOutEffect("#teddies .loader"),3000);
                    }
                });

            }
        }else{
            ul.previousElementSibling.lastElementChild.lastElementChild.innerText = "0";
        }
    };
    request.open("GET", urlAPI);
    request.send();


}

document.querySelectorAll(".listItems-content").forEach(item =>{
    item.addEventListener("click", function(e) {
        if(e.target && e.target.nodeName === "BUTTON") {
            location.assign("products.html?id="+e.target.parentNode.parentNode.parentNode.id+"&type="+item.id);
        }
    });
});

