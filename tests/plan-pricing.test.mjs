import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";

const source = await readFile(new URL("../src/pages/admin/planPresentation.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { annualSaving, bundleTotals, money, percent } = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

test("annual savings use twelve monthly payments, with Colombian formatting", () => {
  const saving = annualSaving("24900", "219000");
  assert.equal(saving.amount, 79800);
  assert.equal(percent(saving.percent), "26,7");
  assert.match(money(219000), /219\.000/);
});

test("combo discount is applied once to each matching period", () => {
  const totals = bundleTotals({ monthly_price: "24900", yearly_price: "219000" }, { monthly_price: "9900", yearly_price: "89000" }, 5);
  assert.equal(totals.monthly.total, 33060);
  assert.equal(totals.annual.total, 292600);
  assert.equal(totals.annual.base - totals.annual.total, 15400);
  assert.equal(annualSaving(totals.monthly.total, totals.annual.total).amount, 104120);
});

test("undefined and zero prices never invent positive savings", () => {
  for (const pair of [[null, 100], [100, null], [0, 0], [0, 100], [10, 150], ["", ""]]) {
    assert.equal(annualSaving(...pair), null);
  }
  assert.equal(bundleTotals({ monthly_price: null, yearly_price: null }, undefined, 5).monthly, null);
  assert.equal(money(null), "Sin definir");
  assert.equal(money("."), "Sin definir");
  assert.equal(bundleTotals(undefined, undefined, 101).monthly, null);
});

test("rounds half-up to cents consistently with Decimal", () => {
  const totals = bundleTotals({ monthly_price: "0.01", yearly_price: "0.01" }, { monthly_price: "0.00", yearly_price: "0.00" }, 50);
  assert.equal(totals.monthly.total, 0.01);
  assert.equal(totals.annual.total, 0.01);
});
