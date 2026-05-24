#!/usr/bin/env node

const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");
const fs = require("node:fs");
const path = require("node:path");

const USE_CASES = {
  gaming: "Gaming",
  streaming: "Streaming",
  creator: "Video / Creator",
  ai: "KI / 3D",
  office: "Office / Schule",
  allround: "Allround",
};

const GOALS = {
  "1080p": "1080p / Full HD",
  "1440p": "1440p / WQHD",
  "4k": "4K / UHD",
  quiet: "Leise",
  upgrade: "Spaeter aufruesten",
};

const templates = [
  {
    id: "office-5600gt",
    uses: ["office"],
    goals: ["1080p", "quiet", "upgrade"],
    title: "Office-PC mit integrierter Grafik",
    dubaroName: "Office-PC Ryzen 5 5600GT mit Radeon Grafik",
    dubaroPrice: 699,
    dubaroUrl: "https://www.dubaro.de/Desktop-PCs/",
    targetBudget: 700,
    notes: [
      "Gut fuer Schule, Office, Browser und einfache Spiele.",
      "Keine extra Grafikkarte noetig, dadurch guenstig und sparsam.",
    ],
    parts: [
      part("CPU", "AMD Ryzen 5 5600GT", 95, "AMD Ryzen 5 5600GT"),
      part("GPU", "AMD Vega Grafik in der CPU", 0, "AMD Ryzen 5 5600GT"),
      part("Mainboard", "B550M Mainboard mit WLAN", 95, "B550M WLAN Mainboard"),
      part("RAM", "16GB DDR4-3200", 60, "16GB DDR4 3200 CL16"),
      part("SSD", "512GB SATA oder NVMe SSD", 45, "512GB SSD"),
      part("Netzteil", "550-650W 80+ Bronze", 60, "650W 80+ Bronze Netzteil"),
      part("Gehaeuse", "Airflow mATX Gehaeuse", 65, "mATX Airflow Gehaeuse"),
      part("Kuehler", "einfacher Tower-Kuehler", 25, "AM4 Tower Kuehler"),
    ],
  },
  {
    id: "office-8700g",
    uses: ["office", "allround"],
    goals: ["upgrade", "quiet"],
    title: "Aufruestbarer Alltags-PC",
    dubaroName: "Einsteiger/Aufruest Gaming PC Ryzen 7 8700G mit AMD Radeon 780M",
    dubaroPrice: 1249,
    dubaroUrl: "https://www.dubaro.de/Desktop-PCs/Dubaro-Einsteiger-Aufruest-PCs/",
    targetBudget: 1200,
    notes: [
      "Moderne AM5-Plattform, sehr gut zum spaeteren Nachruesten einer Grafikkarte.",
      "Sinnvoll fuer Office, Schule, leichte Games und viele Tabs.",
    ],
    parts: [
      part("CPU", "AMD Ryzen 7 8700G", 260, "AMD Ryzen 7 8700G"),
      part("GPU", "AMD Radeon 780M in der CPU", 0, "AMD Ryzen 7 8700G"),
      part("Mainboard", "ASUS TUF Gaming B650-E WIFI oder aehnlich", 160, "ASUS TUF Gaming B650-E WIFI"),
      part("RAM", "32GB DDR5-5600/6000", 380, "32GB DDR5 6000 CL30"),
      part("SSD", "1TB NVMe SSD", 85, "1TB NVMe SSD PCIe 4.0"),
      part("Netzteil", "650W 80+ Bronze", 70, "650W 80+ Bronze Netzteil"),
      part("Gehaeuse", "ENDORFY Ventum 200 Air oder aehnlich", 80, "ENDORFY Ventum 200 Air"),
      part("Kuehler", "solider AM5 Tower-Kuehler", 35, "AM5 Tower Kuehler"),
    ],
  },
  {
    id: "gaming-radeon-entry",
    uses: ["gaming", "streaming", "creator", "allround"],
    goals: ["1080p"],
    title: "1080p Gaming/Streaming Creator-Budget",
    dubaroName: "Gaming PC Ryzen 5 5600 mit RX 7600",
    dubaroPrice: 949,
    dubaroUrl: "https://www.dubaro.de/Gaming-PCs/Ryzen-Radeon-Systeme/",
    targetBudget: 950,
    notes: [
      "Fuer 800-1000 Euro ist der Ryzen 5 5600 die rundere AM4-Basis als der Ryzen 5 5500.",
      "32GB RAM sind fuer Gaming plus OBS plus Video-Tools deutlich entspannter als 16GB.",
      "Der Kuehler bleibt guenstig; das gesparte Geld geht lieber in RAM und SSD.",
    ],
    parts: [
      part("CPU", "AMD Ryzen 5 5600", 105, "AMD Ryzen 5 5600"),
      part("GPU", "AMD Radeon RX 7600 8GB", 230, "Radeon RX 7600 8GB"),
      part("Mainboard", "ASRock B550M Pro4 oder B550M aehnlich", 85, "ASRock B550M Pro4"),
      part("RAM", "32GB DDR4-3200/3600, 2x16GB", 75, "32GB DDR4 3600 2x16GB"),
      part("SSD", "2TB NVMe SSD statt ueberteuerter 1TB SSD", 110, "2TB NVMe SSD"),
      part("Netzteil", "650W 80+ Bronze", 65, "650W 80+ Bronze Netzteil"),
      part("Gehaeuse", "Preiswertes Airflow-Gehaeuse", 65, "Airflow Gehaeuse ATX"),
      part("Kuehler", "Boxed-Kuehler oder 20-30 Euro Tower-Kuehler", 25, "AM4 Tower Kuehler 120mm"),
    ],
  },
  {
    id: "gaming-7500f-5060",
    uses: ["gaming", "allround", "streaming"],
    goals: ["1080p", "upgrade"],
    title: "Dubaro-aehnlicher AM5 Gaming-PC",
    dubaroName: "Gaming PC Ryzen 5 7500F mit RTX5060",
    dubaroPrice: 1299,
    dubaroUrl: "https://www.dubaro.de/Gaming-PCs/AMD-Ryzen-Gaming-PC/",
    targetBudget: 1300,
    notes: [
      "Gute moderne Basis mit 32GB DDR5 und AM5.",
      "Fuer 1080p sehr passend, fuer 1440p nur mit angepassten Details.",
    ],
    parts: [
      part("CPU", "AMD Ryzen 5 7500F", 115, "AMD Ryzen 5 7500F"),
      part("GPU", "NVIDIA GeForce RTX 5060 8GB", 300, "GeForce RTX 5060 8GB"),
      part("Mainboard", "ASUS TUF Gaming B650-E WIFI oder MSI B850 WIFI", 160, "B650 B850 WIFI Mainboard AM5"),
      part("RAM", "32GB DDR5-6000", 380, "32GB DDR5 6000 CL30"),
      part("SSD", "1TB NVMe SSD", 85, "1TB NVMe SSD PCIe 4.0"),
      part("Netzteil", "750W 80+ Gold ATX 3.1", 110, "750W ATX 3.1 80 Plus Gold Netzteil"),
      part("Gehaeuse", "Airflow Gaming-Gehaeuse", 90, "Airflow Gaming Gehaeuse"),
      part("Kuehler", "Tower-Kuehler fuer AM5", 40, "AM5 Tower Kuehler"),
    ],
  },
  {
    id: "gaming-7500f-5070",
    uses: ["gaming", "streaming", "allround"],
    goals: ["1440p", "upgrade"],
    title: "1440p Preis-Leistung",
    dubaroName: "Gaming PC Ryzen 5 7500F mit RTX5070",
    dubaroPrice: 1599,
    dubaroUrl: "https://www.dubaro.de/Gaming-PCs/AMD-Ryzen-Gaming-PC/",
    targetBudget: 1650,
    notes: [
      "Orientiert an Dubaros Ryzen-5-7500F/RTX5070-Klasse.",
      "Sehr guter Bereich fuer WQHD, solange CPU-lastige Spiele nicht absolute High-FPS-Prioritaet haben.",
    ],
    parts: [
      part("CPU", "AMD Ryzen 5 7500F", 115, "AMD Ryzen 5 7500F"),
      part("GPU", "NVIDIA GeForce RTX 5070 12GB", 580, "GeForce RTX 5070 12GB"),
      part("Mainboard", "B850 Gaming WIFI6", 175, "GIGABYTE B850 Gaming WIFI6"),
      part("RAM", "32GB DDR5-6000 CL30", 380, "32GB DDR5 6000 CL30"),
      part("SSD", "1TB NVMe SSD PCIe 4.0", 85, "1TB NVMe SSD PCIe 4.0"),
      part("Netzteil", "750W 80+ Gold ATX 3.1", 110, "MSI MAG A750GL PCIE5 750W"),
      part("Gehaeuse", "Airflow Gaming-Gehaeuse", 95, "ENDORFY Arx 700 ARGB"),
      part("Kuehler", "leiser Tower-Kuehler", 55, "AM5 Tower Kuehler leise"),
    ],
  },
  {
    id: "gaming-7800x3d-9070xt",
    uses: ["gaming", "allround"],
    goals: ["1440p", "4k", "quiet"],
    title: "High-FPS WQHD Gaming",
    dubaroName: "Gaming PC Ryzen 7 7800X3D mit RX 9070XT",
    dubaroPrice: 2099,
    dubaroUrl: "https://www.dubaro.de/Gaming-PCs/AMD-Ryzen-Gaming-PC/",
    targetBudget: 2150,
    notes: [
      "X3D-CPU plus RX 9070 XT ist stark fuer 1440p und oft auch 4K spielbar.",
      "Wenn Raytracing wichtig ist, nimm statt RX 9070 XT eine RTX 5070 Ti.",
    ],
    parts: [
      part("CPU", "AMD Ryzen 7 7800X3D", 280, "AMD Ryzen 7 7800X3D"),
      part("GPU", "AMD Radeon RX 9070 XT 16GB", 650, "Radeon RX 9070 XT 16GB"),
      part("Mainboard", "Gigabyte B650/B850 Gaming X AX WIFI", 180, "Gigabyte B650 Gaming X AX V2"),
      part("RAM", "32GB DDR5-6000 CL30", 380, "32GB DDR5 6000 CL30"),
      part("SSD", "1TB NVMe SSD PCIe 4.0", 85, "1TB NVMe SSD PCIe 4.0"),
      part("Netzteil", "850W 80+ Gold ATX 3.1", 125, "850W ATX 3.1 80 Plus Gold Netzteil"),
      part("Gehaeuse", "grosses Airflow-Gehaeuse", 120, "Airflow Gehaeuse ATX 140mm Luefter"),
      part("Kuehler", "Premium Luftkuehler", 80, "Thermalright Peerless Assassin AM5"),
    ],
  },
  {
    id: "creator-7700-5060ti",
    uses: ["creator", "streaming", "ai"],
    goals: ["1080p", "1440p", "upgrade"],
    title: "Creator/Streaming Einstieg",
    dubaroName: "Studio PC Ryzen 7 7700 mit RTX 5060Ti",
    dubaroPrice: 1599,
    dubaroUrl: "https://www.dubaro.de/Desktop-PCs/NVIDIA-RTX-Studio-PCs/",
    targetBudget: 1600,
    notes: [
      "NVIDIA-GPU wegen Encoder, CUDA und breiter Software-Unterstuetzung.",
      "Fuer Video/Streaming besser als ein reiner Billig-Gaming-PC.",
    ],
    parts: [
      part("CPU", "AMD Ryzen 7 7700", 220, "AMD Ryzen 7 7700"),
      part("GPU", "NVIDIA GeForce RTX 5060 Ti 16GB", 450, "GeForce RTX 5060 Ti 16GB"),
      part("Mainboard", "ASUS TUF Gaming B850-Plus WIFI", 190, "ASUS TUF Gaming B850-Plus WIFI"),
      part("RAM", "32GB DDR5-6000", 380, "32GB DDR5 6000 CL30"),
      part("SSD", "1TB NVMe SSD", 85, "1TB NVMe SSD PCIe 4.0"),
      part("Netzteil", "750W 80+ Gold ATX 3.1", 110, "750W ATX 3.1 80 Plus Gold Netzteil"),
      part("Gehaeuse", "leises Airflow-Gehaeuse", 110, "leises Airflow Gehaeuse"),
      part("Kuehler", "leiser Tower-Kuehler", 65, "AM5 Tower Kuehler leise"),
    ],
  },
  {
    id: "creator-9900x-5070ti",
    uses: ["creator", "streaming", "ai"],
    goals: ["1440p", "4k", "upgrade"],
    title: "Studio-PC fuer 4K Video und KI",
    dubaroName: "Studio PC Ryzen 9 9900X mit RTX5070Ti",
    dubaroPrice: 2799,
    dubaroUrl: "https://www.dubaro.de/Desktop-PCs/NVIDIA-RTX-Studio-PCs/",
    targetBudget: 2800,
    notes: [
      "Viele CPU-Kerne, 64GB RAM und RTX 5070 Ti fuer Schnitt, Blender, OBS und lokale KI.",
      "Fuer reine Spiele waere eine 7800X3D/9800X3D-CPU meist sinnvoller.",
    ],
    parts: [
      part("CPU", "AMD Ryzen 9 9900X", 400, "AMD Ryzen 9 9900X"),
      part("GPU", "NVIDIA GeForce RTX 5070 Ti 16GB", 850, "GeForce RTX 5070 Ti 16GB"),
      part("Mainboard", "MSI PRO B850-P WiFi", 190, "MSI PRO B850-P WiFi"),
      part("RAM", "64GB DDR5-6000", 720, "64GB DDR5 6000 CL30"),
      part("SSD", "2TB NVMe SSD PCIe 4.0", 150, "2TB NVMe SSD PCIe 4.0"),
      part("Netzteil", "850W 80+ Gold ATX 3.1", 125, "850W ATX 3.1 80 Plus Gold Netzteil"),
      part("Gehaeuse", "grosses leises Airflow-Gehaeuse", 140, "leises Airflow Gehaeuse ATX"),
      part("Kuehler", "280mm AIO oder grosser Luftkuehler", 120, "AM5 280mm AIO"),
    ],
  },
  {
    id: "gaming-9800x3d-5080",
    uses: ["gaming", "allround", "ai"],
    goals: ["4k"],
    title: "4K High-End Gaming",
    dubaroName: "Gaming PC Ryzen 7 9800X3D mit RTX5080",
    dubaroPrice: 3149,
    dubaroUrl: "https://www.dubaro.de/Gaming-PCs/AMD-Ryzen-Gaming-PC/",
    targetBudget: 3200,
    notes: [
      "Starke X3D-Gaming-CPU plus RTX 5080 fuer 4K, Raytracing und KI-Features.",
      "Teuer, aber die erste wirklich runde 4K-Klasse im Generator.",
    ],
    parts: [
      part("CPU", "AMD Ryzen 7 9800X3D", 430, "AMD Ryzen 7 9800X3D"),
      part("GPU", "NVIDIA GeForce RTX 5080 16GB", 1200, "GeForce RTX 5080 16GB"),
      part("Mainboard", "ASUS TUF Gaming B850-Plus WiFi", 210, "ASUS TUF Gaming B850-Plus WiFi"),
      part("RAM", "32GB DDR5-6000 CL30", 380, "32GB DDR5 6000 CL30"),
      part("SSD", "2TB NVMe SSD PCIe 4.0", 150, "2TB NVMe SSD PCIe 4.0"),
      part("Netzteil", "1000W 80+ Gold ATX 3.1", 170, "1000W ATX 3.1 80 Plus Gold Netzteil"),
      part("Gehaeuse", "grosses High-Airflow-Gehaeuse", 160, "High Airflow Gehaeuse ATX"),
      part("Kuehler", "360mm AIO oder Premium-Luftkuehler", 140, "AM5 360mm AIO"),
    ],
  },
  {
    id: "creator-9950x-5080",
    uses: ["creator", "ai"],
    goals: ["4k", "upgrade"],
    title: "Creator/AI High-End",
    dubaroName: "Studio PC Ryzen 9 9950X mit RTX5080",
    dubaroPrice: 3399,
    dubaroUrl: "https://www.dubaro.de/Desktop-PCs/NVIDIA-RTX-Studio-PCs/",
    targetBudget: 3400,
    notes: [
      "Sehr stark fuer Rendering, 4K/8K-Schnitt, Blender und lokale KI-Experimente.",
      "Bei KI ist VRAM oft wichtiger als CPU, deshalb RTX-Klasse genau pruefen.",
    ],
    parts: [
      part("CPU", "AMD Ryzen 9 9950X", 540, "AMD Ryzen 9 9950X"),
      part("GPU", "NVIDIA GeForce RTX 5080 16GB", 1200, "GeForce RTX 5080 16GB"),
      part("Mainboard", "MSI MAG X870 TOMAHAWK WiFi", 270, "MSI MAG X870 TOMAHAWK WIFI"),
      part("RAM", "64GB DDR5-6000", 720, "64GB DDR5 6000 CL30"),
      part("SSD", "2TB NVMe SSD PCIe 4.0", 150, "2TB NVMe SSD PCIe 4.0"),
      part("Netzteil", "1000W 80+ Gold ATX 3.1", 170, "1000W ATX 3.1 80 Plus Gold Netzteil"),
      part("Gehaeuse", "grosses Workstation-Airflow-Gehaeuse", 170, "Workstation Airflow Gehaeuse"),
      part("Kuehler", "360mm AIO", 140, "AM5 360mm AIO"),
    ],
  },
];

