/** Audit CSS: cari selector yang didefinisikan lebih dari sekali DAN
 *  mendeklarasikan properti yang sama. Itu penyebab dua bug nyata:
 *    .rv { padding: 0 }        → menghapus padding semua kartu
 *    .svc { padding: 24px }    → padding bertumpuk dengan .svc__link
 *  Selector ganda yang cuma menambah properti BARU (mis. transform parallax)
 *  tidak berbahaya, jadi tidak ditandai. */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "app", "globals.css");
const css = fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

// ambil aturan tingkat atas beserta deklarasinya
const rules = [];
let depth = 0;
let sel = "";
let body = "";
for (let i = 0; i < css.length; i++) {
  const c = css[i];
  if (c === "{") {
    depth++;
    if (depth === 1) body = "";
    else body += c;
  } else if (c === "}") {
    depth--;
    if (depth === 0) {
      rules.push({ sel: sel.trim(), body });
      sel = "";
    } else body += c;
  } else if (depth === 0) {
    sel += c;
  } else {
    body += c;
  }
}

const props = (b) => {
  const out = new Set();
  b.split(";").forEach((d) => {
    const k = d.split(":")[0]?.trim();
    if (k) out.add(k);
  });
  return out;
};

const bySel = {};
for (const r of rules) {
  if (!r.sel || r.sel.startsWith("@")) continue;
  r.sel.split(",").forEach((one) => {
    const k = one.trim();
    if (!k || k.includes("%")) return;
    bySel[k] = bySel[k] || [];
    bySel[k].push(props(r.body));
  });
}

const clashes = [];
for (const [k, list] of Object.entries(bySel)) {
  if (list.length < 2) continue;
  const seen = new Map();
  for (const set of list) {
    for (const p of set) {
      if (seen.has(p)) clashes.push(`${k} → properti "${p}" dideklarasikan ${list.length}x`);
      else seen.set(p, true);
    }
  }
}

const benign = Object.entries(bySel).filter(([, l]) => l.length > 1).map(([k, l]) => `${k} (${l.length}x)`);

console.log(`aturan tingkat atas: ${rules.length}`);
console.log(`selector ganda (aman kalau propertinya tidak bentrok): ${benign.length ? benign.join(", ") : "tidak ada"}`);
if (clashes.length) {
  console.log("\nBENTROK PROPERTI:");
  [...new Set(clashes)].forEach((c) => console.log("  " + c));
} else {
  console.log("\ntidak ada bentrok properti");
}
process.exitCode = clashes.length ? 1 : 0;
