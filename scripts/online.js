const selector = `[class*="friendsButtonContainer"] * [class*="link"]`;

function clickElement() {
    const el = document.querySelector(selector);
    if (el) {
        el.click();
        console.log("Element clicked at " + new Date().toLocaleTimeString());
    } else {
        console.log("Element not found!");
    }
}

setInterval(clickElement, 240000);

clickElement();
