import "server-only";
import { z } from "zod";

const clean = (s: string, max: number) =>
  s
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, " ")
    .replace(/[<>{}`\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const text = (max: number) => z.string().max(max * 2).transform((s) => clean(s, max));

export const AvatarInput = z.object({
  gender: z.enum(["mulher", "homem"]),
  age: z.coerce.number().int().min(21).max(55),
  skin: z.enum(["clara", "clara-sardas", "morena-clara", "morena", "parda", "negra", "negra-retinta", "asiatica"]),
  hairType: z.enum(["liso", "ondulado", "cacheado", "crespo", "trancas", "curto", "raspado"]),
  hairColor: z.enum(["preto", "castanho-escuro", "castanho-claro", "loiro", "ruivo", "luzes", "colorido"]),
  eyes: z.enum(["castanhos", "pretos", "verdes", "azuis", "mel"]),
  body: z.enum(["magra", "atletica", "media", "curvilinea", "plus-size"]),
  style: z.enum(["clean", "streetwear", "elegante", "fitness", "praiana", "romantica", "alternativa"]),
  extra: text(160).optional().default(""),
});
export type AvatarInputT = z.infer<typeof AvatarInput>;

const MAP: Record<string, string> = {
  clara: "fair light skin", "clara-sardas": "fair skin with natural freckles", "morena-clara": "light tan skin",
  morena: "medium tan skin", parda: "medium brown skin", negra: "brown skin", "negra-retinta": "deep dark brown skin",
  asiatica: "light skin with East Asian features",
  liso: "straight", ondulado: "wavy", cacheado: "curly", crespo: "coily natural afro-textured", trancas: "long box braids",
  curto: "short pixie-cut", raspado: "buzz-cut",
  preto: "black", "castanho-escuro": "dark brown", "castanho-claro": "light brown", loiro: "blonde", ruivo: "copper red",
  luzes: "brown with blonde highlights", colorido: "pastel pink dyed",
  castanhos: "brown", pretos: "dark brown almost black", verdes: "green", azuis: "blue", mel: "hazel",
  magra: "slim", atletica: "athletic toned", media: "average natural", curvilinea: "curvy hourglass", "plus-size": "plus-size",
  clean: "clean-girl minimalist neutral outfit", streetwear: "trendy streetwear outfit", elegante: "elegant chic outfit",
  fitness: "matching activewear set", praiana: "relaxed beachy summer outfit", romantica: "romantic feminine floral outfit",
  alternativa: "alternative edgy outfit with dark tones",
};

export function avatarPrompts(a: AvatarInputT) {
  const who = a.gender === "mulher" ? "woman" : "man";
  const hair = a.hairType === "trancas" ? `${MAP[a.hairColor]} ${MAP.trancas}` : `${MAP[a.hairType]} ${MAP[a.hairColor]} hair`;
  const base = `a ${a.age}-year-old Brazilian ${who}, ${MAP[a.skin]}, ${hair}, ${MAP[a.eyes]} eyes, ${MAP[a.body]} body type, wearing a ${MAP[a.style]}${a.extra ? `, ${a.extra}` : ""}`;

  const portrait = [
    `Ultra-realistic smartphone selfie portrait of ${base}.`,
    `Natural daylight from a window, real skin texture with visible pores and tiny imperfections, no heavy makeup, no filters.`,
    `Looks like a real person's casual Instagram photo, 9:16 vertical, shot on iPhone front camera, slight grain.`,
    `AVOID: plastic skin, airbrushed look, CGI, cartoon, text, watermark, extra fingers.`,
  ].join("\n");

  const sheet = [
    `Character reference sheet of the SAME person (${base}), photorealistic, consistent identity in every panel.`,
    `Layout: 4 panels on a neutral light gray background — (1) front face close-up, (2) 3/4 left profile, (3) right side profile, (4) full body standing front view.`,
    `Same face, same hair, same outfit, same lighting (soft studio light) in all panels. Real skin texture, natural proportions.`,
    `AVOID: different faces between panels, text labels, watermarks, stylization.`,
  ].join("\n");

  const lifestyle = [
    `Photorealistic vertical 9:16 photo of the person from the reference image (${base}).`,
    `${a.gender === "mulher" ? "She" : "He"} is taking a mirror selfie in a cozy bedroom with a full-length mirror, phone in hand, relaxed natural pose.`,
    `Keep identical face and hair from the reference. Warm indoor light, authentic UGC look, natural skin texture.`,
    `AVOID: identity changes, text, watermark, extra fingers, warped reflection.`,
  ].join("\n");

  return { description: base, portrait, sheet, lifestyle };
}
