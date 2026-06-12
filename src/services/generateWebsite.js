import JSZip from "jszip";

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
    // Call backend proxy which handles authentication and Generative API calls
    const response = await fetch('/api/generate-website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userPrompt,
        systemPrompt: SYSTEM_PROMPT,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      throw new Error("Gemini returned empty response");
    }

    const extractJSON = (text) => {
      const cleaned = text
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/```$/, "")
        .trim();

      try {
        return JSON.parse(cleaned);
      } catch {
        const firstObject = cleaned.indexOf("{");
        const lastObject = cleaned.lastIndexOf("}");
        if (firstObject !== -1 && lastObject !== -1 && firstObject < lastObject) {
          const candidate = cleaned.slice(firstObject, lastObject + 1);
          try {
            return JSON.parse(candidate);
          } catch {
            // continue to fallback
          }
        }

        const firstArray = cleaned.indexOf("[");
        const lastArray = cleaned.lastIndexOf("]");
        if (firstArray !== -1 && lastArray !== -1 && firstArray < lastArray) {
          const candidate = cleaned.slice(firstArray, lastArray + 1);
          try {
            return JSON.parse(candidate);
          } catch {
            // continue to fallback
          }
        }

        throw new Error("Invalid JSON returned by Gemini");
      }
    };

    let website;

    try {
      website = extractJSON(raw);
    } catch (err) {
      console.error("Gemini raw response:", raw);
      throw err;
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