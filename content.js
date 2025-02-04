function extractAmazonInfo() {
    let weightElement = document.evaluate("//th[contains(text(), 'Item Weight')]/following-sibling::td", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let dimensionsElement = document.evaluate("//th[contains(text(), 'Product Dimensions')]/following-sibling::td", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (!weightElement || !dimensionsElement) return null;

    let weight = parseFloat(weightElement.innerText.replace(/[^\d.]/g, ""));
    let dims = dimensionsElement.innerText.match(/[\d.]+/g).map(Number);
    
    if (dims.length !== 3) return null;
    
    let volumeLiters = (dims[0] * dims[1] * dims[2]) * 0.0163871;
    return { weight: weight + " lbs", volume: volumeLiters.toFixed(2) + " L" };
}

function extractNeweggInfo() {
    let weightElement = document.evaluate("//th[contains(text(), 'Weight')]/following-sibling::td", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let dimensionsElement = document.evaluate("//th[contains(text(), 'Dimensions (H x W x D)')]/following-sibling::td", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (!weightElement || !dimensionsElement) return null;

    let weight = parseFloat(weightElement.innerText.replace(/[^\d.]/g, ""));
    let dims = dimensionsElement.innerText.match(/[\d.]+/g).map(Number);
    
    if (dims.length !== 3) return null;
    
    let volumeLiters = (dims[0] * dims[1] * dims[2]) * 0.0163871;
    return { weight: weight + " lbs", volume: volumeLiters.toFixed(2) + " L" };
}

function insertProductInfo() {
    let url = window.location.href;
    let productTitle;

    let data = url.includes("amazon.com") ? extractAmazonInfo() : url.includes("newegg.com") ? extractNeweggInfo() : null;

    if (!data) return;

    if (url.includes("amazon.com")) {
        productTitle = document.getElementById("productTitle");
    } else if (url.includes("newegg.com")) {
        productTitle = document.querySelector(".product-title");
    }

    if (!productTitle) return;

    let existingInfo = document.getElementById("product-info");
    if (existingInfo) return; // Prevent duplicates

    let infoDiv = document.createElement("div");
    infoDiv.id = "product-info";
    infoDiv.style.padding = "10px";
    infoDiv.style.marginTop = "10px";
    infoDiv.style.border = "2px solid #ff9900";
    infoDiv.style.backgroundColor = "#fff7e6";
    infoDiv.style.fontSize = "16px";
    infoDiv.innerHTML = `<strong>Weight:</strong> ${data.weight} <br> <strong>Volume:</strong> ${data.volume}`;
    
    productTitle.parentNode.insertBefore(infoDiv, productTitle.nextSibling);
}

// Run on page load
window.onload = insertProductInfo;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extract") {
        let url = window.location.href;
        let data = url.includes("amazon.com") ? extractAmazonInfo() : url.includes("newegg.com") ? extractNeweggInfo() : null;
        sendResponse(data || { error: "Could not extract product info." });
    }
});
