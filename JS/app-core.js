
// ===========================
// GLOBAL VARIABLES
// ===========================

let password = "";
let records = [];
let editIndex = -1;

// GitHub settings
let GITHUB_USER = " ";
let GITHUB_REPO = " ";
let GITHUB_FILE = " ";
let GITHUB_TOKEN = " ";

let config = {};

let totalHoursGlobal = 0;
let totalBreakGlobal = 0;
let countGlobal = 0;

// ===========================
// CALENDAR Front
// ===========================

function loadCalendar() {
    let grid = document.getElementById("calendarGrid");
    let monthYear = document.getElementById("currentMonthCalender");
    grid.innerHTML = "";

    let today = new Date();
    let year = today.getFullYear();
    let monthNumber = today.getMonth();

    monthYear.innerHTML = today.toLocaleString("default", { month: "long", year: "numeric" });
    monthYear.style.display = "flex";
    monthYear.style.alignItems = "center";
    monthYear.style.justifyContent = "center";
    monthYear.style.fontSize = "12px";
    monthYear.style.fontWeight = "500";
    monthYear.style.color = "#9ca3af";
    monthYear.style.overflow = "hidden";
    monthYear.style.whiteSpace = "nowrap";
    monthYear.style.textOverflow = "ellipsis";

    let firstDay = new Date(year, monthNumber, 1);
    let mondayStart = (firstDay.getDay() + 6) % 7;
    let startDate = new Date(year, monthNumber, 1);
    startDate.setDate(startDate.getDate() - mondayStart);

    let todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    for (let i = 0; i < 35; i++) {
        let day = new Date(startDate);
        day.setDate(startDate.getDate() + i);

        let block = document.createElement("i");

        if (day.getMonth() !== monthNumber) {
            block.classList.add("fade");
        }

        let dayString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
        if (dayString === todayString) {
            block.classList.add("active");
            block.style.display = "flex";
            block.style.alignItems = "center";
            block.style.justifyContent = "center";
            block.style.color = "white";
            block.textContent = day.getDate();
        }

        grid.appendChild(block);
    }
}

window.onload = function () {
    loadCalendar();
};

// ===========================
// CONFIG / LOAD
// ===========================

async function loadConfig() {
    try {
        const response = await fetch("config.json");

        if (!response.ok) {
            throw new Error("Config file not found");
        }

        config = await response.json();
        console.log("Config loaded");

        GITHUB_USER = decrypt(config.githubUser);
        GITHUB_REPO = decrypt(config.githubRepo);
        GITHUB_FILE = decrypt(config.githubFile);
        GITHUB_TOKEN = decrypt(config.githubToken)?.replaceAll("##fad&&to", "") || "";
    }
    catch (error) {
        console.log(error);
        showMessage("❌ Cannot load config.json", "error");
    }
}

// ===========================
// TIME FUNCTIONS
// ===========================

function toMinutes(time) {
    let p = time.split(":");
    return Number(p[0]) * 60 + Number(p[1]);
}

function formatMinutes(minutes) {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    return h + "h " + m + "m";
}

// ===========================
// CALCULATE WORK HOURS
// ===========================

function calculateWork() {
    let start = document.getElementById("start").value;
    let finish = document.getElementById("finish").value;

    if (!start || !finish) {
        return null;
    }

    let total = toMinutes(finish) - toMinutes(start);
    if (total < 0) {
        total += 1440;
    }

    let breakMinutes = 0;
    let breakType = "No";
    let hasBreak = document.getElementById("hasBreak").value;

    if (hasBreak == "yes") {
        let bs = document.getElementById("breakStart").value;
        let be = document.getElementById("breakEnd").value;

        if (bs && be) {
            breakMinutes = toMinutes(be) - toMinutes(bs);
            if (breakMinutes < 0) {
                breakMinutes += 1440;
            }
            breakType = "Have";
        }
    }
    else if (total > 360) {
        breakMinutes = 30;
        breakType = "Auto";
    }

    return {
        total: total - breakMinutes,
        breakMinutes: breakMinutes,
        breakType: breakType
    };
}

// ===========================
// MESSAGE SYSTEM
// ===========================

function showMessage(text, type = "success") {
    let box = document.getElementById("message");
    box.innerHTML = text;
    box.className = type;

    setTimeout(() => {
        box.innerHTML = "";
        box.className = "";
    }, 4000);
}

// ===========================
// ENCRYPTION
// ===========================

function encrypt(value) {
    return CryptoJS.AES.encrypt(String(value), password).toString();
}

function decrypt(value) {
    try {
        return CryptoJS.AES.decrypt(value, password).toString(CryptoJS.enc.Utf8);
    }
    catch (e) {
        return "";
    }
}

// ===========================
// BREAK DISPLAY
// ===========================

function toggleBreak() {
    let value = document.getElementById("hasBreak").value;

    if (value == "yes") {
        document.getElementById("breakArea").classList.remove("hidden");
    }
    else {
        document.getElementById("breakArea").classList.add("hidden");
    }
}

// ===========================
// PREPARE ENCRYPTED JSON
// ===========================

function encryptedJSON() {
    return JSON.stringify(records, null, 2);
}


let resizeTimer;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        showMonth();
    }, 200);
});
