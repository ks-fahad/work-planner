
// ===========================
// LOGIN
// ===========================

let loginStatus = "";

function loginSuccess(passcode) {
    localStorage.setItem("loginCode", btoa([...passcode].map((c, i) => String.fromCharCode(c.charCodeAt(0) + i + 5)).reverse().join("")));
    localStorage.setItem("login", true);
}

function logout() {
    localStorage.removeItem("loginCode");
    localStorage.setItem("login", false);
    location.reload();
}

async function login() {
    passwordInput = document.getElementById("passwordInput").value;

    if (!password && !passwordInput) {
        showMessage("❌ Password required", "error");
        return;
    }
    else if (password == "" && passwordInput != null) {
        password = passwordInput;
    }

    showMessage("🔄 Loading configuration...", "warning");

    try {
        await loadConfig();
        showMessage("✔ Configuration loaded", "success");
        showMessage("🔄 Loading work data...", "warning");
        await loadData();
    }
    catch (error) {
        showMessage("❌ Login failed: " + error.message, "error");
        console.log(error);
    }
}

// ===========================
// LOAD JSON
// ===========================

async function loadData() {
    try {
        const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_FILE}?t=${Date.now()}`;

        const response = await fetch(url, {
            cache: "no-store"
        });

        const file = await response.json();

        const data = JSON.parse(
            atob(file.content)
        );

        loginStatus = "true";
        records = data;

        loadMonths();
        showMonth();

        document.getElementById("loginBox").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");
        document.getElementById("view-Details").classList.remove("hidden");

        showMessage("✔ Planner opened successfully", "success");

        if (!localStorage.getItem("loginCode")) {
            loginSuccess(password);
        }

    } catch (error) {
        currentUser = false;
        showMessage("❌ Invalid password", "error");
    }
}

// async function loadData() {
//     fetch(`https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${GITHUB_FILE}?t=${Date.now()}`)
//         .then(r => r.json())
//         .then(data => {
//             loginStatus = true;
//             records = data;
//             loadMonths();
//             showMonth();
//             document.getElementById("loginBox").classList.add("hidden");
//             document.getElementById("app").classList.remove("hidden");
//             document.getElementById("view-Details").classList.remove("hidden");
//             showMessage("✔ Planner opened successfully", "success");
//             if (!localStorage.getItem("loginCode")) loginSuccess(password);
//         })
//         .catch(() => {
//             currentUser = false;
//             records = [];
//             showMessage("❌ Invalid password", "error");
//         });
// }
