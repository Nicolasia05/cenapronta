import "server-only";
import type { SceneCard, Setting } from "./types";

const MIRROR = "vertical 9:16 mirror selfie filmed on a smartphone, phone visible in her hand, slight natural handheld sway";
const FRONT = "vertical 9:16 front-facing smartphone camera held at arm's length, subtle natural handheld movement";
const TRIPOD = "vertical 9:16 phone on a tripod at chest height, full body in frame, static framing";
const CLOSE = "vertical 9:16 handheld close-up, shallow depth of field, gentle focus pulls";

const BEDROOM_MIRROR = "a full-length mirror in a tidy, cozy bedroom with warm lamp light";
const BATHROOM = "a clean modern bathroom with a large wall mirror and soft daylight";
const ROOM = "a bright minimalist bedroom with soft natural window light";

type S = Omit<SceneCard, "id"> & { id: string };
const s = (x: S): SceneCard => x;

export const SCENES: SceneCard[] = [
  // ───────────── Espelho
  s({
    id: "espelho-giro-completo", name: "Giro no espelho (frente e costas)", group: "Espelho", kind: "wear", camera: MIRROR, setting: BEDROOM_MIRROR, back: true, talk: false,
    desc: "Selfie no espelho, gira devagar mostrando frente, lado e costas da roupa e volta.",
    beats: [
      "she stands facing the mirror holding the phone at chest height, the full front of the outfit clearly visible",
      "she turns slowly to her side, showing the side profile and how the fabric falls",
      "she continues turning until her back faces the mirror, looking over her shoulder at the phone, the back of the outfit fully visible",
      "she turns back to the front, smiles softly and relaxes her pose",
    ],
  }),
  s({
    id: "espelho-cabelo", name: "Mexendo no cabelo", group: "Espelho", kind: "wear", camera: MIRROR, setting: BEDROOM_MIRROR, back: true, talk: false,
    desc: "Selfie no espelho passando a mão no cabelo e jogando pro lado, depois mostra as costas.",
    beats: [
      "mirror selfie, she runs her free hand through her hair from the root to the ends, outfit front clearly visible",
      "she sweeps all her hair over one shoulder, revealing the neckline and shoulders of the outfit",
      "she turns halfway so the back of the outfit shows in the mirror, hair moving naturally",
      "she turns back to the front and tucks a strand behind her ear with a soft smile",
    ],
  }),
  s({
    id: "espelho-arrumando", name: "Arrumando a roupa", group: "Espelho", kind: "wear", camera: MIRROR, setting: BEDROOM_MIRROR, back: true, talk: false,
    desc: "Ajusta alça, gola e barra da roupa como quem confere o look antes de sair.",
    beats: [
      "mirror selfie, she adjusts the strap/neckline of the outfit with her free hand, front clearly visible",
      "she pulls the hem down gently and straightens the fabric at her waist",
      "she turns to check the back in the mirror, adjusting the back of the outfit, the back fully visible",
      "she faces the mirror again, satisfied, and gives a small nod",
    ],
  }),
  s({
    id: "espelho-alisando", name: "Passando a mão na roupa", group: "Espelho", kind: "wear", camera: MIRROR, setting: BEDROOM_MIRROR, back: true, talk: false,
    desc: "Desliza a mão pela lateral da roupa, da cintura ao quadril, mostrando o caimento.",
    beats: [
      "mirror selfie, she places her free hand on her waist, front of the outfit clearly visible",
      "she slowly slides her hand down the side of the outfit from waist to hip, smoothing the fabric to show the fit",
      "she turns to the side and then shows the back of the outfit in the mirror",
      "she returns to the front, hand resting on her hip, confident relaxed pose",
    ],
  }),
  s({
    id: "espelho-tecido", name: "Puxando o tecido", group: "Espelho", kind: "wear", camera: MIRROR, setting: BEDROOM_MIRROR, back: false, talk: false,
    desc: "Puxa levemente a barra pra mostrar elasticidade e solta, o tecido volta sem amassar.",
    beats: [
      "mirror selfie, she holds the hem of the outfit between her fingers",
      "she gently pulls the fabric forward to show its stretch and thickness",
      "she releases it and the fabric falls back smoothly without wrinkles",
      "she smooths it with her palm and smiles at the mirror",
    ],
  }),
  s({
    id: "espelho-flash", name: "Selfie com flash (outfit check)", group: "Espelho", kind: "wear", camera: `${MIRROR}, phone flash on creating a bright flare in the mirror`, setting: BEDROOM_MIRROR, back: true, talk: false,
    desc: "Poses rápidas com flash ligado, estilo 'outfit check', incluindo uma de costas.",
    beats: [
      "flash on, she strikes a first pose with a hand on her hip, front of the outfit visible",
      "quick natural change to a second pose with a slight angle",
      "she turns her back to the mirror for a pose looking over her shoulder, back of the outfit visible",
      "she turns back and does a final playful pose",
    ],
  }),
  s({
    id: "espelho-sentada", name: "Sentada na frente do espelho", group: "Espelho", kind: "wear", camera: MIRROR, setting: BEDROOM_MIRROR, back: false, talk: false,
    desc: "Sentada no chão de pernas cruzadas, ajeita a roupa e o cabelo.",
    beats: [
      "she sits cross-legged on the floor in front of a full-length mirror, holding the phone",
      "she adjusts the outfit so it sits nicely while seated",
      "she stretches one leg forward and leans back on one hand",
      "she plays with her hair and smiles at the mirror",
    ],
  }),
  s({
    id: "banheiro-espelho", name: "Espelho do banheiro", group: "Espelho", kind: "wear", camera: MIRROR, setting: BATHROOM, back: true, talk: false,
    desc: "Selfie no espelho do banheiro, ajeita a roupa e mostra as costas.",
    beats: [
      "mirror selfie in the bathroom, she checks the front of the outfit",
      "she adjusts the waist of the outfit and fixes her hair",
      "she turns to show the back of the outfit in the mirror",
      "she faces the mirror again and smiles",
    ],
  }),

  // ───────────── Look em movimento
  s({
    id: "look-voltinha", name: "Voltinha completa", group: "Look em movimento", kind: "wear", camera: TRIPOD, setting: ROOM, back: true, talk: false,
    desc: "Corpo inteiro no tripé: dá uma volta completa devagar, a saia/tecido acompanha.",
    beats: [
      "she stands facing the camera, full body, the front of the outfit fully visible",
      "she starts a slow full spin, the fabric flowing with the movement",
      "mid-spin her back faces the camera, the back of the outfit fully visible",
      "she completes the turn, stops facing the camera and smiles",
    ],
  }),
  s({
    id: "look-caminhada", name: "Caminhando até a câmera", group: "Look em movimento", kind: "wear", camera: "vertical 9:16 phone on a tripod at chest height, full body framing", setting: "a long apartment hallway with soft natural light", back: true, talk: false,
    desc: "Caminha em direção à câmera com confiança, vira e volta mostrando as costas.",
    beats: [
      "she walks toward the camera with confident relaxed steps, outfit moving naturally",
      "she stops close to the camera and strikes a pose",
      "she turns around and walks a few steps away, the back of the outfit clearly visible",
      "she looks back over her shoulder at the camera with a smile",
    ],
  }),
  s({
    id: "look-ombro", name: "Olhando por cima do ombro", group: "Look em movimento", kind: "wear", camera: TRIPOD, setting: ROOM, back: true, talk: false,
    desc: "Começa de costas, olha por cima do ombro e vira devagar pra frente.",
    beats: [
      "she stands with her back to the camera, the back of the outfit fully visible",
      "she slowly looks over her shoulder at the camera",
      "she turns her body to face the camera, revealing the front of the outfit",
      "she adjusts her hair and smiles",
    ],
  }),
  s({
    id: "look-sentando", name: "Sentando e levantando", group: "Look em movimento", kind: "wear", camera: TRIPOD, setting: ROOM, back: true, talk: false,
    desc: "Mostra que a roupa não sobe nem amassa ao sentar e levantar.",
    beats: [
      "she stands next to a chair, front of the outfit visible",
      "she sits down naturally, the fabric stays in place",
      "she stands up and smooths the fabric, no wrinkles",
      "she turns to show the back of the outfit and then faces the camera",
    ],
  }),
  s({
    id: "look-provador", name: "Saindo do provador", group: "Look em movimento", kind: "wear", camera: TRIPOD, setting: "a clothing store fitting room with a curtain and warm boutique lighting", back: true, talk: false,
    desc: "Abre a cortina, sai do provador e mostra o look de frente e de costas.",
    beats: [
      "the fitting room curtain is closed, then she pulls it open revealing the outfit",
      "she steps out and poses facing the camera",
      "she turns around to show the back of the outfit",
      "she turns back with her hands on her hips and smiles",
    ],
  }),
  s({
    id: "look-rua", name: "Andando na rua", group: "Look em movimento", kind: "wear", camera: "vertical 9:16 handheld camera walking backwards in front of her, natural street movement", setting: "a stylish city sidewalk with storefronts and trees in daylight", back: true, talk: false,
    desc: "Caminhada na calçada, a câmera acompanha; no fim ela passa e mostra as costas.",
    beats: [
      "she walks toward the camera on a sidewalk, outfit and hair moving naturally",
      "she glances at the camera and smiles while walking",
      "she walks past the camera, which turns to follow her, showing the back of the outfit",
      "she looks back over her shoulder playfully",
    ],
  }),

  // ───────────── Detalhes do produto
  s({
    id: "detalhe-tecido", name: "Close no tecido", group: "Detalhes do produto", kind: "wear", camera: CLOSE, setting: ROOM, back: false, talk: false,
    desc: "Câmera próxima passeando pelo tecido, costura e acabamento.",
    beats: [
      "close-up of her hand touching the fabric texture of the outfit",
      "the camera glides over the seams, buttons or print details",
      "close-up on the neckline and finishing details",
      "the camera pulls back to reveal her wearing the whole outfit",
    ],
  }),
  s({
    id: "detalhe-costas", name: "Close nas costas", group: "Detalhes do produto", kind: "wear", camera: CLOSE, setting: ROOM, back: true, talk: false,
    desc: "Foco nos detalhes das costas: decote, zíper, amarração.",
    beats: [
      "she stands with her back to the camera, hair swept to one side",
      "the camera moves closer to the back details of the outfit: neckline, zipper or ties",
      "she shifts slightly so the fabric moves and catches the light",
      "she turns her head to look at the camera over her shoulder",
    ],
  }),
  s({
    id: "detalhe-cintura", name: "Mão na cintura (caimento)", group: "Detalhes do produto", kind: "wear", camera: "vertical 9:16 handheld camera framed from shoulders to knees", setting: ROOM, back: true, talk: false,
    desc: "Enquadramento do tronco: mãos marcam a cintura, gira pra mostrar o caimento.",
    beats: [
      "framed from shoulders to knees, she places both hands on her waist",
      "she shifts her weight showing how the outfit fits her body",
      "she turns to show the side and the back",
      "she turns back to the front, relaxed",
    ],
  }),
  s({
    id: "detalhe-pendurada", name: "Peça no cabide → vestida", group: "Detalhes do produto", kind: "wear", camera: FRONT, setting: ROOM, back: true, talk: false,
    desc: "Mostra a peça no cabide (frente e costas) e corta pra ela vestida.",
    beats: [
      "she holds the garment on a hanger in front of the camera, showing the front",
      "she flips the hanger to show the back of the garment",
      "quick cut: she is now wearing it, standing in front of the camera",
      "she does a half turn showing the back while wearing it",
    ],
  }),

  // ───────────── Acessórios & beleza
  s({
    id: "colar-toque", name: "Toque no colar", group: "Acessórios & beleza", kind: "accessory", camera: `${CLOSE}, framed from lips to collarbone`, setting: ROOM, back: false, talk: false,
    desc: "Close no colo, a mão encosta leve no colar e o pingente brilha.",
    beats: [
      "close framing of her neck and collarbone wearing the necklace",
      "her fingertips gently touch the chain",
      "she lifts the pendant slightly from underneath so it sparkles",
      "she lets it rest and the light catches the metal",
    ],
  }),
  s({
    id: "brinco-orelha", name: "Cabelo atrás da orelha (brinco)", group: "Acessórios & beleza", kind: "accessory", camera: FRONT, setting: ROOM, back: false, talk: false,
    desc: "Coloca o cabelo atrás da orelha revelando o brinco, vira o rosto devagar.",
    beats: [
      "her hair covers her ear, she looks at the camera",
      "she tucks her hair behind her ear, revealing the earring",
      "she turns her head slowly so the earring sways and sparkles",
      "she turns to the other side showing the second earring",
    ],
  }),
  s({
    id: "bolsa-ombro", name: "Bolsa no ombro", group: "Acessórios & beleza", kind: "accessory", camera: TRIPOD, setting: ROOM, back: true, talk: false,
    desc: "Pega a bolsa, coloca no ombro, mostra frente e verso e o espaço interno.",
    beats: [
      "she holds the bag in front of her showing the front design",
      "she turns the bag to show the back and the strap",
      "she opens it briefly showing the inside",
      "she swings it onto her shoulder and poses",
    ],
  }),
  s({
    id: "batom-aplicando", name: "Passando batom", group: "Acessórios & beleza", kind: "apply", camera: FRONT, setting: BATHROOM, back: false, talk: false,
    desc: "Mostra o batom fechado, abre e aplica olhando pra câmera.",
    beats: [
      "she holds the closed lipstick next to her face, label visible",
      "she opens it revealing the color",
      "she applies it smoothly to her lips, the color matches the product",
      "she presses her lips together and smiles",
    ],
  }),
  s({
    id: "skincare-textura", name: "Textura do skincare", group: "Acessórios & beleza", kind: "apply", camera: CLOSE, setting: BATHROOM, back: false, talk: false,
    desc: "Coloca o produto nos dedos, mostra a textura e aplica no rosto.",
    beats: [
      "she shows the product packaging to the camera, label visible",
      "she dispenses a small amount onto her fingertips",
      "she rubs her fingers together showing the texture close to the lens",
      "she applies it to her cheek with gentle circular motions",
    ],
  }),
  s({
    id: "perfume-borrifada", name: "Borrifada de perfume", group: "Acessórios & beleza", kind: "hold", camera: FRONT, setting: ROOM, back: false, talk: false,
    desc: "Mostra o frasco, borrifa no pescoço e sorri sentindo o cheiro.",
    beats: [
      "she holds the perfume bottle next to her face, label visible",
      "she turns the bottle to show its design",
      "she sprays it on her neck, a fine mist visible in the light",
      "she closes her eyes and smiles enjoying the scent",
    ],
  }),

  // ───────────── Falando com a câmera
  s({
    id: "fala-mostrando", name: "Falando e mostrando a roupa", group: "Falando com a câmera", kind: "wear", camera: FRONT, setting: ROOM, back: true, talk: true,
    desc: "Fala com a câmera e afasta o celular pra mostrar a roupa, vira pra mostrar as costas.",
    beats: [
      "she talks to the front camera with an excited expression",
      "she moves the phone away to show the front of the outfit while talking",
      "she turns around briefly so the back of the outfit is visible",
      "she brings the camera back to her face and finishes with a smile",
    ],
  }),
  s({
    id: "fala-review", name: "Review sincero", group: "Falando com a câmera", kind: "hold", camera: FRONT, setting: ROOM, back: true, talk: true,
    desc: "Segura o produto e fala como depoimento, mostrando frente e verso.",
    beats: [
      "she looks at the camera with an honest expression, holding the product",
      "she talks about it, showing the front of the product to the lens",
      "she turns the product to show the back",
      "she recommends it with a sincere smile",
    ],
  }),
  s({
    id: "fala-unboxing", name: "Abrindo o pacote", group: "Falando com a câmera", kind: "hold", camera: FRONT, setting: ROOM, back: true, talk: true,
    desc: "Rasga o pacote do correio, tira o produto e mostra animada.",
    beats: [
      "she holds a gray courier shipping bag up to the camera, excited",
      "she tears it open and pulls out the product",
      "she shows the front of the product to the camera",
      "she flips it to show the back, smiling",
    ],
  }),
  s({
    id: "fala-carro", name: "Falando no carro", group: "Falando com a câmera", kind: "hold", camera: FRONT, setting: "inside a parked car, driver's seat, natural daylight through the windshield", back: false, talk: true,
    desc: "Clássico UGC no banco do carro, mostra o produto e comenta.",
    beats: [
      "she sits in the driver's seat talking to the front camera",
      "she brings the product into the frame",
      "she points at the product while talking",
      "she laughs and nods",
    ],
  }),
  s({
    id: "fala-segredo", name: "Contando um segredo", group: "Falando com a câmera", kind: "hold", camera: FRONT, setting: ROOM, back: false, talk: true,
    desc: "Chega perto da câmera e fala baixinho, como quem conta um achado.",
    beats: [
      "she leans in close to the camera looking around as if sharing a secret",
      "she whispers while showing the product close to the lens",
      "she turns the product to show its details",
      "she puts a finger on her lips and winks",
    ],
  }),

  // ───────────── Dancinha & trend
  s({
    id: "dance-groove", name: "Groove leve", group: "Dancinha & trend", kind: "wear", camera: TRIPOD, setting: ROOM, back: true, talk: false,
    desc: "Balanço leve no ritmo; no meio vira de costas e volta.",
    beats: [
      "she sways lightly to an imaginary beat, full outfit visible",
      "simple trendy moves: shoulder bounce and hip sway",
      "she turns around on the beat, showing the back of the outfit",
      "she turns back and ends with a cute pose",
    ],
  }),
  s({
    id: "dance-passos", name: "Passinhos de trend", group: "Dancinha & trend", kind: "wear", camera: TRIPOD, setting: ROOM, back: true, talk: false,
    desc: "Sequência curta de passos e um giro no final.",
    beats: [
      "she does a step to the left and right in rhythm",
      "a short hand-gesture choreography",
      "a quick spin that shows the back of the outfit",
      "she freezes in a final pose with a smile",
    ],
  }),
  s({
    id: "dance-cabelo", name: "Jogando o cabelo", group: "Dancinha & trend", kind: "wear", camera: `${TRIPOD}, slow-motion feel`, setting: ROOM, back: true, talk: false,
    desc: "Olha pra baixo, levanta e joga o cabelo em câmera lenta, depois vira.",
    beats: [
      "she looks down, then lifts her head",
      "she flips her hair in slow motion",
      "she turns showing the back of the outfit, hair flowing",
      "she looks back at the camera with confident eyes",
    ],
  }),
  s({
    id: "transicao-roupa", name: "Transição de look", group: "Dancinha & trend", kind: "wear", camera: TRIPOD, setting: ROOM, back: true, talk: false,
    desc: "Começa de camiseta básica, gira e aparece com o produto.",
    beats: [
      "she stands in a plain oversized t-shirt facing the camera",
      "she spins quickly, a fast motion blur hides the change",
      "she stops wearing the product outfit, front fully visible",
      "she turns to show the back, then faces the camera smiling",
    ],
  }),
];

export const SETTINGS: Setting[] = [
  { id: "quarto-espelho", name: "Quarto com espelho", prompt: BEDROOM_MIRROR },
  { id: "banheiro", name: "Banheiro", prompt: BATHROOM },
  { id: "quarto-clean", name: "Quarto clean", prompt: ROOM },
  { id: "closet", name: "Closet", prompt: "a walk-in closet with clothes on hangers and a tall mirror, bright even lighting" },
  { id: "elevador", name: "Elevador", prompt: "a stainless steel elevator with a mirrored back wall, cool overhead lights" },
  { id: "sala", name: "Sala", prompt: "a modern living room with a beige sofa and plants, afternoon natural light" },
  { id: "provador", name: "Provador de loja", prompt: "a clothing store fitting room with a curtain and a large mirror, warm boutique lighting" },
  { id: "rua", name: "Rua / calçada", prompt: "a stylish city sidewalk with storefronts and trees in daylight" },
  { id: "estudio", name: "Estúdio fundo bege", prompt: "a seamless warm beige studio backdrop with soft diffused light" },
  { id: "varanda", name: "Varanda (pôr do sol)", prompt: "an apartment balcony with plants and a city view at golden hour" },
];
