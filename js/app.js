const categorySelect = document.getElementById("category");
const statusMessage = document.getElementById("status");

function loadCategories() {
  statusMessage.textContent = "Loading categories...";

  getCategories()
    .then(categories => {
      // Empty results
      if (!categories || categories.length === 0) {
        statusMessage.textContent = "No categories found.";
        return;
      }

      // DOM manipulation... add one <option> per category
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.strCategory;
        option.textContent = cat.strCategory;
        categorySelect.appendChild(option);
      });

      statusMessage.textContent = "";
    })
    .catch(error => {
      // failed API request
      statusMessage.textContent = "Could not load categories. Check your internet connection.";
      console.error(error);
    });
}


// Event- run when the page has finished loading
document.addEventListener("DOMContentLoaded", loadCategories);

const mealList = document.getElementById("meal-list");

// DOM manipulation... build one card per meal
function renderMeals(meals) {
  mealList.innerHTML = "";   // clear the previous results

  meals.forEach(meal => {
    const card = document.createElement("div");
    card.className = "meal-card";
    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h3>${meal.strMeal}</h3>
    `;
    card.addEventListener("click", () => showMealDetails(meal.idMeal));
    mealList.appendChild(card);
  });
}

function loadMeals() {
  const category = categorySelect.value;
  mealList.innerHTML = "";

  // Invalid input: nothing selected
  if (category === "") {
    statusMessage.textContent = "Please select a category.";
    return;
  }

  statusMessage.textContent = "Loading meals...";

  getMealsByCategory(category)
    .then(meals => {
      // Empty results: TheMealDB returns null when nothing matches
      if (!meals || meals.length === 0) {
        statusMessage.textContent = "No meals found in " + category + ".";
        return;
      }

      renderMeals(meals);
      statusMessage.textContent = meals.length + " meals found in " + category + ".";
    })
    .catch(error => {
      statusMessage.textContent = "Could not load meals. Check your internet connection.";
      console.error(error);
    });
}

// Event: run when the user picks a different category
categorySelect.addEventListener("change", loadMeals);

const mealDetails = document.getElementById("meal-details");

function showMealDetails(id) {
  statusMessage.textContent = "Loading recipe...";

  getMealDetails(id)
    .then(meal => {
      // Empty result
      if (!meal) {
        statusMessage.textContent = "Recipe details not found.";
        return;
      }

      // DOM manipulation: build the ingredient list items
      const ingredientItems = getIngredients(meal)
        .map(i => `<li>${i.measure} ${i.name}</li>`)
        .join("");
      
      // build recipe panel as html text and put api data inside
      // show on page using innerHTML
      mealDetails.innerHTML = `
      <h2>${meal.strMeal}</h2>
      <p><strong>Category:</strong> ${meal.strCategory} |
      <strong>Cuisine:</strong> ${meal.strArea}</p>
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" width="250">
      <h3>Ingredients</h3>
      <ul>${ingredientItems}</ul>
      <h3>Instructions</h3>
      <p>${meal.strInstructions}</p>
      <h3>Estimate Shopping Cost</h3>
      <label for="servings">Servings:</label>
      <input type="number" id="servings" value="4">
      <label for="avg-price">Average price per ingredient (RM):</label>
      <input type="number" id="avg-price" step="0.01" placeholder="e.g. 3.50">
      <button id="calc-btn">Calculate</button>
      <p id="calc-result"></p>

      <h3>Add to Meal Plan</h3>
      <label for="plan-day">Day:</label>
      <select id="plan-day">
        <option value="">-- Select day --</option>
        <option>Monday</option>
        <option>Tuesday</option>
        <option>Wednesday</option>
        <option>Thursday</option>
        <option>Friday</option>
        <option>Saturday</option>
        <option>Sunday</option>
      </select>

      <label for="plan-type">Meal type:</label>
      <select id="plan-type">
        <option value="">-- Select meal type --</option>
        <option>Breakfast</option>
        <option>Lunch</option>
        <option>Dinner</option>
      </select>

      <label for="plan-note">Note (optional):</label>
      <input type="text" id="plan-note" maxlength="50" placeholder="e.g. cook for guests">

      <button id="plan-btn">Add to Meal Plan</button>
      <p id="plan-message"></p>
    `;

      const ingredientCount = getIngredients(meal).length;
      document.getElementById("calc-btn")
        .addEventListener("click", () => handleCalculate(ingredientCount));
      document.getElementById("plan-btn")
        .addEventListener("click", () => handleAddPlan(meal));

      mealDetails.scrollIntoView({ behavior: "smooth" });
      statusMessage.textContent = "";
    })
    .catch(error => {
      statusMessage.textContent = "Could not load the recipe. Check your internet connection.";
      console.error(error);
    });
}
const suggestionBox = document.getElementById("suggestion");

function handleSuggest() {
  const category = categorySelect.value;
  const ingredient = document.getElementById("ingredient").value;
  const effort = document.getElementById("effort").value;

  // Invalid input checks
  if (category === "") {
    suggestionBox.textContent = "Please select a category first.";
    return;
  }
  if (ingredient.trim() !== "" && !/^[a-zA-Z\s]+$/.test(ingredient.trim())) {
    suggestionBox.textContent = "Ingredient must contain letters only.";
    return;
  }

  suggestionBox.textContent = "Finding a suggestion...";

  getMealsByCategory(category)
    .then(meals => {
      if (!meals || meals.length === 0) {
        suggestionBox.textContent = "No meals found in " + category + ".";
        return;
      }

      // check the first 8 meals, then run the suggestion logic on their details
      return getDetailsForMeals(meals, 8).then(details => {
        const result = suggestRecipe(details, ingredient, effort);

        if (!result.found) {
          suggestionBox.textContent = result.message;   // fallback message
          return;
        }

        // Show the suggestion with a button to open the full recipe
        suggestionBox.innerHTML = `<p><strong>${result.message}</strong></p>
      <button id="view-suggested">View recipe</button>`;
        document.getElementById("view-suggested")
          .addEventListener("click", () => showMealDetails(result.meal.idMeal));

        // Store the suggestion in Local Storage
        saveSuggestion({
          category: category,
          ingredient: ingredient.trim(),
          effort: effort,
          mealId: result.meal.idMeal,
          mealName: result.meal.strMeal,
          date: new Date().toLocaleString()
        });
      });
    })
    .catch(error => {
      suggestionBox.textContent = "Could not get a suggestion. Check your internet connection.";
      console.error(error);
    });
}

// Event: user clicks the suggest button
document.getElementById("suggest-btn").addEventListener("click", handleSuggest);

function handleCalculate(ingredientCount) {
  const servingsText = document.getElementById("servings").value;
  const priceText = document.getElementById("avg-price").value;
  const resultBox = document.getElementById("calc-result");

  const error = validateCostInputs(servingsText, priceText);
  if (error !== null) {
    resultBox.textContent = error;   // feedback for invalid input
    return;
  }

  const result = calculateCost(ingredientCount, Number(servingsText), Number(priceText));

  // Clear labels and units
  resultBox.innerHTML = `
    Ingredients: ${ingredientCount}<br>
    Estimated total cost: <strong>RM ${result.total.toFixed(2)}</strong><br>
    Cost per serving: <strong>RM ${result.perServing.toFixed(2)}</strong>`;
}

function handleAddPlan(meal) {
  const day = document.getElementById("plan-day").value;
  const mealType = document.getElementById("plan-type").value;
  const note = document.getElementById("plan-note").value.trim();
  const message = document.getElementById("plan-message");

  // Input validation
  if (day === "" || mealType === "") {
    message.textContent = "Please choose both a day and a meal type.";
    return;
  }

  // Block duplicates: same meal on the same day and meal type
  const existing = loadMealPlans();
  const isDuplicate = existing.some(p =>
    p.mealId === meal.idMeal && p.day === day && p.mealType === mealType
  );
  if (isDuplicate) {
    message.textContent = "This meal is already planned for " + day + " (" + mealType + ").";
    return;
  }

  // Build the record: API data (mealId, mealName) + user details (day, type, note)
  const plan = {
    id: Date.now(),            // unique id.. will be used by update and delete
    mealId: meal.idMeal,
    mealName: meal.strMeal,
    day: day,
    mealType: mealType,
    note: note
  };

  addMealPlan(plan);
  message.textContent = meal.strMeal + " added to your plan for " + day + " (" + mealType + ").";
}
