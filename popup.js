document.getElementById("extract").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
            document.getElementById("result").innerText = "Error: No active tab found.";
            return;
        }

        chrome.tabs.sendMessage(tabs[0].id, { action: "extract" }, (response) => {
            let resultDiv = document.getElementById("result");

            if (chrome.runtime.lastError) {
                resultDiv.innerText = "Error: Could not communicate with content script.";
                return;
            }

            if (response && !response.error) {
                resultDiv.innerHTML = `<strong>Weight:</strong> ${response.weight} <br> <strong>Volume:</strong> ${response.volume}`;
            } else {
                resultDiv.innerText = "Error: " + (response?.error || "Unknown error");
            }
        });
    });
});


function extractProductInfoFromPage() {
    let weightElement = [...document.querySelectorAll("th")].find(el => el.innerText.includes("Item Weight"));
    let dimensionsElement = [...document.querySelectorAll("th")].find(el => el.innerText.includes("Product Dimensions"));

    if (!weightElement || !dimensionsElement) {
        return { error: "Could not find product details." };
    }

    let weightText = weightElement.nextElementSibling?.innerText;
    let dimensionsText = dimensionsElement.nextElementSibling?.innerText;

    let weight = parseFloat(weightText.replace(/[^\d.]/g, ""));
    let dims = dimensionsText.match(/[\d.]+/g).map(Number);

    if (dims.length !== 3) {
        return { error: "Could not parse dimensions." };
    }

    let volumeCubicInches = dims[0] * dims[1] * dims[2];
    let volumeLiters = volumeCubicInches * 0.0163871;

    return {
        weight: weight + " lbs",
        volume: volumeLiters.toFixed(2) + " L"
    };
}
