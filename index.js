const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

const SWAPI_BASE_URL = 'https://swapi.dev/api';

// Search endpoint
app.get('/search', async (req, res) => {
  const category = req.query.category;
  const query = req.query.q;

  if (!category || !query) {
    return res.status(400).json({ error: "Missing 'category' or 'q' parameter" });
  }

  try {
    const result = await searchSWAPI(category, query);
    const formattedResults = formatResults(result.results, category);

    // Check if a sort parameter is provided
    if (req.query.sort) {
      const sortField = req.query.sort.toLowerCase();
      formattedResults.sort((a, b) => (a[sortField] > b[sortField] ? 1 : -1));
    }

    res.json({ category, count: result.count, results: formattedResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Sort endpoint
app.get('/sort', async (req, res) => {
  const category = req.query.category;
  const sortField = req.query.field;

  if (!category || !sortField) {
    return res.status(400).json({ error: "Missing 'category' or 'field' parameter" });
  }

  try {
    const result = await sortSWAPI(category, sortField);
    const formattedResults = formatResults(result.results, category);
    
    res.json({ category, count: result.count, results: formattedResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function formatResults(results, category) {
  return results.map(result => {
    return formatResult(result, category);
  });
}

function formatResult(result, category) {
  // Customize this function based on the specific structure of each category
  switch (category) {
    case 'people':
      return {
        name: result.name,
        height: result.height,
        mass: result.mass,
        // Add more fields as needed
      };
    case 'planets':
      return {
        name: result.name,
        climate: result.climate,
        terrain: result.terrain,
        // Add more fields as needed
      };
    case 'starships':
      return {
        name: result.name,
        model: result.model,
        manufacturer: result.manufacturer,
        // Add more fields as needed
      };
    default:
      return result;
  }
}

async function searchSWAPI(category, query) {
  const searchUrl = `${SWAPI_BASE_URL}/${category}/?search=${query}`;
  const response = await axios.get(searchUrl);
  return response.data;
}

async function sortSWAPI(category, field) {
  const sortUrl = `${SWAPI_BASE_URL}/${category}/?ordering=${field}`;
  const response = await axios.get(sortUrl);
  return response.data;
}

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
