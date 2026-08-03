
// ===========================
// SAVE RECORD
// ===========================

async function saveRecord() {

    let date = document.getElementById("date").value;
    let start = document.getElementById("start").value;
    let finish = document.getElementById("finish").value;
    let hasBreakTime = document.getElementById("hasBreak").value;
    let startBreak = document.getElementById("breakStart").value;
    let endBreak = document.getElementById("breakEnd").value
    let noteInput = document.getElementById("note").value;

    if (!date || !start || !finish || (hasBreakTime === "yes" && (!startBreak || !endBreak))) {
        showMessage(
            "Date, start and finish times are required [required break times if it is 'YES']",
            "error"
        );

        return;
    }


    let result = calculateWork();

    if (!result) {

        showMessage(
            "Cannot calculate hours",
            "error"
        );

        return;
    }

    if (hasBreakTime === "no") {
        startBreak = "";
        endBreak = "";
    }

    let record = {

        date: encrypt(date),

        start: encrypt(start),

        finish: encrypt(finish),

        breakStart: startBreak ? encrypt(startBreak) : "",
        breakEnd: endBreak ? encrypt(endBreak) : "",

        breakMinutes: encrypt(
            result.breakMinutes
        ),

        breakType: encrypt(
            result.breakType
        ),

        totalMinutes: encrypt(
            result.total
        ),
        note: noteInput ? encrypt(noteInput) : ""

    };

    const duplicateDateRecord = records.some(r => decrypt(r.date) === date);

    if (duplicateDateRecord) {
        const proceed = await showConfirm(`
    <div style="
        font-family: system-ui, sans-serif;
        text-align: left;
    ">

        <div style="
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 12px;
        ">
            Update Confirmation
        </div>

        <hr style="
            border: none;
            border-top: 1px solid #ddd;
            margin: 12px 0 18px;
        ">

        <div style="margin-bottom: 10px;">
            <span style="color:#777;">📅 Date</span><br>
            <strong>${date}</strong>
        </div>

        <div style="margin-bottom: 10px;">
            <span style="color:#777;">⏱ Work Hours</span><br>
            <strong>${start} - ${finish}</strong>
        </div>

        ${hasBreakTime === "yes"
                ? `
            <div style="margin-bottom: 10px;">
                <span style="color:#777;">☕ Break</span><br>
                <strong>${startBreak} - ${endBreak}</strong>
            </div>
            `
                : ""
            }

        ${noteInput
                ? `
            <div style="
                margin-top: 12px;
                padding: 10px;
                background: #f5f5f5;
                border-radius: 8px;
            ">
                <div style="color:#777; margin-bottom:5px;">
                    📝 Note
                </div>
                <div>${noteInput}</div>
            </div>
            `
                : ""
            }

        <div style="
            margin-top: 18px;
            padding: 12px;
            background: #fff3cd;
            border-radius: 8px;
            color: #856404;
            font-size: 14px;
        ">
            ⚠️ This date already has an existing entry.
            <br>
            Do you want to replace it?
        </div>

    </div>
`);

        if (!proceed) {
            return;
        }
    }

    // Remove every record with the same date
    records = records.filter(r => decrypt(r.date) !== date);

    // Save the newest record
    records.push(record);

    if (editIndex >= 0) {
        showMessage("Updated successfully");
    } else {
        showMessage("Saved successfully");
    }


    // Reset edit mode
    editIndex = -1;

    const formInputs = [
        document.getElementById("date"),
        document.getElementById("start"),
        document.getElementById("finish"),
        document.getElementById("breakStart"),
        document.getElementById("breakEnd"),
        document.getElementById("hasBreak"),
        document.getElementById("note")
    ];

    formInputs.forEach(input => {
        if (input) {
            input.disabled = false;
            input.removeAttribute("readonly");
            input.style.pointerEvents = "auto";
            input.style.opacity = "1";
        }
    });

    clearForm();

    loadMonths();

    showMonth();

}

// ===========================
// LOAD MONTH LIST
// ===========================

function loadMonths() {
    let select = document.getElementById("monthSelect");
    select.innerHTML = "";

    let months = [];
    records.forEach(r => {
        let date = decrypt(r.date);
        let month = date.substring(0, 7);
        if (!months.includes(month)) {
            months.push(month);
        }
    });

    months.forEach(m => {
        let parts = m.split("-");
        let year = parts[0];
        let monthNumber = Number(parts[1]);
        let monthName = new Date(year, monthNumber - 1, 1).toLocaleString("default", { month: "long" });

        let option = document.createElement("option");
        option.value = m;
        option.innerHTML = monthName + " " + year;
        select.appendChild(option);
    });

    let currentMonth = new Date().toISOString().slice(0, 7);
    if (months.includes(currentMonth)) {
        select.value = currentMonth;
    }
}

