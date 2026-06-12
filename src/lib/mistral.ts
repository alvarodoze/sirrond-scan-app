import {
  buildMistralJsonSchema,
  MISTRAL_OCR_PROMPT,
  type WexReferralData,
} from "@/schema/wex-referral";

const MISTRAL_OCR_URL = "https://api.mistral.ai/v1/ocr";
const MODEL = "mistral-ocr-latest";

export async function extractWexReferralFromImage(
  imageBase64: string,
  mimeType: string
): Promise<WexReferralData> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not configured");
  }

  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  const response = await fetch(MISTRAL_OCR_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      document: { type: "image_url", image_url: dataUrl },
      document_annotation_format: {
        type: "json_schema",
        json_schema: {
          name: "wex_referral",
          strict: true,
          schema: buildMistralJsonSchema(),
        },
      },
      document_annotation_prompt: MISTRAL_OCR_PROMPT,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mistral OCR failed (${response.status}): ${text}`);
  }

  const result = await response.json();
  const annotation = result.document_annotation;

  if (!annotation) {
    throw new Error("No structured data returned from Mistral OCR");
  }

  const parsed =
    typeof annotation === "string" ? JSON.parse(annotation) : annotation;

  return parsed as WexReferralData;
}
