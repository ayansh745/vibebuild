import JSZip from "jszip";

const apiKey = "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";

const SYSTEM_PROMPT = `
You are an elite frontend developer.

Generate a complete modern website using:
- HTML
- CSS
- Vanilla JavaScript

IMPORTANT:
Return ONLY raw JSON.
DO NOT wrap response in markdown.
DO NOT use \`\`\`.
DO NOT explain anything.

Response format:
{
  "html": "...",
  "css": "...",
  "js": "..."
}

Requirements:
- Modern GenZ UI
- Beautiful gradients
- Responsive
- Smooth animations
- Professional layout
`;

export async function generateWebsite(userPrompt) {
  try {

    // API CALL
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },

        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",

          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },

            {
              role: "user",
              content: userPrompt,
            },
          ],

          temperature: 0.8,
          max_tokens: 6000,
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    // RAW AI RESPONSE
    const raw =
      data?.choices?.[0]?.message?.content;

    if (!raw) {
      throw new Error("No response from AI");
    }

    // CLEAN RESPONSE
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // PARSE JSON
    const website = JSON.parse(cleaned);

    // ZIP
    const zip = new JSZip();

    // HTML
    zip.file(
      "index.html",
`
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>AI Generated Website</title>

  <link rel="stylesheet" href="style.css" />
</head>

<body>

${website.html}

<script src="script.js"></script>

</body>
</html>
`
    );

    // CSS
    zip.file(
      "style.css",
      website.css
    );

    // JS
    zip.file(
      "script.js",
      website.js
    );

    // GENERATE ZIP
    const blob = await zip.generateAsync({
      type: "blob",
    });

    return blob;

  } catch (error) {
    console.error(error);
    throw error;
  }
}