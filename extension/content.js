const candidates = [];

// --------------------
// 1. Checked checkboxes
// --------------------

const checkboxes = document.querySelectorAll(
    'input[type="checkbox"]'
);

checkboxes.forEach((checkbox) => {
    if (!checkbox.checked) {
        return;
    }

    let labelText = "";

    // Checkbox inside label
    const parentLabel = checkbox.closest("label");

    if (parentLabel) {
        labelText = parentLabel.innerText.trim();
    }

    // Label using "for" attribute
    if (!labelText && checkbox.id) {
        const label = document.querySelector(
            `label[for="${checkbox.id}"]`
        );

        if (label) {
            labelText = label.innerText.trim();
        }
    }

    candidates.push({
        type: "checkbox",
        checked: true,
        text: labelText || "No label found"
    });
});


// --------------------
// 2. Buttons
// --------------------

const buttons = document.querySelectorAll(
    "button"
);

buttons.forEach((button) => {
    const text = button.innerText.trim();

    if (!text) {
        return;
    }

    candidates.push({
        type: "button",
        text: text
    });
});


// --------------------
// 3. Visible page text
// --------------------

const pageText = document.body.innerText
    .replace(/\s+/g, " ")
    .trim();

candidates.push({
    type: "page_text",
    text: pageText
});


// --------------------
// Final output
// --------------------

console.log("Page candidates:", candidates);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scanPage") {
        sendResponse({
            candidates: candidates
        });
    }
});