// ===========================
// EDIT RECORD
// ===========================

function editRecord(index) {


    document.getElementById("app").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    let r = records[index];



    editIndex = index;




    const saveButton = document.getElementById("saveButton");
    const dateInput = document.getElementById("date");
    const startInput = document.getElementById("start");
    const finishInput = document.getElementById("finish");
    const breakStartInput = document.getElementById("breakStart");
    const breakEndInput = document.getElementById("breakEnd");
    const hasBreakSelect = document.getElementById("hasBreak");
    const noteInput = document.getElementById("note");

    saveButton.innerHTML = "Update Record";

    [dateInput, startInput, finishInput, breakStartInput, breakEndInput, hasBreakSelect, noteInput].forEach(input => {
        if (input) {
            input.disabled = false;
            input.removeAttribute("readonly");
            input.style.pointerEvents = "auto";
            input.style.opacity = "1";
        }
    });



    dateInput.value = decrypt(r.date);

    startInput.value = decrypt(r.start);

    finishInput.value = decrypt(r.finish);



    let bs = decrypt(r.breakStart);

    let be = decrypt(r.breakEnd);



    if (bs && be) {
        hasBreakSelect.value = "yes";
        toggleBreak();
        breakStartInput.value = bs;
        breakEndInput.value = be;

    }
    else {
        hasBreakSelect.value = "no";
        toggleBreak();


    }

    noteInput.value = r.note ? decrypt(r.note) : "";

    showMessage(
        "Editing selected record",
        "warning"
    );


}

// ===========================
// DELETE RECORD
// ===========================

async function deleteRecord(index) {
    const record = records[index];

    if (!record) {
        showMessage("Record not found", "error");
        return;
    }

    const date = decrypt(record.date);
    const proceed = await showConfirm(`
    <div style="
        font-family: system-ui, sans-serif;
        text-align: left;
    ">

        <div style="
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 12px;
        ">
            Delete Confirmation
        </div>

        <hr style="
            border: none;
            border-top: 1px solid #ddd;
            margin: 12px 0 18px;
        ">

        <div style="
            margin-bottom: 15px;
        ">
            <span style="color:#777;">📅 Date</span><br>
            <strong>${date}</strong>
        </div>

        <div style="
            margin-top: 18px;
            padding: 12px;
            background: #f8d7da;
            border-radius: 8px;
            color: #842029;
            font-size: 14px;
        ">
            ⚠️ This action cannot be undone.
            <br>
            Do you want to delete this record?
        </div>

    </div>
`);

    if (!proceed) {
        return;
    }

    records.splice(index, 1);
    editIndex = -1;
    clearForm();
    loadMonths();
    showMonth();
    showMessage("Deleted successfully", "success");
}

// ===========================
// SHOW MONTH REPORT
// ===========================

function showMonth() {
    let month = document.getElementById("monthSelect").value;
    let body = document.getElementById("reportBody");

    records.sort((a, b) => {
        const dateA = new Date(decrypt(a.date));
        const dateB = new Date(decrypt(b.date));
        return dateA - dateB;
    });

    body.innerHTML = "";

    let totalHours = 0;
    let totalBreak = 0;
    let count = 0;

    const weekColors = [
        "#fef9c3",
        "#dbeafe",
        "#dcfce7",
        "#fae8ff",
        "#fee2e2",
        "#f3f4f6"
    ];

    let currentWeek = "";
    let weekIndex = -1;
    let weekTotal = 0;

    records.forEach((r, index) => {
        let date = decrypt(r.date);
        if (!date.startsWith(month)) return;

        count++;
        let start = decrypt(r.start);
        let finish = decrypt(r.finish);
        let bs = decrypt(r.breakStart);
        let be = decrypt(r.breakEnd);
        let breakMinutes = Number(decrypt(r.breakMinutes));
        let breakType = decrypt(r.breakType);
        let worked = Number(decrypt(r.totalMinutes));
        let note = r.note ? decrypt(r.note) : "";

        let d = new Date(date);
        let day = d.getDay();
        let diff = (day === 0 ? -6 : 1 - day);
        let monday = new Date(d);
        monday.setDate(d.getDate() + diff);
        let weekKey = monday.toISOString().split("T")[0];

        if (weekKey !== currentWeek) {
            if (currentWeek !== "") {
                let totalRow = body.insertRow();
                totalRow.insertCell(0).colSpan = 10;
                totalRow.cells[0].style.border = 'none';
                totalRow.cells[0].style.textAlign = 'left';
                totalRow.cells[0].style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
                totalRow.cells[0].style.fontWeight = 'bold';
                totalRow.cells[0].innerHTML = "Weekly Total Hours: " + formatMinutes(weekTotal);
            }

            currentWeek = weekKey;
            weekIndex++;
            weekTotal = 0;
        }

        weekTotal += worked;

        if (date.startsWith(month)) {
            mobileView(body, count, date, start, finish, bs, be, breakMinutes, breakType, worked, note, index, weekIndex, weekColors);
            totalHours += worked;
            totalBreak += breakMinutes;
        }
    });

    if (currentWeek !== "") {
        let totalRow = body.insertRow();
        totalRow.insertCell(0).colSpan = 10;
        totalRow.cells[0].style.border = 'none';
        totalRow.cells[0].style.textAlign = 'left';
        totalRow.cells[0].style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
        totalRow.cells[0].style.fontWeight = 'bold';
        totalRow.cells[0].innerHTML = "Weekly Total Hours: " + formatMinutes(weekTotal);
    }

    totalHoursGlobal = totalHours;
    totalBreakGlobal = totalBreak;
    countGlobal = count;
    updateMonthlySummary();
}

