function extractProductInfo() {
    let weightElement = document.evaluate("//th[contains(text(), 'Item Weight')]/following-sibling::td", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let dimensionsElement = document.evaluate("//th[contains(text(), 'Product Dimensions')]/following-sibling::td", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (!weightElement || !dimensionsElement) {
        return { error: "Could not find product details." };
    }

    let weight = parseFloat(weightElement.innerText.replace(/[^\d.]/g, "")); // Extract weight in pounds
    let dims = dimensionsElement.innerText.match(/[\d.]+/g).map(Number); // Extract dimensions in inches

    if (dims.length !== 3) {
        return { error: "Could not parse dimensions." };
    }

    let volumeCubicInches = dims[0] * dims[1] * dims[2]; // Volume in cubic inches
    let volumeLiters = volumeCubicInches * 0.0163871; // Convert to liters

    return {
        weight: weight + " lbs",
        volume: volumeLiters.toFixed(2) + " L"
    };
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extract") {
        sendResponse(extractProductInfo());
    }
});
