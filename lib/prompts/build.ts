import type { BuildOptions, SceneCard, Setting } from "./types";

const clean = (s: string, max: number) =>
  s
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁦-⁩]/g, " ")
    .replace(/[<>{}`\\"]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const KIND: Record<SceneCard["kind"], string> = {
  wear: "she is wearing the exact garment/outfit shown in the product images",
  accessory: "she is wearing or carrying the exact accessory shown in the product images",
  apply: "she is holding and using the exact beauty product shown in the product images",
  hold: "she is holding the exact product shown in the product images",
};

const TONE: Record<string, string> = {
  natural: "natural conversational tone, like talking to a friend",
  animada: "excited, enthusiastic, upbeat tone with genuine energy",
  sussurro: "soft intimate whisper, close to the microphone",
};

export function buildPrompt(scene: SceneCard, settings: Setting[], o: BuildOptions) {
  const product = clean(o.product, 100);
  const line = clean(o.line, 160);
  const setting =
    o.settingId === "ref"
      ? "the same environment shown in the person's reference photos (if none is shown, use: " + scene.setting + ")"
      : settings.find((x) => x.id === o.settingId)?.prompt ?? scene.setting;

  const t = o.seconds === 10 ? ["0–3s", "3–6s", "6–8s", "8–10s"] : ["0–2s", "2–4s", "4–6s", "6–8s"];
  const visibility = scene.back
    ? "PRODUCT VISIBILITY (critical): the FRONT of the product must be clearly and fully visible at the start, and the BACK of the product must be clearly and fully visible during the turn. Keep the product in sharp focus, never cropped, never covered by hands or hair."
    : "PRODUCT VISIBILITY (critical): the product must be clearly visible and in sharp focus for most of the video, never cropped, never covered by hands or hair.";

  const audio =
    o.speech === "none"
      ? "AUDIO: no dialogue and no voice. Only subtle natural room ambience. No music, no subtitles."
      : `DIALOGUE: she speaks in Brazilian Portuguese (pt-BR) with a native Brazilian accent, ${TONE[o.speech]}, perfect lip-sync. She says exactly: "${line || "Gente, olha que perfeito isso aqui!"}"\nAUDIO: clear voice captured by a phone microphone, subtle room tone, no music, no subtitles.`;

  return [
    `Create a ${o.seconds}-second vertical 9:16 video, photorealistic, looking like authentic TikTok/Instagram UGC filmed on a smartphone.`,
    ``,
    `REFERENCE IMAGES — study all attached images together before generating:`,
    `• Photos of the woman = her exact identity. Keep the same face, facial features, skin tone, hair, body shape and proportions in every frame. Do not beautify, slim, age or change her.`,
    `• Photos of the product${product ? ` (${product})` : ""} = the exact product. Reproduce its color, fabric, texture, print, cut, length, seams, details and any logos exactly. If front and back photos are provided, both sides must match the references.`,
    `• Combine everything into one coherent scene: ${KIND[scene.kind]}.`,
    ``,
    `SETTING: ${setting}.`,
    `CAMERA: ${scene.camera}.`,
    ``,
    `ACTION:`,
    `• ${t[0]}: ${scene.beats[0]}.`,
    `• ${t[1]}: ${scene.beats[1]}.`,
    `• ${t[2]}: ${scene.beats[2]}.`,
    `• ${t[3]}: ${scene.beats[3]}.`,
    ``,
    visibility,
    ``,
    audio,
    ``,
    `STYLE: natural human motion, realistic hands with five fingers, real skin texture, believable fabric and hair physics, natural lighting, casual amateur framing.`,
    `AVOID: changing her face or body, changing the product design or color, text on screen, watermarks, extra people, morphing, distorted hands, warped mirror reflections, cartoon or CGI look.`,
  ].join("\n");
}
