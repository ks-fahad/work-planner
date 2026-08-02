function showSalaryBlock() {
    let block = document.getElementById("salaryBlock");
    let button = document.getElementById("showSalaryButton");

    if (!block) {
        return;
    }


    if (block.style.display === "none") {

        block.style.display = "block";

        button.textContent = "Hide Salary Details";
        document.getElementById("salaryBlock").scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest"
        });


    } else {

        block.style.display = "none";

        button.textContent = "Calculate Salary";


        document.getElementById("summary").scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest"
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
    let tax = normalPay * (taxPercent / 100);
    let finalSalary = grossSalary - tax;

    document.getElementById("salaryResult").innerHTML = `
<!-- Salary Details Container -->
<div style="
    width:100%;
    max-width:500px;
    margin:auto;
    box-sizing:border-box;
    font-family:Arial,sans-serif;
">

<!-- Header -->
<div style="
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:24px;
">
    <div>
        <div style="
            font-size:clamp(18px,5vw,22px);
            font-weight:700;
            color:#111827;
        ">
            💰 Salary Summary
        </div>

        <div style="
            font-size:clamp(12px,3.5vw,14px);
            color:#6b7280;
            margin-top:4px;
        ">
            Monthly Salary Breakdown
        </div>
    </div>
</div>


<!-- Salary Details -->
<div style="
    display:flex;
    flex-direction:column;
    gap:14px;
">


<!-- Monthly Salary -->
<div style="
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:10px;
    background:#f8fafc;
    padding:16px;
    border-radius:14px;
    box-sizing:border-box;
">

<div style="min-width:0;">
    <div style="
        font-size:13px;
        color:#6b7280;
    ">
        Monthly Salary
    </div>

    <div style="
        font-size:clamp(18px,5vw,22px);
        font-weight:700;
        color:#111827;
        overflow-wrap:anywhere;
    ">
        ${normalPay.toFixed(2)}
    </div>
</div>

<div style="
    font-size:clamp(22px,7vw,28px);
    flex-shrink:0;
">
💵
</div>

</div>



${extraPay > 0 ? `

<div style="
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:10px;
    background:#f8fafc;
    padding:16px;
    border-radius:14px;
    box-sizing:border-box;
">

<div style="min-width:0;">
    <div style="
        font-size:13px;
        color:#6b7280;
    ">
        Overtime Salary
    </div>

    <div style="
        font-size:clamp(18px,5vw,22px);
        font-weight:700;
        color:#111827;
    ">
        ${extraPay.toFixed(2)}
    </div>
</div>

<div style="
    font-size:clamp(22px,7vw,28px);
    flex-shrink:0;
">
⏰
</div>

</div>

` : ""}



<!-- Tax -->

<div style="
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:10px;
    background:#fff7ed;
    padding:16px;
    border-radius:14px;
    box-sizing:border-box;
">

<div style="min-width:0;">

<div style="
    font-size:13px;
    color:#9a3412;
">
Tax Deduction
</div>

<div style="
    font-size:clamp(18px,5vw,22px);
    font-weight:700;
    color:#ea580c;
">
-${tax.toFixed(2)}
</div>

</div>

<div style="
    font-size:clamp(22px,7vw,28px);
    flex-shrink:0;
">
📄
</div>

</div>



<!-- Divider -->

<div style="
    border-top:1px dashed #d1d5db;
    margin:4px 0;
"></div>



<!-- Net Salary -->

<div style="
    background:linear-gradient(135deg,#ecfdf5,#d1fae5);
    color:#065f46;
    border-radius:18px;
    padding:clamp(18px,5vw,22px);
    text-align:center;
    box-sizing:border-box;
">

<div style="
    font-size:clamp(13px,3vw,15px);
    opacity:.9;
    margin-bottom:8px;
">
Net Salary
</div>


<div style="
    font-size:clamp(26px,8vw,36px);
    font-weight:800;
    letter-spacing:0.5px;
    overflow-wrap:anywhere;
">
${finalSalary.toFixed(2)}
</div>


<div style="
    margin-top:10px;
    font-size:clamp(12px,3vw,14px);
    opacity:.9;
">
✅ Amount you'll receive
</div>


</div>


</div>

</div>`;
}
