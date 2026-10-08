let subscriptions =
    JSON.parse(localStorage.getItem("subscriptions")) || [];

let budget =
    Number(localStorage.getItem("budget")) || 5000;

function saveData() {
    localStorage.setItem(
        "subscriptions",
        JSON.stringify(subscriptions)
    );
}

function saveBudget() {
    localStorage.setItem("budget", budget);
}

function money(amount) {
    return "₹" + Number(amount).toFixed(2);
}


function getMonthlyCost(item) {

    if (item.billing === "Yearly") {
        return item.cost / 12;
    }

    return item.cost;
}


function getTotalMonthlyCost() {

    let total = 0;

    subscriptions.forEach(function(item) {
        total += getMonthlyCost(item);
    });

    return total;
}


function formatDate(date) {

    if (!date) return "";

    let d = new Date(date + "T00:00:00");

    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function getDaysLeft(date) {

    let today = new Date();

    today.setHours(0, 0, 0, 0);

    let paymentDate =
        new Date(date + "T00:00:00");

    let difference =
        paymentDate - today;

    return Math.ceil(
        difference / (1000 * 60 * 60 * 24)
    );
}

function updateSummary() {

    let monthly =
        getTotalMonthlyCost();

    let yearly =
        monthly * 12;

    let monthlyElement =
        document.getElementById("monthlyCost");

    let yearlyElement =
        document.getElementById("yearlyCost");

    let countElement =
        document.getElementById("activeCount");

    if (monthlyElement)
        monthlyElement.textContent = money(monthly);

    if (yearlyElement)
        yearlyElement.textContent = money(yearly);

    if (countElement)
        countElement.textContent =
            subscriptions.length;

    updateBudget();
    updateSpendingStatus();
    updateSavingSuggestion();
}

let form =
    document.getElementById("subscriptionForm");

if (form) {

    form.addEventListener("submit", function(event) {

        event.preventDefault();

        let name =
            document.getElementById("subscriptionName").value.trim();

        let category =
            document.getElementById("category").value;

        let cost =
            Number(document.getElementById("cost").value);

        let billing =
            document.getElementById("billingCycle").value;

        let date =
            document.getElementById("billingDate").value;


        if (!name || cost <= 0 || !date) {

            alert("Please enter valid details.");

            return;
        }


        subscriptions.push({

            id: Date.now(),

            name: name,

            category: category,

            cost: cost,

            billing: billing,

            date: date
        });


        saveData();

        form.reset();

        alert("Subscription added successfully!");

        updateAll();
    });
}


// ===============================
// DISPLAY SUBSCRIPTIONS
// ===============================

function displaySubscriptions() {

    let list =
        document.getElementById("subscriptionList");

    if (!list) return;


    let search =
        document.getElementById("searchInput")?.value.toLowerCase() || "";

    let category =
        document.getElementById("filterCategory")?.value || "All";

    let billing =
        document.getElementById("filterBilling")?.value || "All";


    let filtered =
        subscriptions.filter(function(item) {

            let matchSearch =
                item.name.toLowerCase().includes(search);

            let matchCategory =
                category === "All" ||
                item.category === category;

            let matchBilling =
                billing === "All" ||
                item.billing === billing;

            return (
                matchSearch &&
                matchCategory &&
                matchBilling
            );
        });


    list.innerHTML = "";


    if (filtered.length === 0) {

        list.innerHTML =
            "<p>No subscriptions found.</p>";

        return;
    }


    filtered.forEach(function(item) {

        let div =
            document.createElement("div");

        div.className = "subscription";


        div.innerHTML = `

            <div class="service-icon">
                💳
            </div>

            <div class="service-info">

                <strong>${item.name}</strong>

                <span>${item.category}</span>

            </div>

            <div class="service-price">

                <strong>${money(item.cost)}</strong>

                <span>${item.billing}</span>

            </div>

            <div class="service-date">

                ${formatDate(item.date)}

            </div>

            <div class="action-buttons">

                <button
                    class="edit-btn"
                    onclick="editSubscription(${item.id})">
                    ✏️
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteSubscription(${item.id})">
                    🗑️
                </button>

            </div>
        `;


        list.appendChild(div);
    });
}


// ===============================
// DELETE
// ===============================

function deleteSubscription(id) {

    if (!confirm("Delete this subscription?"))
        return;


    subscriptions =
        subscriptions.filter(function(item) {

            return item.id !== id;

        });


    saveData();

    updateAll();
}


// ===============================
// EDIT
// ===============================

function editSubscription(id) {

    let item =
        subscriptions.find(function(item) {

            return item.id === id;

        });


    if (!item) return;


    let name =
        prompt(
            "Subscription name:",
            item.name
        );

    let cost =
        prompt(
            "Cost:",
            item.cost
        );

    let date =
        prompt(
            "Billing date (YYYY-MM-DD):",
            item.date
        );


    if (name && cost && date) {

        item.name = name;

        item.cost = Number(cost);

        item.date = date;

        saveData();

        updateAll();
    }
}


// ===============================
// RENEWAL COUNTDOWN
// ===============================

function getRenewalText(date) {

    let days =
        getDaysLeft(date);


    if (days < 0) {

        return "Payment date passed";

    }

    if (days === 0) {

        return "🔴 Payment is today";

    }

    if (days === 1) {

        return "🟠 Payment is tomorrow";

    }

    if (days <= 7) {

        return "🟡 Renewing in " +
            days +
            " days";

    }

    return "Renewing in " +
        days +
        " days";
}


// ===============================
// RENEWALS
// ===============================

function displayRenewals() {

    let box =
        document.getElementById("reminderList");

    if (!box) return;


    box.innerHTML = "";


    let sorted =
        [...subscriptions].sort(function(a, b) {

            return new Date(a.date) -
                new Date(b.date);

        });


    sorted.forEach(function(item) {

        let div =
            document.createElement("div");

        div.className = "renewal-item";


        div.innerHTML = `

            <div>

                <strong>${item.name}</strong>

                <span>
                    ${formatDate(item.date)}
                </span>

            </div>

            <div class="renewal-date">

                ${getRenewalText(item.date)}

            </div>
        `;


        box.appendChild(div);
    });


    if (subscriptions.length === 0) {

        box.innerHTML =
            "<p>No upcoming renewals.</p>";
    }
}


// ===============================
// DASHBOARD SUBSCRIPTIONS
// ===============================

function displayDashboardSubscriptions() {

    let box =
        document.getElementById(
            "dashboardSubscriptions"
        );

    if (!box) return;


    box.innerHTML = "";


    subscriptions
        .slice(0, 5)
        .forEach(function(item) {

            let div =
                document.createElement("div");

            div.className = "subscription";


            div.innerHTML = `

                <div class="service-icon">
                    💳
                </div>

                <div class="service-info">

                    <strong>
                        ${item.name}
                    </strong>

                    <span>
                        ${item.category}
                    </span>

                </div>

                <div class="service-price">

                    ${money(item.cost)}

                </div>
            `;


            box.appendChild(div);
        });


    if (subscriptions.length === 0) {

        box.innerHTML =
            "<p>No subscriptions added yet.</p>";
    }
}


// ===============================
// DASHBOARD RENEWALS
// ===============================

function displayDashboardRenewals() {

    let box =
        document.getElementById(
            "dashboardRenewals"
        );

    if (!box) return;


    box.innerHTML = "";


    subscriptions
        .slice()
        .sort(function(a, b) {

            return new Date(a.date) -
                new Date(b.date);

        })
        .slice(0, 5)
        .forEach(function(item) {

            let div =
                document.createElement("div");

            div.className =
                "renewal-item";


            div.innerHTML = `

                <div>

                    <strong>
                        ${item.name}
                    </strong>

                    <span>
                        ${formatDate(item.date)}
                    </span>

                </div>

                <div class="renewal-date">

                    ${getRenewalText(item.date)}

                </div>
            `;


            box.appendChild(div);
        });


    if (subscriptions.length === 0) {

        box.innerHTML =
            "<p>No upcoming renewals.</p>";
    }
}


// ===============================
// ANALYTICS
// ===============================

function displayAnalytics() {

    let categoryBox =
        document.getElementById(
            "categoryBreakdown"
        );

    let billingBox =
        document.getElementById(
            "billingBreakdown"
        );


    if (categoryBox) {

        let categories = {};


        subscriptions.forEach(function(item) {

            let cost =
                getMonthlyCost(item);

            if (!categories[item.category]) {

                categories[item.category] = 0;

            }

            categories[item.category] += cost;
        });


        categoryBox.innerHTML = "";


        for (let category in categories) {

            let percent =
                getTotalMonthlyCost() > 0
                ? categories[category] /
                  getTotalMonthlyCost() * 100
                : 0;


            categoryBox.innerHTML += `

                <div class="category-row">

                    <div>
                        <strong>
                            ${category}
                        </strong>

                        <span>
                            ${money(categories[category])}
                        </span>
                    </div>

                    <div class="progress">

                        <div
                            class="progress-bar"
                            style="width:${percent}%">
                        </div>

                    </div>

                </div>
            `;
        }
    }


    if (billingBox) {

        let monthly = 0;

        let yearly = 0;


        subscriptions.forEach(function(item) {

            if (item.billing === "Monthly") {

                monthly += item.cost;

            } else {

                yearly += item.cost;
            }
        });


        billingBox.innerHTML = `

            <p>
                Monthly Billing:
                <strong>${money(monthly)}</strong>
            </p>

            <p>
                Yearly Billing:
                <strong>${money(yearly)}</strong>
            </p>
        `;
    }
}


// ===============================
// REMINDERS PAGE
// ===============================

function displayReminders() {

    let box =
        document.getElementById(
            "reminderList"
        );

    if (!box) return;

    displayRenewals();
}


// ===============================
// 💰 BUDGET FEATURE
// ===============================

function updateBudget() {

    let amount =
        document.getElementById("budgetAmount");

    let spent =
        document.getElementById("budgetSpent");

    let remaining =
        document.getElementById("budgetRemaining");

    let progress =
        document.getElementById("budgetProgress");


    if (!amount ||
        !spent ||
        !remaining ||
        !progress) {

        return;
    }


    let monthly =
        getTotalMonthlyCost();


    let left =
        budget - monthly;


    amount.textContent =
        money(budget);

    spent.textContent =
        money(monthly);


    if (left >= 0) {

        remaining.textContent =
            money(left);

    } else {

        remaining.textContent =
            "Over by " +
            money(Math.abs(left));
    }


    let percent =
        (monthly / budget) * 100;


    if (percent > 100)
        percent = 100;


    progress.style.width =
        percent + "%";


    if (monthly > budget) {

        progress.classList.add(
            "over-budget"
        );

    } else {

        progress.classList.remove(
            "over-budget"
        );
    }
}


// ===============================
// SET BUDGET
// ===============================

let budgetButton =
    document.getElementById(
        "setBudgetBtn"
    );


if (budgetButton) {

    budgetButton.addEventListener("click", function() {

        let input = document.getElementById("budgetInput");

        let newBudget = Number(input.value);

        if (newBudget > 0) {

            budget = newBudget;

            saveBudget();

            input.value = "";

            updateAll();

        } else {

            alert("Enter a valid budget");
        }
    });
}


// ===============================
// SPENDING STATUS
// ===============================

function updateSpendingStatus() {

    let status =
        document.getElementById(
            "spendingStatus"
        );


    if (!status) return;


    let monthly =
        getTotalMonthlyCost();


    let percent =
        monthly / budget * 100;


    if (percent < 50) {

        status.textContent =
            "🟢 Low spending";

    } else if (percent < 80) {

        status.textContent =
            "🟡 Moderate spending";

    } else {

        status.textContent =
            "🔴 High spending";
    }
}


// ===============================
// 💡 SAVING SUGGESTION
// ===============================

function updateSavingSuggestion() {

    let box =
        document.getElementById(
            "savingSuggestion"
        );


    if (!box) return;


    let monthly =
        getTotalMonthlyCost();


    if (subscriptions.length === 0) {

        box.textContent =
            "💡 Add subscriptions to get saving suggestions.";

        return;
    }


    if (monthly > budget) {

        box.textContent =
            "💡 Your subscription spending is above your budget. Review unused subscriptions.";

        return;
    }


    if (subscriptions.length >= 5) {

        box.textContent =
            "💡 You have many subscriptions. Cancel services you do not use.";

        return;
    }


    box.textContent =
        "💡 Your subscription spending is within your budget.";
}


// ===============================
// 🌙 DARK MODE
// ===============================

let darkMode =
    localStorage.getItem("darkMode") === "true";


function applyDarkMode() {

    if (darkMode) {

        document.body.classList.add("dark");

    } else {

        document.body.classList.remove("dark");
    }
}


let darkButton =
    document.getElementById(
        "darkModeBtn"
    );


if (darkButton) {

    darkButton.addEventListener(
        "click",
        function() {

            darkMode = !darkMode;

            localStorage.setItem(
                "darkMode",
                darkMode
            );

            applyDarkMode();
        }
    );
}


applyDarkMode();


// ===============================
// SEARCH
// ===============================

let searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        displaySubscriptions
    );
}


// ===============================
// FILTERS
// ===============================

let categoryFilter =
    document.getElementById(
        "filterCategory"
    );


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        displaySubscriptions
    );
}


let billingFilter =
    document.getElementById(
        "filterBilling"
    );


if (billingFilter) {

    billingFilter.addEventListener(
        "change",
        displaySubscriptions
    );
}


// ===============================
// UPDATE EVERYTHING
// ===============================

function updateAll() {

    updateSummary();

    displaySubscriptions();

    displayRenewals();

    displayDashboardSubscriptions();

    displayDashboardRenewals();

    displayAnalytics();

    displayReminders();
}


// Start website
updateAll();