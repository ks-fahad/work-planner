
// ===========================
// LOGIN
// ===========================

let currentUser = false;

function loginSuccess(passcode) {
    localStorage.setItem("loginCode", passcode);
    localStorage.setItem("currentUser", true);
    localStorage.setItem("login", true);

}

function logout() {
    localStorage.removeItem("loginCode");
    localStorage.removeItem("currentUser");
    location.reload();
}

async function login() {
    passwordInput = document.getElementById("passwordInput").value;

    if (password == "" && passwordInput == null) {
        showMessage("❌ Password required", "error");
        return;
    }
    else if (password == "") {
        password = passwordInput;
    }

    showMessage("🔄 Loading configuration...", "warning");

    try {
        await loadConfig();
        showMessage("✔ Configuration loaded", "success");
        showMessage("🔄 Loading work data...", "warning");
        await loadData();

        if (!currentUser) return;
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
            currentUser = true;
            records = data;
            loadMonths();
            showMonth();
            document.getElementById("loginBox").classList.add("hidden");
            document.getElementById("app").classList.remove("hidden");
            document.getElementById("view-Details").classList.remove("hidden");
            showMessage("✔ Planner opened successfully", "success");
            if (!localStorage.getItem("loginCode")) loginSuccess(password);
        })
        .catch(() => {
            records = [];
            showMessage("❌ Invalid password", "error");
        });
}
