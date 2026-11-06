const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// get list of recipe categories (beef, dessert, seafood..)
function getCategories() {
  return fetch(`${BASE_URL}/categories.php`)
    .then(response => {
      // Failed request 
      if (!response.ok) {
        throw new Error("Server responded with status " + response.status);
      }
      return response.json();   // parse JSON response body into a JS object
    })
    .then(data => data.categories);   // the array needed
}

// Get all meals in one category (returns name, image and ID )
function getMealsByCategory(category) {
  return fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Server responded with status " + response.status);
      }
      return response.json();
    })
    .then(data => data.meals);   // an array, or null if nothing was found
}

// get full details of one meal by its ID
function getMealDetails(id) {
  return fetch(`${BASE_URL}/lookup.php?i=${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Server responded with status " + response.status);
      }
      return response.json();
    })
    .then(data => data.meals ? data.meals[0] : null);   // one meal object, or null
}

// API stores ingredients as strIngredient1..20 and
function getIngredients(meal) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal["strIngredient" + i];
    const measure = meal["strMeasure" + i];
    if (name && name.trim() !== "") {
      list.push({ name: name.trim(), measure: (measure || "").trim() });
    }
  }
  return list;
}

// fetch full details for the first few meals at the same time
function getDetailsForMeals(meals, limit) {
  const requests = meals.slice(0, limit).map(m => getMealDetails(m.idMeal));
  return Promise.all(requests)
    .then(results => results.filter(meal => meal !== null));
}
