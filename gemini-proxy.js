/**
 * Deno Deploy for Gemini API Proxy Server (Final Corrected Version)
 * This version correctly handles environment variables in the Deno Deploy environment.
 */

export default {
  // 1. 여기에 'env'를 추가하여 Deno Deploy가 주는 비밀 정보 바구니를 받습니다.
  async fetch(req, env) {
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
      
      // 2. Deno.env.get() 대신, 전달받은 env 바구니에서 API 키를 직접 꺼냅니다.
      const apiKey = env.GEMINI_API_KEY;

      if (!apiKey) {
        console.error("GEMINI_API_KEY is not set in Deno Deploy settings.");
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
        status: apiResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
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

