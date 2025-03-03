//Main script file for my site
//Started on 3/3/2025

// Link Button function
function linkButton(url, target = "_blank") {
    let linkElement = document.createElement("a");
    linkElement.href = url;
    linkElement.target = target; 
    linkElement.rel = "noopener noreferrer";
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
}