function mobileView(body, count, date, start, finish, bs, be, breakMinutes, breakType, worked, note, index, weekIndex, weekColors) {
    let thead = document.querySelector(".table-container table thead tr");
    let containerTable = document.querySelector(".table-container");
    let table = document.querySelector(".table-container table");
    let today = new Date().toLocaleDateString("en-CA");
    let row = body.insertRow();

    if (window.innerWidth < 745) {
        if (thead.style.display !== "none") {
            containerTable.style.webkitOverflowScrolling = "touch";
            thead.style.display = "none";
            table.style.width = "100%";
            table.style.minWidth = "100%";
            table.style.borderSpacing = "14px";
        }

        let cell = row.insertCell(0);
        cell.colSpan = 10;
        cell.style.overflow = "visible";
        cell.style.position = "relative";
        cell.style.padding = "0";

        cell.innerHTML = `
<div style="position:relative;margin-top:-10px;margin-bottom:1px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:black;z-index:10;">
    <div style="display:flex; gap:2px; align-items:center;">
        <span style="border-radius:25px;background:${weekColors[weekIndex % weekColors.length]};padding:2px 10px;box-shadow:0 2px 8px rgba(15,23,42,.12),0 10px 25px rgba(15,23,42,.08);color:#919191;border:1px solid white;font-weight:bold;">${date === today ? "✅" : count}</span>
        <span style="border-radius:25px;background:white;padding:2px 10px;box-shadow:0 2px 8px rgba(15,23,42,.12),0 10px 25px rgba(15,23,42,.08);border:1px solid ${weekColors[weekIndex % weekColors.length]};">${date === today ? "Today" : dateFormat(date)}</span>
    </div>
    <div style="display:flex; align-items:center; margin:0; padding:0; gap:2px;">
        <span>${ActionButtons(index, "custom")}</span>
    </div>
</div>
<div style="padding: 5px 8px 2px 8px; font-size: 15px">
    <div style="display:flex; justify-content:space-between;"><span style="font-weight:bold;">Work Hours</span><span style="font-weight:bold;">${start} - ${finish}</span></div>
    ${(bs && be) ? `<div style="display:flex; justify-content:space-between;"><span style="font-style: italic;">Break</span><span style="font-style: italic;">${bs} - ${be} [${formatMinutes(breakMinutes)}]</span></div>` : (breakType === "Auto") ? `<div style="display:flex; justify-content:space-between;"><span style="font-style: italic;">Break</span><span style="font-style: italic;">⚙️ 30 m</span></div>` : ""}
    <div style="display:flex; justify-content:space-between;"><span style="font-weight:bold;">Total</span><span style="font-weight:bold;">${formatMinutes(worked)}</span></div>
</div>
<hr style="border:0;border-top: 1px dashed #aaa;margin: 8px 8px 2px 8px;">
${note ? `<div style="padding: 2px 2px; margin: 2px 8px; font-size: 10px; text-align: justify; white-space: pre-wrap;word-break: break-word;overflow-wrap: break-word;">${note}</div>` : `<div style="margin-top:8px"/>`}`
    }
    else {
        if (thead.style.display === "none") {
            thead.style.display = "";
            table.style.minWidth = "900px";
            table.style.borderSpacing = "8px";
        }

        let cellIndex = row.insertCell(0);
        let dateCell = row.insertCell(1);
        dateCell.innerHTML = dateFormat(date);

        let startWork = row.insertCell(2);
        let finishWork = row.insertCell(3);
        startWork.innerHTML = start;
        finishWork.innerHTML = finish;
        startWork.style.fontWeight = "bold";
        finishWork.style.fontWeight = "bold";

        row.insertCell(4).innerHTML = bs || "⚪";
        row.insertCell(5).innerHTML = be || "⚪";

        let breakTotalInfo = row.insertCell(6);
        if (breakType === "Auto") {
            breakTotalInfo.innerHTML = "30 m";
        }
        else if (breakType === "Have") {
            breakTotalInfo.innerHTML = formatMinutes(breakMinutes);
        }
        else {
            breakTotalInfo.innerHTML = "⚪";
        }

        let totalWorkperDay = row.insertCell(7);
        totalWorkperDay.innerHTML = formatMinutes(worked);
        totalWorkperDay.style.fontWeight = "bold";

        let noteCell = row.insertCell(8);

        noteCell.innerHTML = note || "⚪";
        noteCell.style.fontSize = note ? "10px" : "auto";
        noteCell.style.fontStyle = note ? "italic" : "normal";

        // Text wrapping
        noteCell.style.whiteSpace = "normal";
        noteCell.style.wordBreak = "break-word";
        noteCell.style.overflowWrap = "break-word";

        let action = row.insertCell(9);
        action.innerHTML = ActionButtons(index, "auto");

        if (date === today) {
            cellIndex.innerHTML = "✅";
            dateCell.innerHTML = "Today";
        } else {
            cellIndex.innerHTML = count;
        }
    }

    if (date === today) {
        row.style.fontWeight = "bold";
        row.classList.add("today-row");
    }

    row.style.backgroundColor = weekColors[weekIndex % weekColors.length];
}

