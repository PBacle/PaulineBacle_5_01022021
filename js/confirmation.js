const url = window.location.search; 
const urlParams = new URLSearchParams(url);
if(urlParams.has('ref') && urlParams.has('tot') 
&& urlParams.getAll('ref')[0].length != 0 && urlParams.getAll('tot')[0].length != 0
&& urlParams.get('ref').match(/^[a-z0-9-]+$/)  && urlParams.get('tot').match(/^[0-9]+$/)
){    
    document.getElementById("referenceCommande").innerText = urlParams.get('ref');
    document.getElementById("totalCommande").innerText  = urlParams.get('tot') + ' €';
/*    localStorage.clear();*/
    Object.keys(localStorage).forEach( x => { if(/cart-/.test(x)){ localStorage.removeItem(x); } });
}else{

    document.querySelector("#infosCommande").hidden = true ;
    document.querySelector("main h1").innerHTML = "Une erreur s'est produite."
    document.querySelector("main p").innerHTML = "<a href='#' alt='lien vers le formulaire de contact'>Contactez-nous</a> si le problème persiste."
}        
