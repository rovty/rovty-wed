import fs from "node:fs";
import ts from "typescript";
// Nitro reads wrangler.jsonc at build time. Replace deployment-only fields in
// its generated config after the separately validated staging build.
const target = ".output/server/wrangler.json";
const generated = JSON.parse(fs.readFileSync(target, "utf8"));
const stage = ts.parseConfigFileTextToJson(
  "wrangler.staging.jsonc",
  fs.readFileSync("wrangler.staging.jsonc", "utf8"),
).config;
if (!stage.name?.includes("staging") || !stage.vars?.SUPABASE_URL)
  throw new Error("Invalid staging configuration");
generated.name = stage.name;
generated.vars = stage.vars;
delete generated.routes;
delete generated.triggers;
if (stage.routes) generated.routes = stage.routes;
fs.writeFileSync(target, JSON.stringify(generated, null, 2) + "\n");
console.log("Prepared the isolated staging Worker configuration.");
