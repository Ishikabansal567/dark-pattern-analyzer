const scanButton = document.getElementById("scanButton");

scanButton.addEventListener("click", async () => {
    console.log("Scan button clicked!");

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    chrome.tabs.sendMessage(
        tab.id,
        { action: "scanPage" },
        async (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                return;
            }

            console.log("Received from page:", response);

            const result = await fetch("http://localhost:3000/analyze", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    candidates: response.candidates
                })
            });

            const data = await result.json();

            console.log("Backend response:", data);
        }
    );
});