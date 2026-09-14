const checkboxes = document.querySelectorAll(
    'input[type="checkbox"]'
);

const detections = [];

checkboxes.forEach((checkbox) => {
    if (!checkbox.checked) {
        return;
    }

    let labelText = "";

    // Case 1: checkbox is inside the label
    const parentLabel = checkbox.closest("label");

    if (parentLabel) {
        labelText = parentLabel.innerText.trim();
    }

    // Case 2: label uses "for" attribute
    if (!labelText && checkbox.id) {
        const label = document.querySelector(
            `label[for="${checkbox.id}"]`
        );

        if (label) {
            labelText = label.innerText.trim();
        }
    }

    detections.push({
        type: "checkbox",
        checked: true,
        text: labelText || "No label found"
    });
});

console.log("Extracted candidates:", detections);