function ActionButtons(index, size) {
    if (size === "auto") {
        return `<button class="small-btn btn-edit" onclick="editRecord(${index})">Edit</button><button class="small-btn btn-danger" onclick="deleteRecord(${index})">Delete</button>`;
    }
    else {
        return `<button class="small-btn btn-edit" onclick="editRecord(${index})" style="font-size: 12px;padding: 3px 8px;border-radius: 25px;">Edit</button><button class="small-btn btn-danger" onclick="deleteRecord(${index})" style="font-size: 12px;border-radius: 25px;padding: 3px 8px;">Delete</button>`;
    }
}

function dateFormat(date) {
    let d = new Date(date);
    return d.toLocaleDateString("en-GB", { day: "2-digit" }) + ", " + d.toLocaleDateString("en-GB", { weekday: "long" });
}

function clearForm() {
    editIndex = -1;

    const saveButton = document.getElementById("saveButton");
    const dateInput = document.getElementById("date");
    const startInput = document.getElementById("start");
    const finishInput = document.getElementById("finish");
    const breakStartInput = document.getElementById("breakStart");
    const breakEndInput = document.getElementById("breakEnd");
    const hasBreakSelect = document.getElementById("hasBreak");
    const breakArea = document.getElementById("breakArea");
    const noteInput = document.getElementById("note");

    saveButton.innerHTML = "Add Record";

    [dateInput, startInput, finishInput, breakStartInput, breakEndInput, hasBreakSelect, noteInput].forEach(input => {
        if (input) {
            input.disabled = false;
            input.removeAttribute("readonly");
            input.style.pointerEvents = "auto";
            input.style.opacity = "1";
        }
    });

    if (breakArea) {
        breakArea.style.display = "none";
    }

    dateInput.value = "";
    startInput.value = "";
    finishInput.value = "";
    breakStartInput.value = "";
    breakEndInput.value = "";
    hasBreakSelect.value = "no";
    noteInput.value = "";

    setTimeout(() => {
        if (dateInput && document.contains(dateInput)) {
            dateInput.focus();
        }
    }, 0);

    showMessage("Form cleared", "warning");
}

function updateMonthlySummary() {

    document.getElementById("countDays").innerHTML =
        `${countGlobal} days`;

    document.getElementById("totalHours").innerHTML =
        formatMinutes(totalHoursGlobal);

    document.getElementById("totalBreak").innerHTML =
        formatMinutes(totalBreakGlobal);
    const element = document.getElementById("workedHoursDisplay");

    if (element) {
        element.innerHTML =
            `${(totalHoursGlobal / 60).toFixed(2)} h`;
    }


}