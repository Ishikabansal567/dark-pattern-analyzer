// ==========================================
// Remove duplicate candidates
// ==========================================

function removeDuplicates(candidates) {
    const seen = new Set();

    return candidates.filter((candidate) => {
        const label =
            candidate.text?.label ||
            candidate.text?.label === ""
                ? candidate.text.label
                : "";

        const key = `${candidate.type}:${label
            .toLowerCase()
            .trim()}`;

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}


// ==========================================
// Remove obviously noisy candidates
// ==========================================

function removeNoise(candidates) {
    return candidates.filter((candidate) => {

        const text =
            candidate.text?.label?.trim() || "";

        // No meaningful text
        if (!text) {
            return false;
        }

        // Ignore extremely long text blocks
        if (text.length > 200) {
            return false;
        }

        return true;
    });
}


// ==========================================
// Limit total candidates
// ==========================================

function limitCandidates(candidates, max = 100) {
    return candidates.slice(0, max);
}


// ==========================================
// Main preprocessing function
// ==========================================

function preprocessCandidates(candidates) {

    if (!Array.isArray(candidates)) {
        return [];
    }

    let processed = candidates;

    processed = removeDuplicates(processed);

    processed = removeNoise(processed);

    processed = limitCandidates(processed, 100);

    return processed;
}


module.exports = {
    preprocessCandidates
};