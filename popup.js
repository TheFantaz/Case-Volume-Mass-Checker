document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = ['showWeight', 'showDimensions', 'showVolume'];
    
    // Load saved preferences
    checkboxes.forEach(id => {
        chrome.storage.sync.get(id, (data) => {
            document.getElementById(id).checked = data[id] !== false;
        });
    });

    // Save preferences on change
    checkboxes.forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            chrome.storage.sync.set({ [id]: e.target.checked });
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "updateDisplay",
                    preferences: {
                        showWeight: document.getElementById('showWeight').checked,
                        showDimensions: document.getElementById('showDimensions').checked,
                        showVolume: document.getElementById('showVolume').checked
                    }
                });
            });
        });
    });
});