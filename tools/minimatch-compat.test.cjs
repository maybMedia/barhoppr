const assert = require("node:assert/strict");
const { test } = require("node:test");
const enableLegacyMinimatch = require("./minimatch-compat.cjs");

enableLegacyMinimatch();
const minimatch = require("minimatch");

test("legacy plugins can call the default export and use matching helpers", () => {
  assert.equal(minimatch("src/app/page.tsx", "**/*.tsx"), true);
  assert.equal(minimatch("src/app/page.tsx", "**/*.js"), false);
  assert.equal(minimatch("Button", "B*", { noglobstar: true }), true);
  assert.deepEqual(minimatch.match(["a.ts", "b.js"], "*.ts"), ["a.ts"]);
});

test("ESLint and TypeScript consumers retain named exports and constructors", () => {
  assert.equal(minimatch.minimatch, minimatch);
  const matcher = new minimatch.Minimatch("**/*.ts", { dot: true });
  assert.equal(matcher.match(".config/lint.ts"), true);
  assert.equal(matcher.match("src/app/page.tsx"), false);
  assert.deepEqual(minimatch.braceExpand("*.{ts,tsx}"), ["*.ts", "*.tsx"]);
  assert.equal(minimatch.defaults({ nocase: true })("APP.TS", "*.ts"), true);
});

test("the adapter is idempotent and delegates to the patched upstream package", () => {
  enableLegacyMinimatch();
  assert.equal(require("minimatch"), minimatch);
  const { version } = require("minimatch/package.json");
  assert.match(version, /^11\./);
  assert.equal(Number(version.split(".")[2]) >= 4 || Number(version.split(".")[1]) > 0, true);
});

test("the configured React plugin evaluates globs with the callable API", async () => {
  const { ESLint } = require("eslint");
  const eslint = new ESLint({
    overrideConfig: {
      rules: { "react/no-unstable-nested-components": "error" },
    },
  });
  const [result] = await eslint.lintText(
    "function Container({ footer }) { return footer(); }\n" +
      "export default function Example() { return <Container footer={() => <div />} />; }\n",
    { filePath: "src/minimatch-compat-check.tsx" },
  );
  assert.equal(result.fatalErrorCount, 0);
  assert.ok(result.messages.some(({ ruleId }) => ruleId === "react/no-unstable-nested-components"));
});
