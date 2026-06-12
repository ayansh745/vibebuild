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

const cleanGeminiText = (text) => {
  if (!text) {
    return "";
  }

  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .trim();
};

const tryParseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const parseJSONStringLiteral = (text, startIndex) => {
  if (text[startIndex] !== '"') {
    return null;
  }

  let value = "";
  let escaped = false;

  for (let i = startIndex + 1; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      switch (char) {
        case '"':
          value += '"';
          break;
        case '\\':
          value += '\\';
          break;
        case '/':
          value += '/';
          break;
        case 'b':
          value += '\b';
          break;
        case 'f':
          value += '\f';
          break;
        case 'n':
          value += '\n';
          break;
        case 'r':
          value += '\r';
          break;
        case 't':
          value += '\t';
          break;
        case 'u': {
          const hex = text.slice(i + 1, i + 5);
          if (/^[0-9a-fA-F]{4}$/.test(hex)) {
            value += String.fromCharCode(parseInt(hex, 16));
            i += 4;
          }
          break;
        }
        default:
          value += char;
      }
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      return { value, endIndex: i + 1 };
    }

    value += char;
  }

  return null;
};

const extractFieldValue = (text, key) => {
  const keyPattern = new RegExp(`"${key}"\s*:\s*`, "i");
  const match = keyPattern.exec(text);
  if (!match) {
    return undefined;
  }

  let index = match.index + match[0].length;
  while (index < text.length && /\s/.test(text[index])) {
    index += 1;
  }

  if (text[index] !== '"') {
    return undefined;
  }

  const parsed = parseJSONStringLiteral(text, index);
  if (parsed) {
    return parsed.value;
  }

  const nextKeyPattern = /"\s*(?:html|css|js|readme)"\s*:\s*/gi;
  nextKeyPattern.lastIndex = index + 1;
  const nextKeyMatch = nextKeyPattern.exec(text);
  const rawValue = nextKeyMatch
    ? text.slice(index + 1, nextKeyMatch.index).trim()
    : text.slice(index + 1).trim();

  const endQuote = rawValue.lastIndexOf('"');
  const valueBody = endQuote !== -1 ? rawValue.slice(0, endQuote) : rawValue;

  return valueBody
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
};

const findFirstJsonObject = (text) => {
  let depth = 0;
  let inString = false;
  let escaped = false;
  let startIndex = -1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        startIndex = i;
      }
      depth += 1;
      continue;
    }

    if (char === "}") {
      if (depth === 0) {
        continue;
      }
      depth -= 1;
      if (depth === 0 && startIndex !== -1) {
        return text.slice(startIndex, i + 1);
      }
    }
  }

  return null;
};

const isFullHtmlDocument = (html) => {
  return /^\s*<!doctype html>|^\s*<html/i.test(html);
};

const extractWebsite = (raw) => {
  const cleanedText = cleanGeminiText(raw);
  if (!cleanedText) {
    throw new Error("Invalid JSON returned by Gemini");
  }

  const directParse = tryParseJSON(cleanedText);
  if (directParse && typeof directParse === "object") {
    return directParse;
  }

  const jsonObjectText = findFirstJsonObject(cleanedText);
  if (jsonObjectText) {
    const parsed = tryParseJSON(jsonObjectText);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  }

  const website = {
    html: extractFieldValue(cleanedText, "html") || "",
    css: extractFieldValue(cleanedText, "css") || "",
    js: extractFieldValue(cleanedText, "js") || "",
    readme: extractFieldValue(cleanedText, "readme"),
  };

  if (website.html || website.css || website.js || website.readme) {
    return website;
  }

  if (isFullHtmlDocument(cleanedText)) {
    return { html: cleanedText };
  }

  throw new Error("Invalid JSON returned by Gemini");
};

export async function generateWebsite(userPrompt) {
  try {
    const response = await fetch("/api/generate-website", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPrompt, systemPrompt: SYSTEM_PROMPT }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to generate website");
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      throw new Error("Gemini returned empty response");
    }

    let website;
    try {
      website = extractWebsite(raw);
    } catch (error) {
      console.error("Gemini raw response:", raw);
      throw error;
    }

    if (!website.html) {
      throw new Error("Missing HTML from Gemini");
    }

    const html = website.html || "";
    const css = website.css || "";
    const js = website.js || "";
    const readme = website.readme || "# AI Generated Website\n\nGenerated with Gemini.";

    const fullHtml = isFullHtmlDocument(html)
      ? html
      : `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Generated Website</title>
${css ? '<link rel="stylesheet" href="style.css">' : ""}
</head>
<body>

${html}

${js ? '<script src="script.js"></script>' : ""}
</body>
</html>`;

    const previewHTML = isFullHtmlDocument(html)
      ? html
      : `<!DOCTYPE html>
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
</script>
</body>
</html>`;

    const zip = new JSZip();
    zip.file("index.html", fullHtml);
    if (css) {
      zip.file("style.css", css);
    }
    if (js) {
      zip.file("script.js", js);
    }
    zip.file("README.md", readme);

    const blob = await zip.generateAsync({ type: "blob" });

    return { blob, previewHTML };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
