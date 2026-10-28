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

/* ───────── Enquadramento (corpo inteiro / pescoço pra baixo / POV) ───────── */

const POV_CAMERA =
  "vertical 9:16 first-person POV shot from her own eyes, phone held at chest height looking down at her hands, natural handheld movement";

const POV_BEATS: Record<BuildOptions["pov"], [string, string, string, string]> = {
  mostrar: [
    "her hands hold the product toward the camera, the front of the product fully visible and in sharp focus",
    "she slowly rotates the product in her hands to show its side and texture",
    "she flips the product to show the back clearly",
    "she brings the front back to the camera and holds it still for a close look",
  ],
  abrir: [
    "her hands hold the closed product or package toward the camera",
    "she opens it (zipper, lid, box or packaging) slowly and naturally",
    "she reveals the inside or the product itself, holding it closer to the lens",
    "she tilts it to show details and holds it still in focus",
  ],
  apontar: [
    "one hand holds the product toward the camera, front fully visible",
    "the index finger of her other hand points at the first highlight (fabric, logo or main detail)",
    "she points at a second detail, moving the product slightly so it catches the light",
    "she flips it to show the back and points at it, product in sharp focus",
  ],
  esticar: [
    "both hands hold the product toward the camera, front fully visible",
    "she gently stretches the fabric/material between her hands to show elasticity and thickness",
    "she releases it and it returns smoothly to its shape with no wrinkles or damage",
    "she smooths it with her palm and holds the product still in focus",
  ],
};

type Eff = { camera: string; beats: [string, string, string, string]; back: boolean; framing: string; faceless: boolean; kind: string };

function effective(scene: SceneCard, o: BuildOptions): Eff {
  const kind = KIND[scene.kind];
  if (o.framing === "pov")
    return {
      camera: POV_CAMERA,
      beats: POV_BEATS[o.pov],
      back: o.pov !== "abrir",
      framing:
        "FRAMING: first-person POV. Only her hands, forearms and the product are visible (her body may appear slightly at the bottom of the frame). Her face is NEVER shown.",
      faceless: true,
      kind: "her own hands are holding and handling the exact product shown in the product images",
    };
  if (o.framing === "neck")
    return {
      camera: scene.camera,
      beats: scene.beats,
      back: scene.back,
      framing:
        "FRAMING: framed from the neck down (crop just below the chin) to the knees or feet, so the outfit fills the frame. Her face is NEVER shown in any frame. Replace any smiling or looking-at-camera action with a natural body or hand gesture.",
      faceless: true,
      kind,
    };
  if (o.framing === "full")
    return {
      camera: scene.camera,
      beats: scene.beats,
      back: scene.back,
      framing: "FRAMING: full body always visible, from head to feet, with a little space above the head.",
      faceless: false,
      kind,
    };
  return { camera: scene.camera, beats: scene.beats, back: scene.back, framing: "", faceless: false, kind };
}

const settingOf = (scene: SceneCard, settings: Setting[], o: BuildOptions) =>
  o.settingId === "ref"
    ? "the same environment shown in the person's reference photos (if none is shown, use: " + scene.setting + ")"
    : settings.find((x) => x.id === o.settingId)?.prompt ?? scene.setting;

const times = (o: BuildOptions) => (o.seconds === 10 ? ["0–3s", "3–6s", "6–8s", "8–10s"] : ["0–2s", "2–4s", "4–6s", "6–8s"]);

const audioOf = (o: BuildOptions, faceless: boolean) => {
  if (o.speech === "none") return "AUDIO: no dialogue and no voice. Only subtle natural room ambience. No music, no subtitles.";
  const line = clean(o.line, 160) || "Gente, olha que perfeito isso aqui!";
  return faceless
    ? `VOICE-OVER: a young Brazilian woman's voice (off-camera, face not shown) speaks in Brazilian Portuguese (pt-BR), ${TONE[o.speech]}. She says exactly: "${line}"\nAUDIO: clear voice captured by a phone microphone, subtle room tone, no music, no subtitles.`
    : `DIALOGUE: she speaks in Brazilian Portuguese (pt-BR) with a native Brazilian accent, ${TONE[o.speech]}, perfect lip-sync. She says exactly: "${line}"\nAUDIO: clear voice captured by a phone microphone, subtle room tone, no music, no subtitles.`;
};

const identityLine = (faceless: boolean) =>
  faceless
    ? "• Photo of the woman (body) = keep the same skin tone, body shape, proportions, hands and nails. Her face is not needed and must not appear."
    : "• Photos of the woman = her exact identity. Keep the same face, facial features, skin tone, hair, body shape and proportions in every frame. Do not beautify, slim, age or change her.";

const visibilityLine = (back: boolean) =>
  back
    ? "PRODUCT VISIBILITY (critical): the FRONT of the product must be clearly and fully visible at the start, and the BACK of the product must be clearly and fully visible during the turn/flip. Keep the product in sharp focus, never cropped, never covered by hands or hair."
    : "PRODUCT VISIBILITY (critical): the product must be clearly visible and in sharp focus for most of the video, never cropped, never covered by hands or hair.";

