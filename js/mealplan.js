const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const planList = document.getElementById("plan-list");
const planCount = document.getElementById("plan-count");
const actionMessage = document.getElementById("action-message");
const editForm = document.getElementById("edit-form");

let editingId = null;   // id of the record being edited, or null

// READ: load records from Local Storage and build the list
function renderPlans() {
  const plans = loadMealPlans();
  planList.innerHTML = "";   // clear the old list

  // Empty result
  if (plans.length === 0) {
    planCount.textContent = "No meal plans saved yet. Go to Recipe Explorer to add one.";
  }

  planCount.textContent = plans.length + " meal plan(s) saved.";
  plans.sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

  plans.forEach(plan => {
    const row = document.createElement("div");
    row.className = "plan-row";

    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = plan.mealName;
    const detail = document.createElement("div");
    detail.textContent = plan.day + " | " + plan.mealType + (plan.note ? " | " + plan.note : "");
    info.appendChild(title);
    info.appendChild(detail);

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEdit(plan));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => handleDelete(plan));

    row.appendChild(info);
    row.appendChild(editBtn);
    row.appendChild(deleteBtn);
    planList.appendChild(row);
  });
}

// UPDATE, part 1: show the form filled with the chosen record
function startEdit(plan) {
  editingId = plan.id;
  document.getElementById("edit-title").textContent = "Editing: " + plan.mealName;
  document.getElementById("edit-day").value = plan.day;
  document.getElementById("edit-type").value = plan.mealType;
  document.getElementById("edit-note").value = plan.note;
  editForm.hidden = false;
  actionMessage.textContent = "";
}

// UPDATE, part 2: validate and save the changes
function handleSaveEdit() {
  const day = document.getElementById("edit-day").value;
  const mealType = document.getElementById("edit-type").value;
  const note = document.getElementById("edit-note").value.trim();

  // Input validation
  if (day === "" || mealType === "") {
    actionMessage.textContent = "Please choose both a day and a meal type.";
    return;
  }

  // Block duplicates (ignore the record being edited)
  const current = loadMealPlans().find(p => p.id === editingId);
  const isDuplicate = loadMealPlans().some(p =>
    p.id !== editingId && p.mealId === current.mealId && p.day === day && p.mealType === mealType
  );
  if (isDuplicate) {
    actionMessage.textContent = "That meal is already planned for " + day + " (" + mealType + ").";
    return;
  }

  updateMealPlan(editingId, { day: day, mealType: mealType, note: note });
  editForm.hidden = true;
  editingId = null;
  actionMessage.textContent = "Meal plan updated.";
  renderPlans();
}

function handleCancelEdit() {
  editForm.hidden = true;
  editingId = null;
  actionMessage.textContent = "";
}

// DELETE: ask for confirmation, then remove
function handleDelete(plan) {
  if (!confirm("Delete " + plan.mealName + " (" + plan.day + ", " + plan.mealType + ")?")) {
    return;
  }
  deleteMealPlan(plan.id);

  if (editingId === plan.id) {   // the deleted record was open in the edit form
    handleCancelEdit();
  }
  actionMessage.textContent = plan.mealName + " deleted.";
  renderPlans();
}

// Events
document.getElementById("save-edit-btn").addEventListener("click", handleSaveEdit);
document.getElementById("cancel-edit-btn").addEventListener("click", handleCancelEdit);
document.addEventListener("DOMContentLoaded", renderPlans);