function part(type, name, estimate, query) {
  return { type, name, estimate, query };
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) continue;

    const key = value.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

async function askMissing(args) {
  const rl = readline.createInterface({ input, output });
  try {
    if (!args.budget && !(args.min && args.max)) {
      args.budget = await rl.question("Wie hoch ist dein Budget in Euro? Du kannst auch eine Spanne eingeben, z.B. 1200-1800: ");
    }

    if (!args.use) {
      printChoices("Wofuer wird der PC benutzt? Mehrere Kategorien gehen mit Komma, z.B. gaming,streaming.", USE_CASES);
      args.use = await rl.question("Auswahl: ");
    }

    if (!args.goal) {
      printChoices("Was ist dein Ziel?", GOALS);
      args.goal = await rl.question("Auswahl: ");
    }
  } finally {
    rl.close();
  }

  return args;
}

function printChoices(title, choices) {
  console.log(`\n${title}`);
  Object.entries(choices).forEach(([key, label]) => {
    console.log(`  ${key.padEnd(10)} ${label}`);
  });
}

function normalizeUse(value) {
  const normalized = String(value || "").trim().toLowerCase();
  const aliases = {
    zocken: "gaming",
    spiele: "gaming",
    spiel: "gaming",
    game: "gaming",
    gamingpc: "gaming",
    stream: "streaming",
    video: "creator",
    schnitt: "creator",
    creator: "creator",
    ki: "ai",
    ai: "ai",
    "3d": "ai",
    schule: "office",
    buero: "office",
    bueuro: "office",
    office: "office",
    arbeit: "office",
    alles: "allround",
    allround: "allround",
  };
  return aliases[normalized] || normalized;
}