const joinLines = (lines: string[]) => lines.filter((l, i, a) => !(l === "" && (i === 0 || a[i - 1] === ""))).join("\n");

/* ───────── Modo direto: 1 prompt (Ingredients to Video) ───────── */
export function buildPrompt(scene: SceneCard, settings: Setting[], o: BuildOptions) {
  const e = effective(scene, o);
  const product = clean(o.product, 100);
  const t = times(o);
  return joinLines([
    `Create a ${o.seconds}-second vertical 9:16 video, photorealistic, looking like authentic TikTok/Instagram UGC filmed on a smartphone.`,
    ``,
    `REFERENCE IMAGES — study all attached images together before generating:`,
    identityLine(e.faceless),
    `• Photos of the product${product ? ` (${product})` : ""} = the exact product. Reproduce its color, fabric, texture, print, cut, length, seams, details and any logos exactly. If front and back photos are provided, both sides must match the references.`,
    `• Combine everything into one coherent scene: ${e.kind}.`,
    ``,
    `SETTING: ${settingOf(scene, settings, o)}.`,
    `CAMERA: ${e.camera}.`,
    e.framing,
    ``,
    `ACTION:`,
    `• ${t[0]}: ${e.beats[0]}.`,
    `• ${t[1]}: ${e.beats[1]}.`,
    `• ${t[2]}: ${e.beats[2]}.`,
    `• ${t[3]}: ${e.beats[3]}.`,
    ``,
    visibilityLine(e.back),
    ``,
    audioOf(o, e.faceless),
    ``,
    `STYLE: natural human motion, realistic hands with five fingers, real skin texture, believable fabric and hair physics, natural lighting, casual amateur framing.`,
    `AVOID: changing her body or the product design or color, text on screen, watermarks, extra people, morphing, distorted hands, warped mirror reflections, cartoon or CGI look${e.faceless ? ", showing her face" : ", changing her face"}.`,
  ]);
}

/* ───────── Modo 2 passos ───────── */

/** Prompt de movimento: anima a imagem inicial (Frames to Video). É o principal. */
export function buildMotionFromFrame(scene: SceneCard, o: BuildOptions) {
  const e = effective(scene, o);
  const t = times(o);
  return joinLines([
    `Animate the provided starting image into a ${o.seconds}-second vertical 9:16 video, photorealistic, authentic TikTok UGC filmed on a smartphone.`,
    ``,
    `Keep the ${e.faceless ? "body, skin tone, hands" : "woman's face, hair, body"} and the product 100% identical to the starting image in every frame. No morphing, no redesign of the product.`,
    e.back
      ? `When the product turns or flips, its BACK must stay consistent with the product (same color, fabric and details), fully visible and in focus.`
      : ``,
    `CAMERA: ${e.camera}.`,
    e.framing,
    ``,
    `ACTION:`,
    `• ${t[0]}: ${e.beats[0]}.`,
    `• ${t[1]}: ${e.beats[1]}.`,
    `• ${t[2]}: ${e.beats[2]}.`,
    `• ${t[3]}: ${e.beats[3]}.`,
    ``,
    audioOf(o, e.faceless),
    ``,
    `STYLE: natural human motion, realistic hands with five fingers, believable fabric and hair physics, casual amateur framing.`,
    `AVOID: body or product changes, text on screen, watermarks, extra people, distorted hands, cartoon or CGI look${e.faceless ? ", showing her face" : ", face changes"}.`,
  ]);
}

/** Prompt da imagem inicial (mesclagem): até 3 fotos do produto + 1 foto da modelo (rosto ou corpo). */
export function buildMergePrompt(scene: SceneCard, settings: Setting[], o: BuildOptions) {
  const e = effective(scene, o);
  const product = clean(o.product, 100);
  const modelRef = e.faceless
    ? "• LAST image = the model's BODY photo (face not needed). Keep the same skin tone, body shape, proportions, hands and nails. Her face must NOT appear."
    : "• LAST image = the model's photo (face and/or body). Keep her exact face, facial features, skin tone, hair, body shape and proportions. Do not beautify, slim or change her.";
  return joinLines([
    `Create ONE photorealistic vertical 9:16 image that looks like a real smartphone photo. It will be the first frame of a TikTok video.`,
    ``,
    `ATTACHED IMAGES:`,
    `• FIRST images (up to 3) = the PRODUCT${product ? ` (${product})` : ""}: front, back and/or detail. Reproduce it exactly: same color, fabric, texture, print, cut, length, seams, details and logos. No redesign, no extra elements.`,
    modelRef,
    ``,
    `RESULT: ${e.kind}. ${e.beats[0][0].toUpperCase()}${e.beats[0].slice(1)}.`,
    `SETTING: ${settingOf(scene, settings, o)}.`,
    `CAMERA: ${e.camera}.`,
    e.framing,
    `The FRONT of the product must be fully visible and in sharp focus in this image.`,
    ``,
    `STYLE: authentic UGC phone photo, natural light, real skin texture, natural fabric folds, slight phone-camera grain.`,
    `AVOID: text, watermark, extra fingers, distorted hands, duplicated product, warped mirror reflection, plastic skin, CGI look${e.faceless ? ", any visible face" : ""}.`,
  ]);
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
