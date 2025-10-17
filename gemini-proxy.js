/**
 * Deno Deploy를 위한 Gemini API 프록시 서버
 * 이 코드는 Deno 환경에서 실행됩니다.
 * * 기능:
 * 1. GitHub Pages (프론트엔드)로부터 오는 API 요청을 안전하게 받습니다. (CORS 처리 포함)
 * 2. 서버에만 저장된 GEMINI_API_KEY를 사용하여 Google AI 서버와 통신합니다.
 * 3. Google AI의 응답을 다시 프론트엔드로 전달합니다.
 */
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

// Deno Deploy 서버를 실행하고 요청을 기다립니다.
serve(async (req) => {
  // 브라우저가 실제 요청을 보내기 전에 보내는 'preflight' 요청(OPTIONS)을 처리합니다.
  // "다른 도메인에서 오는 요청을 허용해줘"라는 의미입니다.
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*", // 모든 도메인에서의 요청을 허용합니다.
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // POST 방식의 요청만 처리합니다.
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // 프론트엔드에서 보낸 요청 데이터를 JSON 형태로 파싱합니다.
    const requestBody = await req.json();
    
    // Deno Deploy 서버에 설정한 환경 변수에서 API 키를 안전하게 가져옵니다.
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set.");
      return new Response(JSON.stringify({ error: { message: "API key is not configured on the server." } }), { status: 500 });
    }

    const apiUrl = `https://generativellanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // 실제 Google AI 서버로 요청을 보냅니다.
    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    // Google AI 서버의 응답을 그대로 받아옵니다.
    const data = await apiResponse.json();
    
    if (!apiResponse.ok) {
        // Google API가 에러를 반환한 경우, 그 내용을 프론트엔드로 전달합니다.
        console.error("Google API Error:", data);
        return new Response(JSON.stringify(data), {
            status: apiResponse.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }

    // 성공적인 응답을 프론트엔드로 전달합니다.
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // 응답 헤더에도 CORS 정책을 포함해야 합니다.
      },
    });

  } catch (error) {
    console.error("Proxy Server Error:", error);
    return new Response(JSON.stringify({ error: { message: "Internal Server Error" } }), { status: 500 });
  }
});
