const API_KEY = process.env.GEMINI_API_KEY;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const apiUrl = `https://generativellanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API Error Response:", errorText); 
      return { 
        statusCode: response.status, 
        body: JSON.stringify({ 
          error: 'Google API returned a non-JSON response.',
          details: errorText 
        }) 
      };
    }

    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };

  } catch (error) {
    console.error("Internal Server Error:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }) 
    };
  }
};