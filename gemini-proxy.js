/**
 * Deno Deploy for Gemini API Proxy Server (Upgraded Version)
 * This version uses the recommended 'export default' handler for better compatibility.
 */

// Deno Deploy가 요청을 받으면 이 default 객체의 fetch 함수를 자동으로 실행합니다.
export default {
  async fetch(req) {
    // CORS preflight 요청(OPTIONS)을 먼저 처리합니다.
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // POST 요청이 아니면 거부합니다.
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const requestBody = await req.json();
      // Deno Deploy는 환경 변수를 env 객체에서 직접 가져올 수 있습니다.
      // Deno.env.get() 대신 이 방식을 사용합니다.
      const apiKey = Deno.env.get("GEMINI_API_KEY");

      if (!apiKey) {
        console.error("GEMINI_API_KEY is not set.");
        return new Response(JSON.stringify({ error: { message: "API key is not configured." } }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      const apiUrl = `https://generativellanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const apiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await apiResponse.json();

      return new Response(JSON.stringify(data), {
        status: apiResponse.status, // Google API의 상태 코드를 그대로 전달
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // 최종 응답에도 CORS 헤더 포함
        },
      });

    } catch (error) {
      console.error("Proxy Server Error:", error);
      return new Response(JSON.stringify({ error: { message: "Internal Server Error" } }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};
```
