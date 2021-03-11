
/* CART COUNTER  */
if( document.cookie.match(/cart-teddies=(.+);*/) ){
    document.getElementById("cart-counter").innerText = JSON.parse(document.cookie.match(/cart-teddies=(.+);*/)[1]).total;
}else{
    document.getElementById("cart-counter").innerText = "0";
}


/* */
function fadeOutEffect(item) {
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
        }
    }, 25);
}

