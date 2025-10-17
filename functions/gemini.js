// functions/gemini.js
const API_KEY = process.env.GEMINI_API_KEY;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const requestBody = JSON.parse(event.body);
    // [수정] Google AI 모델 이름을 안정적인 최신 버전으로 변경합니다.
    const model = 'gemini-1.5-flash-latest';
    const apiUrl = `https://generativellanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    const fetch = (await import('node-fetch')).default;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData); // 서버 로그에 에러 기록
      return { statusCode: response.status, body: JSON.stringify(errorData) };
    }

    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    console.error('Internal Server Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: { message: 'Internal Server Error' } }) };
  }
};

