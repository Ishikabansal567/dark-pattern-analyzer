const candidates = [];


// ==========================================
// Helper: Clean text
// ==========================================

function cleanText(text) {
    if (!text) {
        return "";
    }

    return text
        .replace(/\s+/g, " ")
        .trim();
}


// ==========================================
// Helper: Get checkbox label
// ==========================================

function getCheckboxLabel(checkbox) {
    let labelText = "";

    // Case 1: checkbox is inside a <label>
    const parentLabel = checkbox.closest("label");

    if (parentLabel) {
        labelText = cleanText(parentLabel.innerText);
    }

    // Case 2: label uses for="checkboxId"
    if (!labelText && checkbox.id) {
        const label = document.querySelector(
            `label[for="${checkbox.id}"]`
        );

        if (label) {
            labelText = cleanText(label.innerText);
        }
    }

    return labelText;
}


// ==========================================
// Helper: Get nearby context
// ==========================================

function getNearbyText(element, maxLength = 250) {
    const parent = element.parentElement;

    if (!parent) {
        return "";
    }

    let text = cleanText(parent.innerText);

    // Remove the element's own text when possible
    if (element.innerText) {
        const ownText = cleanText(element.innerText);

        if (ownText) {
            text = cleanText(
                text.replace(ownText, "")
            );
        }
    }

    if (text.length > maxLength) {
        text = text.substring(0, maxLength) + "...";
    }

    return text;
}


// ==========================================
// Helper: Get parent context
// ==========================================

function getParentText(element, maxLength = 150) {
    const parent = element.parentElement;

    if (!parent) {
        return "";
    }

    let text = cleanText(parent.innerText);

    if (text.length > maxLength) {
        text = text.substring(0, maxLength) + "...";
    }

    return text;
}


// ==========================================
// Helper: Get form context
// ==========================================

function getFormText(element, maxLength = 200) {
    const form = element.closest("form");

    if (!form) {
        return "";
    }

    let text = cleanText(form.innerText);

    if (text.length > maxLength) {
        text = text.substring(0, maxLength) + "...";
    }

    return text;
}


// ==========================================
// Helper: Get limited visual information
// ==========================================

function getVisualInfo(element) {
    const styles = window.getComputedStyle(element);

    return {
        fontSize: styles.fontSize,
        color: styles.color,
        display: styles.display,
        visibility: styles.visibility
    };
}


// ==========================================
// 1. CHECKBOXES
// ==========================================

const checkboxes = document.querySelectorAll(
    'input[type="checkbox"]'
);

checkboxes.forEach((checkbox) => {

    const wasCheckedOnLoad = checkbox.checked;

    // We only send checked checkboxes because
    // preselection is relevant to our MVP.
    if (!checkbox.checked) {
        return;
    }

    const label = getCheckboxLabel(checkbox);

    candidates.push({
        type: "checkbox",

        state: {
            checked: checkbox.checked,
            wasCheckedOnLoad: wasCheckedOnLoad
        },

        text: {
            label: label || "No label found",
            nearbyText: getNearbyText(checkbox)
        },

        context: {
            parentText: getParentText(checkbox),
            formText: getFormText(checkbox)
        },

        visual: getVisualInfo(checkbox)
    });
});


// ==========================================
// 2. BUTTONS
// ==========================================

const buttons = document.querySelectorAll(
    "button, input[type='button'], input[type='submit']"
);

buttons.forEach((button) => {

    const buttonText = cleanText(
        button.innerText || button.value
    );

    if (!buttonText) {
        return;
    }

    candidates.push({
        type: "button",

        state: {
            disabled: button.disabled
        },

        text: {
            label: buttonText,
            nearbyText: getNearbyText(button)
        },

        context: {
            parentText: getParentText(button),
            formText: getFormText(button)
        },

        visual: getVisualInfo(button)
    });
});


// ==========================================
// 3. IMPORTANT TEXT BLOCKS
// ==========================================

// Instead of sending the entire page,
// collect reasonably small visible text blocks.

const textElements = document.querySelectorAll(
    "h1, h2, h3, h4, h5, h6, p, li, label, summary, legend, [role='alert'], [role='status']"
);

textElements.forEach((element) => {

    const text = cleanText(element.innerText);

    if (!text) {
        return;
    }

    // Ignore huge blocks of page content.
    if (text.length < 8 || text.length > 180) {
        return;
    }

    const styles = window.getComputedStyle(element);

    // Ignore hidden elements.
    if (
        styles.display === "none" ||
        styles.visibility === "hidden"
    ) {
        return;
    }

    candidates.push({
        type: "text",

        text: {
            label: text,
            nearbyText: getNearbyText(element, 180)
        },

        context: {
            parentText: getParentText(element, 120)
        },

        visual: getVisualInfo(element)
    });
});


// ==========================================
// Remove duplicate text candidates
// ==========================================

const uniqueCandidates = [];

const seen = new Set();

for (const candidate of candidates) {

    const key = JSON.stringify(candidate);

    if (!seen.has(key)) {
        seen.add(key);
        uniqueCandidates.push(candidate);
    }
}


// ==========================================
// Final candidates
// ==========================================

console.log(
    "Compact candidates:",
    uniqueCandidates
);


// ==========================================
// Popup communication
// ==========================================

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message.action === "scanPage") {

            sendResponse({
                candidates: uniqueCandidates
            });
        }
    }
);