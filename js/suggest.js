function suggestRecipe(meals, ingredient, effort) {
  let candidates = meals;
  const typed = ingredient.trim().toLowerCase();

  // Condition 1: ingredient the user has
  if (typed !== "") {
    candidates = candidates.filter(meal =>
      getIngredients(meal).some(i => i.name.toLowerCase().includes(typed))
    );
    if (candidates.length === 0) {
      return { found: false, message: `No recipe checked contains "${ingredient.trim()}". Try another ingredient or category.` };
    }
  }

  // Condition 2: cooking effort, based on the number of ingredients
  if (effort === "quick") {
    candidates = candidates.filter(meal => getIngredients(meal).length <= 8);
  } else if (effort === "normal") {
    candidates = candidates.filter(meal => {
      const count = getIngredients(meal).length;
      return count >= 9 && count <= 14;
    });
  }
  // effort === "any": no filtering

  // Fallback: nothing is left
  if (candidates.length === 0) {
    return { found: false, message: "No recipe matches that effort level. Try Normal or Any." };
  }

  // Suggest the simplest remaining recipe
  candidates.sort((a, b) => getIngredients(a).length - getIngredients(b).length);
  const best = candidates[0];
  const count = getIngredients(best).length;

  return {
    found: true,
    meal: best,
    message: `Try ${best.strMeal}! It has only ${count} ingredients.`
  };
}