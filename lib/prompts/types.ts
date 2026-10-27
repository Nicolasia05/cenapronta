export type ProductKind = "wear" | "accessory" | "apply" | "hold";

export type SceneCard = {
  id: string;
  name: string;
  group: string;
  desc: string;
  kind: ProductKind;
  camera: string;
  setting: string;
  /** 4 momentos: 0–3s, 3–6s, 6–8s, 8–10s */
  beats: [string, string, string, string];
  /** a cena mostra as costas do produto */
  back: boolean;
  /** funciona bem com fala */
  talk: boolean;
};

export type Setting = { id: string; name: string; prompt: string };

export type BuildOptions = {
  product: string;
  settingId: string; // "ref" = usa o cenário da foto
  speech: "none" | "natural" | "animada" | "sussurro";
  line: string;
  seconds: 8 | 10;
};

export type Asset = { id: string; kind: "model" | "product"; name: string; urls: string[] };
