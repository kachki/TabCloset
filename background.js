chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getFavicon") {
        const url = request.url;
        const faviconUrl = `chrome://favicon/size/16@2x/${url}`;
        fetch(faviconUrl)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    sendResponse({ favicon: reader.result });
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                console.error("Error fetching favicon:", error);
                sendResponse({ favicon: null });
            });
        return true; // Indicates an asynchronous response
    }
}); 