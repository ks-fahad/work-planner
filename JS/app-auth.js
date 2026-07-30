
// ===========================
// LOGIN
// ===========================

async function login() {
    password = document.getElementById("passwordInput").value;

    if (password == "") {
        showMessage("❌ Password required", "error");
        return;
    }

    showMessage("🔄 Loading configuration...", "warning");

    try {
        await loadConfig();
        showMessage("✔ Configuration loaded", "success");
        showMessage("🔄 Loading work data...", "warning");
        await loadData();

        document.getElementById("loginBox").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");
        showMessage("✔ Planner opened successfully", "success");
    }
    catch (error) {
        showMessage("❌ Login failed: " + error.message, "error");
        console.log(error);
    }
}

// ===========================
// LOAD JSON
// ===========================

function loadData() {
    fetch(`https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${GITHUB_FILE}`)
        .then(r => r.json())
        .then(data => {
            records = data;
            loadMonths();
            showMonth();
            showMessage("Database loaded successfully");
        })
        .catch(() => {
            records = [];
            showMessage("New database created", "warning");
        });
}
