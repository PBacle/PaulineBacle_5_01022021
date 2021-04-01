if(Object.keys(localStorage).includes("orderId") && Object.keys(localStorage).includes("orderTotal")
&& localStorage.getItem("orderId").length != 0  
&& localStorage.getItem("orderTotal").length != 0 
){    
    document.getElementById("referenceCommande").innerText = localStorage.getItem("orderId") ;
    document.getElementById("totalCommande").innerText  = localStorage.getItem("orderTotal") + ' €';
    Object.keys(localStorage).forEach( x => { if(/cart-/.test(x)){ localStorage.removeItem(x); } });
    localStorage.removeItem("orderId");
    localStorage.removeItem("orderTotal");
}else{

    document.querySelector("#infosCommande").hidden = true ;
    document.querySelector("main h1").innerHTML = "Une erreur s'est produite."
    document.querySelector("main p").innerHTML = "<a href='#' alt='lien vers le formulaire de contact'>Contactez-nous</a> si le problème persiste."
}        
