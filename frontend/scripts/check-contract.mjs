/** Đối chiếu đường dẫn frontend/MSW/controller và tên trường DTO trước khi nối backend thật. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { createServer } from 'vite';

const resources = ['movies', 'cinemas', 'rooms', 'showtimes', 'combos', 'promotions'];
const canonical = (path) => path.replace(/\{[^}]+\}|:[^/]+/g, ':id');
const backend = new Set();
const backendRoot = '../backend/src/main/java/com/cinema/booking';
for (const file of fs
  .readdirSync(backendRoot + '/controller', { recursive: true })
  .filter((file) => file.endsWith('.java'))) {
  const source = fs.readFileSync(`${backendRoot}/controller/${file}`, 'utf8');
  for (const match of source.matchAll(/@(Get|Post|Put|Delete)Mapping\("([^"]+)"\)/g))
    backend.add(`${match[1].toUpperCase()} ${canonical('/api/v1' + match[2])}`);
}
const frontend = new Set();
for (const file of fs
  .readdirSync('src/features', { recursive: true })
  .filter((file) => file.endsWith('api.ts'))) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync('src/features/' + file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.expression.getText(source) === 'httpClient'
    ) {
      const method = node.expression.name.text.toUpperCase();
      const arg = node.arguments[0];
      let paths = [];
      if (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) paths = [arg.text];
      else if (ts.isTemplateExpression(arg)) {
        paths = [arg.head.text];
        for (const span of arg.templateSpans) {
          const values = span.expression.getText(source) === 'resource' ? resources : [':id'];
          paths = paths.flatMap((path) => values.map((value) => path + value + span.literal.text));
        }
      }
      for (const path of paths) frontend.add(`${method} ${canonical('/api/v1' + path)}`);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { handlers } = await vite.ssrLoadModule('/src/mocks/handlers/index.ts');
  const mock = new Set(
    handlers.map(
      (handler) => `${handler.info.method.toUpperCase()} ${canonical(handler.info.path)}`,
    ),
  );
  assert.deepEqual(
    [...backend].filter((route) => !mock.has(route)),
    [],
    'Controller thiếu MSW handler',
  );
  assert.deepEqual(
    [...mock].filter((route) => !backend.has(route)),
    [],
    'MSW thiếu controller tương ứng',
  );
  assert.deepEqual(
    [...frontend].filter((route) => !backend.has(route) || !mock.has(route)),
    [],
    'Frontend gọi đường dẫn chưa có trong mock/backend',
  );
  const types = ts.createSourceFile(
    'types.ts',
    fs.readFileSync('src/types/index.ts', 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  let records = 0;
  for (const item of types.statements.filter(ts.isInterfaceDeclaration)) {
    const name = item.name.text;
    const javaName =
      name === 'Page'
        ? 'PageResponse'
        : name === 'ApiError' || name.endsWith('Response')
          ? name
          : name + 'Response';
    const java = fs.readFileSync(`${backendRoot}/dto/response/${javaName}.java`, 'utf8');
    const fields = java
      .match(/public record [^(]+\(([^)]+)\)/)[1]
      .split(/,(?![^<]*>)/)
      .map((part) => part.trim().split(/\s+/).at(-1));
    assert.deepEqual(
      fields,
      item.members.filter(ts.isPropertySignature).map((field) => field.name.getText(types)),
      `${name}: tên trường record lệch TypeScript`,
    );
    records++;
  }
  let serviceMethods = 0;
  for (const file of fs
    .readdirSync(`${backendRoot}/service`)
    .filter((file) => file.endsWith('.java'))) {
    const source = fs.readFileSync(`${backendRoot}/service/${file}`, 'utf8');
    for (const method of source.matchAll(/public (?!class)[^{]+\{([^}]*)\}/g)) {
      const body = method[1].replace(/\/\/[^\n]*/g, '').trim();
      assert.equal(
        body,
        'throw new UnsupportedOperationException("Chưa cài đặt");',
        `${file}: có logic ngoài khung yêu cầu`,
      );
      serviceMethods++;
    }
  }
  console.log(
    `PASS: ${backend.size} endpoint MSW/controller, ${frontend.size} lời gọi API frontend, ${records} DTO khớp tên trường; ${serviceMethods} hàm service chỉ có stub.`,
  );
} finally {
  await vite.close();
}
