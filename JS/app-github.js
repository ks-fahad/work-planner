
let lastSaveFailed = false;

function showGitHubStatus(message, type = "success") {
    let box = document.getElementById("githubStatus");
    box.innerHTML = message;
    box.className = type;
}

async function saveToGitHub() {
    if (records.length === 0) {
        showGitHubStatus("⚠ No records to save", "warning");
        return;
    }

    try {
        showGitHubStatus("🔄 Saving to Database...", "warning");

        if (GITHUB_TOKEN == "YOUR_TOKEN" || GITHUB_TOKEN == "") {
            showGitHubStatus("⚠ Database token missing", "error");
            lastSaveFailed = true;
            return;
        }

        const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`;
        let sha = "";
        let githubRecords = [...records];

        let old = await fetch(url, {
            headers: {
                "Authorization": "Bearer " + GITHUB_TOKEN,
                "Accept": "application/vnd.github+json"
            }
        });

        if (old.ok) {
            let oldFile = await old.json();
            sha = oldFile.sha;
        }

        githubRecords = [...records];

        let dateCount = {};
        githubRecords.forEach(r => {
            let d = r.date;
            dateCount[d] = (dateCount[d] || 0) + 1;
        });

        let duplicateDates = Object.keys(dateCount).filter(d => dateCount[d] > 1);
        if (duplicateDates.length > 0) {
            showGitHubStatus("⚠ Duplicate dates found: " + duplicateDates.map(d => decrypt(d)).join(", "), "warning");
        }

        let encryptedData = JSON.stringify(githubRecords, null, 2);
        let encoded = btoa(unescape(encodeURIComponent(encryptedData)));
        let body = {
            message: "Update encrypted work data",
            content: encoded
        };

        if (sha != "") {
            body.sha = sha;
        }

        let response = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + GITHUB_TOKEN,
                "Accept": "application/vnd.github+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        let result = await response.json();

        if (response.ok) {
            lastSaveFailed = false;
            showGitHubStatus("✔ Saved successfully to Database", "success");
        } else {
            lastSaveFailed = true;
            showGitHubStatus("❌ Database error: " + result.message, "error");
            console.log(result);
        }
    }
    catch (error) {
        lastSaveFailed = true;
        showGitHubStatus("❌ Cannot connect to Database: " + error.message, "error");
    }
}

function retryGitHubSave() {
    saveToGitHub();
}
