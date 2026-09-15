const scanButton = document.getElementById("scanButton");

const status = document.getElementById("status");
const resultBox = document.getElementById("result");

const pattern = document.getElementById("pattern");
const severity = document.getElementById("severity");
const confidence = document.getElementById("confidence");
const evidence = document.getElementById("evidence");
const explanation = document.getElementById("explanation");

const consumerSection =
    document.getElementById("consumerSection");

const consumerProtection =
    document.getElementById("consumerProtection");


scanButton.addEventListener("click", async () => {

    status.textContent = "Scanning page...";
    resultBox.classList.add("hidden");

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    chrome.tabs.sendMessage(
        tab.id,
        { action: "scanPage" },
        async (response) => {

            if (chrome.runtime.lastError) {
                status.textContent =
                    "Could not scan this page.";

                console.error(
                    chrome.runtime.lastError.message
                );

                return;
            }

            console.log(
                "Received from page:",
                response
            );

            try {

                status.textContent =
                    "Analyzing with Gemini...";

                const result = await fetch(
                    "http://localhost:3000/analyze",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            candidates:
                                response.candidates
                        })
                    }
                );

                if (!result.ok) {
                    throw new Error(
                        `Server returned ${result.status}`
                    );
                }

                const data = await result.json();

                console.log(
                    "Backend response:",
                    data
                );

                displayResult(data.result);

            } catch (error) {

                console.error(error);

                status.textContent =
                    "Analysis failed. Check the backend.";
            }
        }
    );
});


function displayResult(data) {

    status.textContent = "";

    resultBox.classList.remove("hidden");

    pattern.textContent =
        data.detected
            ? data.pattern
            : "No potential dark pattern detected";

    severity.textContent =
        data.severity;

    confidence.textContent =
        data.confidence;

    evidence.textContent =
        data.evidence;

    explanation.textContent =
        data.explanation;


    if (
        data.consumerProtection &&
        data.consumerProtection.applicable
    ) {

        consumerSection.classList.remove("hidden");

        consumerProtection.textContent =
            `${data.consumerProtection.framework}
             | Category: ${data.consumerProtection.category}`;

    } else {

        consumerSection.classList.add("hidden");
    }
}