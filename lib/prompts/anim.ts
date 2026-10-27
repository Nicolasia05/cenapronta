export type AnimType =
  | "spin" | "hair" | "adjust" | "smooth" | "flash" | "sit" | "walk" | "shoulder" | "curtain"
  | "zoom" | "hanger" | "necklace" | "earring" | "bag" | "lipstick" | "dab" | "mist"
  | "talk" | "unbox" | "dance" | "transition";

/** Qual animação de silhueta cada cena usa (enquanto não há vídeo real de prévia). */
export const SCENE_ANIM: Record<string, { type: AnimType; mirror?: boolean }> = {
  "espelho-giro-completo": { type: "spin", mirror: true },
  "espelho-cabelo": { type: "hair", mirror: true },
  "espelho-arrumando": { type: "adjust", mirror: true },
  "espelho-alisando": { type: "smooth", mirror: true },
  "espelho-tecido": { type: "smooth", mirror: true },
  "espelho-flash": { type: "flash", mirror: true },
  "espelho-sentada": { type: "sit", mirror: true },
  "banheiro-espelho": { type: "spin", mirror: true },
  "look-voltinha": { type: "spin" },
  "look-caminhada": { type: "walk" },
  "look-ombro": { type: "shoulder" },
  "look-sentando": { type: "sit" },
  "look-provador": { type: "curtain" },
  "look-rua": { type: "walk" },
  "detalhe-tecido": { type: "zoom" },
  "detalhe-costas": { type: "shoulder" },
  "detalhe-cintura": { type: "adjust" },
  "detalhe-pendurada": { type: "hanger" },
  "colar-toque": { type: "necklace" },
  "brinco-orelha": { type: "earring" },
  "bolsa-ombro": { type: "bag" },
  "batom-aplicando": { type: "lipstick" },
  "skincare-textura": { type: "dab" },
  "perfume-borrifada": { type: "mist" },
  "fala-mostrando": { type: "talk" },
  "fala-review": { type: "talk" },
  "fala-unboxing": { type: "unbox" },
  "fala-carro": { type: "talk" },
  "fala-segredo": { type: "talk" },
  "dance-groove": { type: "dance" },
  "dance-passos": { type: "dance" },
  "dance-cabelo": { type: "hair" },
  "transicao-roupa": { type: "transition" },
};
