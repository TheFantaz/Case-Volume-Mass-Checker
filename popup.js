document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs.length) return;

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
