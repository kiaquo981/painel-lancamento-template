// Gera o SQL do schema do cliente a partir de supabase/schema.sql e do lancamento.config.json.
import { readFileSync, writeFileSync } from "node:fs";
const cfg = JSON.parse(readFileSync("lancamento.config.json", "utf8"));
const schema = cfg.banco.schema;
if (!/^[a-z][a-z0-9_]{1,40}$/.test(schema)) throw new Error(`schema inválido: "${schema}" (use minúsculas, números e _)`);
const sql = readFileSync("supabase/schema.sql", "utf8").replaceAll("__SCHEMA__", schema);
const saida = `supabase/schema.${schema}.sql`;
writeFileSync(saida, sql);
console.log(saida);
