'use strict';
const fs = require("fs").promises
const Mustache = require("mustache")
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const restaurantsApiRoot = process.env.restaurants_api

let html

async function loadHtml() {
  if (!html) {
    html = await fs.readFile('static/index.html', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }
    })
  }
  return html
}

async function getRestaurants() {
  // Using dynamic import() for ES modules
  const fetch = await import('node-fetch')
  const response = await fetch.default(restaurantsApiRoot)
  
  // Check if the response status is OK (200)
  if (!response.ok) {
    throw new Error(`Failed to fetch restaurants: ${response.statusText}`);
  }

  // Parse the response body as JSON
  const data = await response.json();

  return data || [];
}

module.exports.handler = async (event, context) => {
  let template = await loadHtml()
  let restaurants = await getRestaurants()
  let dayOfWeek = days[new Date().getDay()]
  let html = Mustache.render(template, { dayOfWeek, restaurants })

  return {
    statusCode: 200,
    body: html,
    headers: {
      'Content-type': 'text/html; charset=UTF-8'
    }
  };
};
