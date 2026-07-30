
function showSalaryBlock() {
    let block = document.getElementById("salaryBlock");
    if (!block) {
        return;
    }

    block.style.display = "block";

    if (window.innerWidth > 745) {
        requestAnimationFrame(() => {
            const targetY = Math.max(0, block.getBoundingClientRect().top + window.scrollY - 90);
            window.scrollTo({
                top: targetY,
                behavior: "smooth"
            });
        });
    }
}

function checkExtraHours(totalHours) {
    let workedHours = totalHours / 60;
    let contract = Number(document.getElementById("contractHours").value);

    if (workedHours > contract) {
        document.getElementById("extraBox").style.display = "block";
    }
    else {
        document.getElementById("extraBox").style.display = "none";
    }
}

function calculateSalary(totalHours) {
    let workedHours = totalHours / 60;
    let contractHours = Number(document.getElementById("contractHours").value);
    let salaryPerHour = Number(document.getElementById("salaryPerHour").value);
    let taxPercent = Number(document.getElementById("taxPercent").value);
    let extraPercent = Number(document.getElementById("extraPercent").value || 100);

    if (!Number.isFinite(contractHours) || !Number.isFinite(salaryPerHour) || !Number.isFinite(taxPercent) || contractHours <= 0 || salaryPerHour <= 0) {
        document.getElementById("salaryResult").innerHTML = `
        <div style="padding:12px;background:#fee2e2;color:#b91c1c;border-radius:8px;font-weight:bold;">⚠️ Please fill all required fields.</div>`;
        return;
    }

    let normalHours = Math.min(workedHours, contractHours);
    let extraHours = Math.max(workedHours - contractHours, 0);
    let normalPay = normalHours * salaryPerHour;
    let extraPay = extraHours * salaryPerHour * ((extraPercent + 100) / 100);
    let grossSalary = normalPay + extraPay;
    let tax = grossSalary * (taxPercent / 100);
    let finalSalary = grossSalary - tax;

    document.getElementById("salaryResult").innerHTML = `
<div style="font-family:Arial,sans-serif;background:#ffffff;border-radius:15px;padding:20px;box-shadow:0 4px 15px rgba(0,0,0,0.08);width:100%;max-width:500px;box-sizing:border-box;margin:auto;overflow:hidden;">
<h3 style="margin:0 0 15px;color:#1e293b;font-size:20px;">💰 Salary Result</h3>
<div style="display:grid; gap:12px;">
    <div><span style="color:#6b7280;">Gross Salary</span><div style="font-size:20px;font-weight:bold;">${grossSalary.toFixed(2)}</div></div>
    <div><span style="color:#6b7280;">Tax</span><div style="font-size:20px;font-weight:bold;">${tax.toFixed(2)}</div></div>
    <div><span style="color:#6b7280;">Net Salary</span><div style="font-size:20px;font-weight:bold; color:#159957;">${finalSalary.toFixed(2)}</div></div>
</div>
</div>`;
}
