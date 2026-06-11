import JSZip from "jszip";

const API_KEY = "AQ.Ab8RN6IIr2Mm_LUflCgUsj_Y0j1wYmEytCZuM79u5eD7uBu1-w";

const SYSTEM_PROMPT = `
You are an expert frontend developer.

Generate a complete working website.

Return ONLY valid JSON.

{
  "html": "",
  "css": "",
  "js": "",
  "readme": ""
}

Rules:
- Return JSON only.
- No markdown.
- No explanations.
- Create a beautiful responsive website.
- Use modern HTML/CSS/JavaScript.
- All code must be production-ready.
`;

export async function generateWebsite(userPrompt) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_PROMPT}

USER REQUEST:
${userPrompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();

    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      throw new Error("Gemini returned empty response");
    }

    let website;

    try {
      website = JSON.parse(raw);
    } catch (err) {
      console.error(raw);
      throw new Error("Invalid JSON returned by Gemini");
    }

    if (!website.html) {
      throw new Error("Missing HTML from Gemini");
    }

    const html = website.html || "";
    const css = website.css || "";
    const js = website.js || "";
    const readme =
      website.readme ||
      "# AI Generated Website\n\nGenerated with Gemini.";

    const zip = new JSZip();

    zip.file(
      "index.html",
      `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Generated Website</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

${html}

<script src="script.js"><\/script>
</body>
</html>`
    );

    zip.file("style.css", css);

    zip.file("script.js", js);

    zip.file("README.md", readme);

    const blob = await zip.generateAsync({
      type: "blob",
    });

    const previewHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preview</title>
<style>
${css}
</style>
</head>
<body>

${html}

<script>
${js}
<\/script>
</body>
</html>
`;

    return {
      blob,
      previewHTML,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}