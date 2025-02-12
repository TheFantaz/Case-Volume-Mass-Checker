function extractAmazonInfo() {
    let weightElement = document.evaluate("//th[contains(text(), 'Item Weight')]/following-sibling::td", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let dimensionsElement = document.evaluate("//th[contains(text(), 'Product Dimensions')]/following-sibling::td", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (!weightElement || !dimensionsElement) return null;

    let weight = parseFloat(weightElement.innerText.replace(/[^\d.]/g, ""));
    let dims = dimensionsElement.innerText.match(/[\d.]+/g).map(Number);
    
    if (dims.length !== 3) return null;
    
    let volumeLiters = (dims[0] * dims[1] * dims[2]) * 0.0163871;
    return { 
        weight: weight + " lbs", 
        volume: volumeLiters.toFixed(2) + " L",
        dimensions: `${dims[0]} x ${dims[1]} x ${dims[2]} inches`
    };
}

function extractNeweggInfo() {
    let weightElement = document.evaluate("//th[contains(text(), 'Weight')]/following-sibling::td", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let dimensionsElement = document.evaluate("//th[contains(text(), 'Dimensions (H x W x D)')]/following-sibling::td", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (!weightElement || !dimensionsElement) return null;

    let weight = parseFloat(weightElement.innerText.replace(/[^\d.]/g, ""));
    let dims = dimensionsElement.innerText.match(/[\d.]+/g).map(Number);
    
    if (dims.length !== 3) return null;
    
    let volumeLiters = (dims[0] * dims[1] * dims[2]) * 0.0163871;
    return { 
        weight: weight + " lbs", 
        volume: volumeLiters.toFixed(2) + " L",
        dimensions: `${dims[0]} x ${dims[1]} x ${dims[2]} inches`
    };
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

    let displayElements = [];
    if (displayPreferences.showWeight) displayElements.push(`<strong>Weight:</strong> ${data.weight}`);
    if (displayPreferences.showVolume) displayElements.push(`<strong>Volume:</strong> ${data.volume}`);
    if (displayPreferences.showDimensions) displayElements.push(`<strong>Dimensions:</strong> ${data.dimensions}`);

    infoDiv.innerHTML = displayElements.join('<br>');
    
    productTitle.parentNode.insertBefore(infoDiv, productTitle.nextSibling);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateDisplay") {
        displayPreferences = request.preferences;
        let existingInfo = document.getElementById("product-info");
        if (existingInfo) {
            let data = window.location.href.includes("amazon.com") ? 
                extractAmazonInfo() : extractNeweggInfo();
                
            let displayElements = [];
            if (displayPreferences.showWeight) displayElements.push(`<strong>Weight:</strong> ${data.weight}`);
            if (displayPreferences.showVolume) displayElements.push(`<strong>Volume:</strong> ${data.volume}`);
            if (displayPreferences.showDimensions) displayElements.push(`<strong>Dimensions:</strong> ${data.dimensions}`);

            existingInfo.innerHTML = displayElements.join('<br>');
        }
    }
    if (request.action === "extract") {
        let url = window.location.href;
        let data = url.includes("amazon.com") ? extractAmazonInfo() : url.includes("newegg.com") ? extractNeweggInfo() : null;
        sendResponse(data || { error: "Could not extract product info." });
    }
});  // At the start of content.js, modify how displayPreferences is initialized
  let displayPreferences = {
      showWeight: true,
      showDimensions: true,
      showVolume: true
  };

  // Add this function to load preferences before showing the info
  function loadPreferencesAndDisplay() {
      chrome.storage.sync.get(['showWeight', 'showDimensions', 'showVolume'], (result) => {
          displayPreferences = {
              showWeight: result.showWeight !== false,
              showDimensions: result.showDimensions !== false,
              showVolume: result.showVolume !== false
          };
          insertProductInfo();
      });
  }

  // Replace window.onload with this
  window.onload = loadPreferencesAndDisplay;
infoDiv.innerHTML = [
    displayPreferences.showWeight ? `<strong>Weight:</strong> ${data.weight}` : '',
    displayPreferences.showVolume ? `<strong>Volume:</strong> ${data.volume}` : '',
    displayPreferences.showDimensions ? `<strong>Dimensions:</strong> ${data.dimensions}` : ''
].filter(Boolean).join('<br>');

// Add this to your message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateDisplay") {
        displayPreferences = request.preferences;
        // Refresh the display
        let existingInfo = document.getElementById("product-info");
        if (existingInfo) existingInfo.remove();
        insertProductInfo();
    }
    // ... existing message handling code
});
