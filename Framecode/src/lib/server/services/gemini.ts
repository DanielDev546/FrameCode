import { GEMINI_API_KEY } from "$env/static/private";

export async function analyzeConversion(code: string, fileName: string) {
  const prompt = `You are a conversion rate optimization expert reviewing a landing page's source code.

File: ${fileName}

\`\`\`
${code.slice(0, 12000)}
\`\`\`

Analyze this page for conversion optimization. Respond with ONLY valid JSON in this exact shape, no markdown fences, no extra text:
{
  "score": <integer 0-100>,
  "summary": "<one paragraph overall assessment>",
  "strengths": ["<point>", "<point>"],
  "improvements": ["<point>", "<point>", "<point>"]
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini API error: ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse Gemini response as JSON");
  }
}
