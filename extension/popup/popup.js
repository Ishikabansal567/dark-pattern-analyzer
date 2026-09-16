const scanButton = document.getElementById("scanButton");
const status = document.getElementById("status");
const resultBox = document.getElementById("result");

scanButton.addEventListener("click", async () => {

    status.textContent = "Scanning page...";
    resultBox.innerHTML = "";

    try {

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (!tab || !tab.id) {
            status.textContent = "Could not find current tab.";
            return;
        }

        // First try to contact the existing content script
        chrome.tabs.sendMessage(
            tab.id,
            { action: "scanPage" },
            async (response) => {

                // Content script doesn't exist
                if (chrome.runtime.lastError) {

                    console.log(
                        "Content script not found. Injecting..."
                    );

                    try {

                        // Inject content.js
                        await chrome.scripting.executeScript({
                            target: {
                                tabId: tab.id
                            },
                            files: ["content.js"]
                        });

                        // Try again after injection
                        chrome.tabs.sendMessage(
                            tab.id,
                            { action: "scanPage" },
                            (response) => {

                                if (chrome.runtime.lastError) {

                                    console.error(
                                        chrome.runtime.lastError.message
                                    );

                                    status.textContent =
                                        "Could not scan this page.";

                                    return;
                                }

                                showResults(response);
                            }
                        );

                    } catch (error) {

                        console.error(
                            "Injection failed:",
                            error
                        );

                        status.textContent =
                            "This page cannot be scanned.";

                    }

                    return;
                }

                showResults(response);
            }
        );

    } catch (error) {

        console.error("Scan error:", error);

        status.textContent =
            "Could not scan this page.";
    }
});


function showResults(response) {

    if (!response) {

        status.textContent =
            "No response from page.";

        return;
    }

    status.textContent =
        "Scan complete.";

    console.log(
        "Scan response:",
        response
    );

    const candidates =
        response.candidates || [];

    resultBox.innerHTML = `
        <h3>Scan Complete</h3>
        <p>
            Found ${candidates.length}
            page elements to analyze.
        </p>
    `;

    console.log(
        "Candidates:",
        candidates
    );
}