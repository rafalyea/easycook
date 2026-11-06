const BASE_SERVINGS = 4;   // assumed servings of the original recipe

// Input validation: returns an error message, or null if the inputs are valid
function validateCostInputs(servingsText, priceText) {
  if (servingsText.trim() === "" || priceText.trim() === "") {
    return "Please enter both servings and average price.";
  }

  const servings = Number(servingsText);
  const price = Number(priceText);

  if (isNaN(servings) || isNaN(price)) {
    return "Servings and price must be numbers.";
  }
  // not whole number
  if (!Number.isInteger(servings) || servings < 1 || servings > 20) {
    return "Servings must be a whole number from 1 to 20.";
  }
  if (price <= 0 || price > 100) {
    return "Average price must be more than 0 and at most RM 100.";
  }
  return null;
}

// calculation
function calculateCost(ingredientCount, servings, avgPrice) {
  const scale = servings / BASE_SERVINGS;
  const total = ingredientCount * avgPrice * scale;
  return { total: total, perServing: total / servings };
}

