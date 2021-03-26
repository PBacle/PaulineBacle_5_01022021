const url = window.location.search; 
const urlParams = new URLSearchParams(url);
if(urlParams.has('ref') && urlParams.has('tot') 
&& urlParams.getAll('ref')[0].length != 0 && urlParams.getAll('tot')[0].length != 0
&& urlParams.get('ref').match(/^[a-z0-9-]+$/)  && urlParams.get('tot').match(/^[0-9]+$/)
){    
    document.getElementById("referenceCommande").innerText = urlParams.get('ref');
    document.getElementById("totalCommande").innerText  = urlParams.get('tot') + ' €';
    document.cookie="cart-teddies='';secure;Path=/;expires="+ new Date(0).toGMTString();
}else{
    document.querySelector("#infosCommande table").hidden = true ;
    var p = document.createElement("p");
    p.classList.add("center");
    p.innerHTML = "Il semblerait qu'une erreur se soit produite.<br> <a href='#' alt='lien vers le formulaire de contact'>Contactez-nous</a> pour obtenir les informations de commande."
    document.querySelector("#infosCommande").appendChild(p);
}        
