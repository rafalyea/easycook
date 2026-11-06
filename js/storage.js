const SUGGESTIONS_KEY = "easycook_suggestions";

// Load saved suggestions (empty array first time)
function loadSuggestions() {
  return JSON.parse(localStorage.getItem(SUGGESTIONS_KEY)) || [];
}

// Save a new suggestion record
function saveSuggestion(record) {
  const all = loadSuggestions();
  all.push(record);
  localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(all));
}

const MEALPLANS_KEY = "easycook_mealplans";

// Read: load all saved meal plans (empty array the first time)
function loadMealPlans() {
  return JSON.parse(localStorage.getItem(MEALPLANS_KEY)) || [];
}

// Save the whole array back to Local Storage
function saveMealPlans(plans) {
  localStorage.setItem(MEALPLANS_KEY, JSON.stringify(plans));
}

// Create: add one new meal plan record
function addMealPlan(plan) {
  const plans = loadMealPlans();
  plans.push(plan);
  saveMealPlans(plans);
}

// Update: change fields of one record, found by its id
function updateMealPlan(id, changes) {
  const plans = loadMealPlans();
  const index = plans.findIndex(p => p.id === id);
  if (index === -1) return false;              // record not found

  plans[index] = { ...plans[index], ...changes };   // keep old fields, overwrite changed ones
  saveMealPlans(plans);
  return true;
}

// Delete: keep every record except the one with this id
function deleteMealPlan(id) {
  const plans = loadMealPlans().filter(p => p.id !== id);
  saveMealPlans(plans);
}