function normalizeUses(value) {
  const parts = String(value || "")
    .trim()
    .split(/(?:,|\+|\/|;|&|\bund\b|\band\b|\boder\b|\bor\b|\s)+/i)
    .filter(Boolean);

  return [...new Set(parts.map(normalizeUse))];
}

function useLabel(uses) {
  return uses.map((use) => USE_CASES[use]).join(" + ");
}

function normalizeGoal(value) {
  const normalized = String(value || "").trim().toLowerCase();
  const aliases = {
    fullhd: "1080p",
    fhd: "1080p",
    "1080": "1080p",
    wqhd: "1440p",
    "2k": "1440p",
    "1440": "1440p",
    uhd: "4k",
    "2160p": "4k",
    leise: "quiet",
    silent: "quiet",
    aufruesten: "upgrade",
    upgrade: "upgrade",
  };
  return aliases[normalized] || normalized;
}

function parseMoneyValue(value) {
  const text = String(value || "")
    .trim()
    .replace(/\s/g, "")
    .replace(/[^\d,.-]/g, "");

  if (!text) return NaN;

  let normalized = text;
  if (normalized.includes(",")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(normalized)) {
    normalized = normalized.replace(/\./g, "");
  }

  return Number(normalized);
}

function parseBudgetRange(args) {
  let min;
  let max;

  if (args.min || args.max) {
    if (!args.min || !args.max) {
      throw new Error("Bitte gib fuer eine Preisspanne --min und --max an, zum Beispiel --min 1200 --max 1800.");
    }

    min = parseMoneyValue(args.min);
    max = parseMoneyValue(args.max);
  } else {
    const rawBudget = String(args.budget || "").trim();
    const parts = rawBudget.split(/\s*(?:-|bis|to)\s*/i).filter(Boolean);

    if (parts.length >= 2) {
      min = parseMoneyValue(parts[0]);
      max = parseMoneyValue(parts[1]);
    } else {
      min = parseMoneyValue(rawBudget);
      max = min;
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0) {
    throw new Error("Budget muss eine Zahl oder Spanne sein, zum Beispiel 1500 oder 1200-1800.");
  }

  if (min > max) {
    const oldMin = min;
    min = max;
    max = oldMin;
  }

  return {
    min,
    max,
    target: Math.round((min + max) / 2),
    isRange: min !== max,
  };
}

function chooseTemplate(uses, goal, budgetRange) {
  const preferredBudget = budgetRange.isRange ? budgetRange.max : budgetRange.target;
  const candidates = templates
    .map((template) => ({
      template,
      matches: uses.filter((use) => template.uses.includes(use)),
    }))
    .filter((candidate) => candidate.matches.length > 0)
    .map((template) => {
      const useMatchCount = template.matches.length;
      const templateData = template.template;
      let score = 0;
      const distance = Math.abs(templateData.targetBudget - preferredBudget);

      if (budgetRange.isRange) {
        if (templateData.targetBudget >= budgetRange.min && templateData.targetBudget <= budgetRange.max) {
          score += 500;
          score += ((templateData.targetBudget - budgetRange.min) / (budgetRange.max - budgetRange.min || 1)) * 80;
        } else if (templateData.targetBudget < budgetRange.min) {
          score += 120;
          score -= (budgetRange.min - templateData.targetBudget) / 10;
        } else {
          score -= (templateData.targetBudget - budgetRange.max) / 4;
        }
      } else {
        if (templateData.targetBudget <= budgetRange.max) score += 400;
        if (templateData.targetBudget <= budgetRange.max * 1.08) score += 160;
      }

      score += useMatchCount * 180;
      if (useMatchCount === uses.length) score += 220;
      if (templateData.goals.includes(goal)) score += 220;
      if (goal === "4k" && templateData.targetBudget >= 2000) score += 80;
      if (goal === "upgrade" && templateData.parts.some((candidate) => candidate.name.includes("B650") || candidate.name.includes("B850"))) score += 60;
      if (goal === "quiet" && templateData.parts.some((candidate) => candidate.name.toLowerCase().includes("leise"))) score += 60;
      score -= distance / 12;
      return { template: templateData, score };
    })
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.template || templates.find((template) => template.id === "gaming-7500f-5060");
}

function geizhalsUrl(query) {
  const params = new URLSearchParams();
  params.set("fs", query);
  params.append("hloc", "de");
  params.append("hloc", "at");
  return `https://geizhals.de/?${params.toString()}`;
}

function money(value) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function sumParts(parts) {
  return parts.reduce((sum, item) => sum + item.estimate, 0);
}

function budgetLabel(budgetRange) {
  if (!budgetRange.isRange) return money(budgetRange.max);
  return `${money(budgetRange.min)} bis ${money(budgetRange.max)}`;
}

function budgetFitText(targetBudget, budgetRange) {
  if (budgetRange.isRange) {
    if (targetBudget < budgetRange.min) {
      return `${money(budgetRange.min - targetBudget)} unter deiner Spanne`;
    }
    if (targetBudget <= budgetRange.max) {
      return "liegt in deiner Spanne";
    }
    return `${money(targetBudget - budgetRange.max)} ueber deiner Spanne`;
  }

  const diffToBudget = budgetRange.max - targetBudget;
  return diffToBudget >= 0
    ? `${money(diffToBudget)} Reserve gegenueber der Zielklasse`
    : `${money(Math.abs(diffToBudget))} ueber deiner Zielklasse`;
}

function renderRecommendation(template, inputData) {
  const partsTotal = sumParts(template.parts);
  const diffText = budgetFitText(template.targetBudget, inputData.budgetRange);

  const lines = [];
  lines.push("");
  lines.push("=".repeat(72));
  lines.push(`PC-Vorschlag: ${template.title}`);
  lines.push("=".repeat(72));
  lines.push(`Budget: ${budgetLabel(inputData.budgetRange)} | Nutzung: ${useLabel(inputData.uses)} | Ziel: ${GOALS[inputData.goal]}`);
  lines.push(`Dubaro-Orientierung: ${template.dubaroName}`);
  lines.push(`Dubaro-Preis gesehen: ca. ${money(template.dubaroPrice)} | Zielklasse: ${money(template.targetBudget)} (${diffText})`);
  lines.push(`Einzelteile grob ueber Geizhals-Suche: ca. ${money(partsTotal)} ohne Versand, Windows und Montage`);
  lines.push("");
  lines.push("Komponenten");
  lines.push("-".repeat(72));
  lines.push(`${"Teil".padEnd(12)}${"Empfehlung".padEnd(43)}${"Schaetzung".padStart(12)}`);
  lines.push("-".repeat(72));

  for (const item of template.parts) {
    lines.push(`${item.type.padEnd(12)}${truncate(item.name, 41).padEnd(43)}${money(item.estimate).padStart(12)}`);
  }

  lines.push("");
  lines.push("Warum dieser Vorschlag?");
  template.notes.forEach((note) => lines.push(`- ${note}`));
  lines.push("");
  lines.push("Geizhals-Suchlinks");
  template.parts.forEach((item) => {
    lines.push(`- ${item.type}: ${geizhalsUrl(item.query)}`);
  });
  lines.push("");
  lines.push(`Dubaro-Vergleich: ${template.dubaroUrl}`);
  lines.push("");
  lines.push("Hinweis: Preise schwanken stark. Vergleiche bei Geizhals immer Verfuegbarkeit, Versandkosten, Haendlerbewertung und genaue Modellnummer.");
  return lines.join("\n");
}

function getOptions() {
  return {
    useCases: Object.entries(USE_CASES).map(([id, label]) => ({ id, label })),
    goals: Object.entries(GOALS).map(([id, label]) => ({ id, label })),
  };
}

function generateRecommendation(options) {
  const budgetRange = parseBudgetRange({
    budget: options.budget,
    min: options.min,
    max: options.max,
  });
  const uses = Array.isArray(options.uses)
    ? [...new Set(options.uses.map(normalizeUse))]
    : normalizeUses(options.use || options.uses);
  const goal = normalizeGoal(options.goal || "1440p");

  const unknownUses = uses.filter((use) => !USE_CASES[use]);
  if (uses.length === 0 || unknownUses.length > 0) {
    throw new Error(`Unbekannte Nutzung: ${unknownUses.join(", ") || options.use || options.uses}. Erlaubt: ${Object.keys(USE_CASES).join(", ")}. Mehrere Werte z.B. gaming,streaming`);
  }
  if (!GOALS[goal]) {
    throw new Error(`Unbekanntes Ziel: ${options.goal}. Erlaubt: ${Object.keys(GOALS).join(", ")}`);
  }

  const template = chooseTemplate(uses, goal, budgetRange);
  const partsTotal = sumParts(template.parts);
  const text = renderRecommendation(template, { budgetRange, uses, goal });

  return {
    input: {
      budgetLabel: budgetLabel(budgetRange),
      budgetRange,
      uses,
      useLabel: useLabel(uses),
      goal,
      goalLabel: GOALS[goal],
    },
    build: {
      id: template.id,
      title: template.title,
      dubaroName: template.dubaroName,
      dubaroPrice: template.dubaroPrice,
      dubaroUrl: template.dubaroUrl,
      targetBudget: template.targetBudget,
      notes: template.notes,
    },
    totals: {
      partsTotal,
      partsTotalLabel: money(partsTotal),
      targetBudgetLabel: money(template.targetBudget),
      dubaroPriceLabel: money(template.dubaroPrice),
      budgetFit: budgetFitText(template.targetBudget, budgetRange),
    },
    parts: template.parts.map((item) => ({
      ...item,
      estimateLabel: money(item.estimate),
      geizhalsUrl: geizhalsUrl(item.query),
    })),
    text,
  };
}

function truncate(text, length) {
  if (text.length <= length) return text;
  return `${text.slice(0, length - 3)}...`;
}

function saveResult(text, fileName = "pc-vorschlag.txt") {
  const target = path.join(process.cwd(), fileName);
  fs.writeFileSync(target, `${text}\n`, "utf8");
  return target;
}

async function main() {
  const args = await askMissing(parseArgs(process.argv.slice(2)));
  const result = generateRecommendation(args);
  console.log(result.text);

  if (args.save) {
    const savedPath = saveResult(result.text);
    console.log(`\nGespeichert: ${savedPath}`);
  }
}

module.exports = {
  getOptions,
  generateRecommendation,
  geizhalsUrl,
  money,
  normalizeUses,
  normalizeGoal,
  parseBudgetRange,
};

if (require.main === module) {
  main().catch((error) => {
    console.error(`Fehler: ${error.message}`);
    process.exitCode = 1;
  });
}
