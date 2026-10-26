/** Kiểm tra hai bộ dịch có cùng khóa và mã nguồn không tham chiếu khóa bị thiếu. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read = (language) => JSON.parse(fs.readFileSync(`src/i18n/locales/${language}.json`, 'utf8'));
function keys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, entry]) =>
    typeof entry === 'object' ? keys(entry, prefix + key + '.') : [prefix + key],
  );
}
const vi = new Set(keys(read('vi')));
const en = new Set(keys(read('en')));
assert.deepEqual([...vi].sort(), [...en].sort(), 'Hai ngôn ngữ phải có cùng bộ khóa');
const missing = new Set();
const pattern =
  /['"]((?:common|nav|home|movies|showtimes|booking|tickets|auth|profile|reviews|admin|errors|page404|page403|values|pricing|languages|footer)\.[\w.]+)['"]/g;
for (const file of fs
  .readdirSync('src', { recursive: true })
  .filter((file) => /\.tsx?$/.test(file))) {
  const source = fs.readFileSync('src/' + file, 'utf8');
  for (const match of source.matchAll(pattern))
    if (!vi.has(match[1]) || !en.has(match[1])) missing.add(`${file}: ${match[1]}`);
}
assert.deepEqual([...missing], [], 'Thiếu khóa dịch');
console.log(`PASS: ${vi.size} khóa Việt/Anh khớp nhau, không thiếu khóa tĩnh trong TypeScript.`);
