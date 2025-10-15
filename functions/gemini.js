// functions/gemini.js
const API_KEY = process.env.GEMINI_API_KEY;

exports.handler = async (event) => {
  // Allow requests only from POST method
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const requestBody = JSON.parse(event.body);
    // Google Gemini API endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    // Use node-fetch for making HTTP requests in a Node.js environment
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    // Handle non-successful responses from the Google API
    if (!response.ok) {
      const errorData = await response.json();
      return { statusCode: response.status, body: JSON.stringify(errorData) };
    }

    // Parse the successful response and return it to the frontend
    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };

  } catch (error) {
    // Handle internal server errors
    console.error('Internal Server Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
