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

/* ───────── Modo 2 passos: 1) imagem do primeiro frame  2) animação desse frame ───────── */

export function buildMergePrompt(scene: SceneCard, settings: Setting[], o: BuildOptions) {
  const product = clean(o.product, 100);
  const setting =
    o.settingId === "ref"
      ? "the same environment shown in the person's reference photos (if none is shown, use: " + scene.setting + ")"
      : settings.find((x) => x.id === o.settingId)?.prompt ?? scene.setting;
  return [
    `Create ONE photorealistic vertical 9:16 image that looks like a real smartphone photo, the first frame of a TikTok video.`,
    ``,
    `REFERENCE IMAGES — use all attached images together:`,
    `• Photos of the woman = her exact identity: same face, facial features, skin tone, hair, body shape and proportions. Do not beautify, slim or change her.`,
    `• Photos of the product${product ? ` (${product})` : ""} = the exact product: same color, fabric, texture, print, cut, length, seams, details and logos. No redesign.`,
    ``,
    `SCENE: ${KIND[scene.kind]}. ${scene.beats[0]}.`,
    `SETTING: ${setting}.`,
    `CAMERA: ${scene.camera}.`,
    scene.back
      ? `The FRONT of the product must be fully visible and in sharp focus in this image.`
      : `The product must be fully visible and in sharp focus.`,
    ``,
    `STYLE: authentic UGC phone photo, natural light, real skin texture with pores, natural fabric folds, slight phone-camera grain.`,
    `AVOID: text, watermark, extra fingers, distorted hands, duplicated product, warped mirror reflection, plastic skin, CGI look.`,
  ].join("\n");
}

export function buildMotionFromFrame(scene: SceneCard, o: BuildOptions) {
  const line = clean(o.line, 160);
  const t = o.seconds === 10 ? ["0–3s", "3–6s", "6–8s", "8–10s"] : ["0–2s", "2–4s", "4–6s", "6–8s"];
  const audio =
    o.speech === "none"
      ? "AUDIO: no dialogue and no voice. Only subtle natural room ambience. No music, no subtitles."
      : `DIALOGUE: she speaks in Brazilian Portuguese (pt-BR) with a native Brazilian accent, ${TONE[o.speech]}, perfect lip-sync. She says exactly: "${line || "Gente, olha que perfeito isso aqui!"}"\nAUDIO: clear voice captured by a phone microphone, subtle room tone, no music, no subtitles.`;
  return [
    `Animate the provided starting image into a ${o.seconds}-second vertical 9:16 video, photorealistic, authentic TikTok UGC filmed on a smartphone.`,
    ``,
    `Keep the woman's face, hair, body and the product 100% identical to the starting image in every frame. No morphing, no redesign of the product.`,
    scene.back
      ? `When she turns, the BACK of the product must look consistent with the product reference (same color, fabric and details), fully visible and in focus.`
      : ``,
    `CAMERA: ${scene.camera}.`,
    ``,
    `ACTION:`,
    `• ${t[0]}: ${scene.beats[0]}.`,
    `• ${t[1]}: ${scene.beats[1]}.`,
    `• ${t[2]}: ${scene.beats[2]}.`,
    `• ${t[3]}: ${scene.beats[3]}.`,
    ``,
    audio,
    ``,
    `STYLE: natural human motion, realistic hands with five fingers, believable fabric and hair physics, casual amateur framing.`,
    `AVOID: face or body changes, product changes, text on screen, watermarks, extra people, distorted hands, cartoon or CGI look.`,
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");
}

/* ───────── Legenda + hashtags ───────── */
const BASE_TAGS = ["#tiktokshop", "#achadinhos", "#achadinhosdotiktok", "#comprinhas", "#valeapena"];
const KIND_TAGS: Record<SceneCard["kind"], string[]> = {
  wear: ["#lookdodia", "#modafeminina", "#provador", "#outfit"],
  accessory: ["#acessorios", "#semijoias", "#bolsa", "#lookdodia"],
  apply: ["#maquiagem", "#skincare", "#beleza", "#make"],
  hold: ["#recebidos", "#testei", "#review", "#indicacao"],
};
const CAPTIONS: Record<SceneCard["kind"], string[]> = {
  wear: [
    "O caimento desse {p} é outra coisa 😍 link no carrinho laranja 🧡",
    "Provando o {p} do TikTok Shop: aprovado ou reprovado? 👀",
    "Achei o {p} que todo mundo tá pedindo, corre no carrinho 🛒",
  ],
  accessory: [
    "Detalhe que muda o look inteiro ✨ {p} no carrinho laranja",
    "O {p} mais lindo que achei no TikTok Shop 🤍",
    "Parece caro, mas é achadinho 🫣 {p} no carrinho",
  ],
  apply: [
    "Testei o {p} viral e olha o resultado 😮",
    "Uma passada só 💄 {p} no carrinho laranja",
    "Entrou pra minha rotina: {p} ✨",
  ],
  hold: [
    "Chegou e eu amei 😍 {p} no carrinho laranja",
    "Review sincero do {p} 👀 vale a pena?",
    "Achadinho que vale cada centavo: {p} 🛒",
  ],
};

export function buildCaptions(scene: SceneCard, productRaw: string) {
  const raw = clean(productRaw, 100);
  const p = raw ? (/^[A-ZÀ-Ý][a-zà-ÿ]/.test(raw) ? raw[0].toLowerCase() + raw.slice(1) : raw) : "produto";
  return {
    captions: CAPTIONS[scene.kind].map((c) => c.replaceAll("{p}", p)),
    hashtags: [...BASE_TAGS, ...KIND_TAGS[scene.kind]].join(" "),
  };
}
