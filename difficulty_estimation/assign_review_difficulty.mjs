import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const TARGET_DIR = path.join(REPO_ROOT, "Math_Question");
const TARGET_WORKBOOK = path.join(TARGET_DIR, "generated_question_metadata_table.xlsx");
const PREVIEW_WORKBOOK = path.join(
  TARGET_DIR,
  "generated_question_metadata_table_difficulty_dry_run.xlsx",
);
const RESULT_JSON = path.join(TARGET_DIR, "review_difficulty_dry_run.json");
const SUMMARY_REPORT = path.join(TARGET_DIR, "summary_report.md");
const IRT_WORKBOOK =
  "/Users/naoki_takahashi/Downloads/【学力定着支援システム】1−8回IRT値20260805_補正後パラメータ.xlsx";
const CONFIG_FILE = path.join(SCRIPT_DIR, "review_difficulty_config.json");
const PREVIEW_DIR = path.join(SCRIPT_DIR, "previews");

const runtimeModules =
  process.env.CODEX_RUNTIME_NODE_MODULES ||
  "/Users/naoki_takahashi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const artifactToolUrl = pathToFileURL(
  path.join(runtimeModules, "@oai", "artifact-tool", "dist", "artifact_tool.mjs"),
).href;
const { FileBlob, SpreadsheetFile } = await import(artifactToolUrl);

const args = new Set(process.argv.slice(2));
const applyMode = args.has("--apply");
const approved = args.has("--approved");

if (applyMode && !approved) {
  throw new Error(
    "--apply は承認後のみ実行できます。承認後に --apply --approved を指定してください。",
  );
}

const config = JSON.parse(await fs.readFile(CONFIG_FILE, "utf8"));

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function standardDeviation(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    (values.length - 1);
  return Math.sqrt(variance);
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replaceAll("使うする", "利用した")
    .replaceAll("使うした", "利用した")
    .replaceAll("−", "-")
    .replaceAll("―", "-")
    .replaceAll("²", "^2")
    .replace(/[\s　（）()、，,・：:_/\\-]/g, "");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function levelFor(score) {
  return config.levels.find((level) => score < level.maxExclusive)?.label ?? "L5 難";
}

function gradeShort(grade) {
  return String(grade).replace("年生", "");
}

function sourceLabel(source) {
  return {
    exact: "同一学習項目",
    alias: "高類似学習項目",
    unit: "同単元アンカー",
    grade: "同学年アンカー",
  }[source];
}

function findReference(metadata, irtRows) {
  const grade = metadata.grade;
  const unit = metadata.unit;
  const item = metadata.item;
  const sameGrade = irtRows.filter((row) => row.grade === grade);

  const exact = sameGrade.filter(
    (row) => normalize(row.unit) === normalize(unit) && normalize(row.item) === normalize(item),
  );
  if (exact.length > 0) {
    return { rows: exact, source: "exact", offset: 0 };
  }

  const rule = config.referenceRules.find(
    (candidate) =>
      candidate.grade === grade &&
      candidate.unit === unit &&
      item.includes(candidate.itemIncludes),
  );
  if (rule) {
    const aliasRows = sameGrade.filter(
      (row) =>
        normalize(row.unit) === normalize(rule.referenceUnit) &&
        normalize(row.item) === normalize(rule.referenceItem),
    );
    if (aliasRows.length > 0) {
      return { rows: aliasRows, source: "alias", offset: rule.offset ?? 0 };
    }
  }

  const aliasedUnit = config.unitAliases[`${grade}|${unit}`] ?? unit;
  const sameUnit = sameGrade.filter(
    (row) => normalize(row.unit) === normalize(aliasedUnit),
  );
  if (sameUnit.length > 0) {
    return { rows: sameUnit, source: "unit", offset: 0 };
  }

  return { rows: sameGrade, source: "grade", offset: 0 };
}

function stripTikz(text) {
  return text.replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g, " [図] ");
}

function analyzeQuestion(text, filename) {
  const problemSection = text.split(/【解答】/)[0] ?? text;
  const withoutTikz = stripTikz(problemSection);
  const compact = withoutTikz.replace(/\s+/g, " ").trim();
  const filenameLevel = /s-\d+\.txt$/i.test(filename) ? "standard" : "basic";
  const subquestionMatches = compact.match(/(?:^|\s)[(（][1-9１-９][)）]/g) ?? [];
  const features = {
    fraction: /\\(?:d)?frac\s*\{|[0-9０-９]+\s*\/\s*[0-9０-９]+/.test(problemSection),
    decimal: /[0-9０-９]+\.[0-9０-９]+/.test(problemSection),
    radical: /\\sqrt\s*\{|√/.test(problemSection),
    diagram: /【図】|\\begin\{tikzpicture\}/.test(problemSection),
    wordProblem:
      compact.length >= 95 &&
      /(円|人|個|冊|本|枚|速さ|道のり|時間|割合|濃度|代金|面積|体積|年齢|人数|距離|動く|購入|商品|水そう)/.test(
        compact,
      ),
    proofOrExplanation: /(証明しなさい|説明しなさい|理由を|成り立つことを示)/.test(compact),
    multipleConditions: /(ただし|かつ|それぞれ|少なくとも|以上|以下|未満)/.test(compact),
    simultaneousEquations: /連立|\\begin\{cases\}/.test(compact),
    guidedChoiceOrBlank: /(空欄|あてはまる|選びなさい|表を完成|次の中から)/.test(compact),
    shortDirectQuestion: compact.length < 80,
  };
  return {
    filenameLevel,
    features,
    problemLength: compact.length,
    subquestionCount: subquestionMatches.length,
  };
}

function estimateDifficulty(metadata, analysis, irtRows) {
  const reference = findReference(metadata, irtRows);
  const difficulties = reference.rows.map((row) => row.correctedDifficulty);
  const baseMedian = median(difficulties);
  const referenceSpread = standardDeviation(difficulties);
  const adjustments = [];
  let score = baseMedian + reference.offset;

  if (reference.offset !== 0) {
    adjustments.push({ label: "項目差", value: reference.offset });
  }

  const levelAdjustment = config.levelAdjustment[analysis.filenameLevel] ?? 0;
  score += levelAdjustment;
  adjustments.push({
    label: analysis.filenameLevel === "standard" ? "標準問題" : "基礎問題",
    value: levelAdjustment,
  });

  const multiplier = { exact: 0.4, alias: 0.6, unit: 1, grade: 1 }[reference.source];
  for (const [feature, present] of Object.entries(analysis.features)) {
    if (!present) continue;
    const rawAdjustment = config.featureAdjustment[feature] ?? 0;
    const value = round1(rawAdjustment * multiplier);
    if (value === 0) continue;
    score += value;
    adjustments.push({
      label: {
        fraction: "分数",
        decimal: "小数",
        radical: "根号",
        diagram: "図",
        wordProblem: "文章題",
        proofOrExplanation: "説明・証明",
        multipleConditions: "複数条件",
        simultaneousEquations: "連立式",
        guidedChoiceOrBlank: "選択・穴埋めの支援",
        shortDirectQuestion: "短い直接問題",
      }[feature],
      value,
    });
  }

  score = round1(clamp(score, config.scoreRange.min, config.scoreRange.max));
  const uncertainty = round1(
    config.sourceUncertainty[reference.source] + Math.min(10, referenceSpread * 0.12),
  );
  const references = [...new Set(reference.rows.map((row) => row.item))];
  const referenceSummary = `${gradeShort(metadata.grade)}／${reference.rows[0]?.unit ?? "-"}／${
    references.join("・") || "-"
  }`;
  const adjustmentText = adjustments
    .filter((adjustment) => adjustment.value !== 0)
    .map(
      (adjustment) =>
        `${adjustment.label}${adjustment.value > 0 ? "+" : ""}${adjustment.value}`,
    )
    .join("、");
  const reason =
    `IRT参照「${referenceSummary}」${reference.rows.length}項目の補正後困難度中央値` +
    `${round1(baseMedian)}を${sourceLabel(reference.source)}として使用。` +
    `${adjustmentText || "追加補正なし"}。推定幅の目安は±${uncertainty}。`;
  const reviewReasons = [];
  if (uncertainty >= config.reviewUncertaintyThreshold) {
    reviewReasons.push("参照範囲が広く推定幅が大きい");
  }
  if (reference.source === "grade") {
    reviewReasons.push("同単元のIRTアンカーがない");
  }
  if (analysis.subquestionCount > 1) {
    reviewReasons.push(`小問候補が${analysis.subquestionCount}個検出された`);
  }

  return {
    score,
    level: levelFor(score),
    reason,
    source: reference.source,
    referenceSummary,
    referenceCount: reference.rows.length,
    baseMedian: round1(baseMedian),
    uncertainty,
    adjustments,
    reviewReasons,
  };
}

function groupCounts(items, selector) {
  const counts = new Map();
  for (const item of items) {
    const key = selector(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]), "ja"));
}

function gradeStats(results) {
  const grades = [...new Set(results.map((result) => result.grade))];
  return grades.map((grade) => {
    const scores = results.filter((result) => result.grade === grade).map((result) => result.score);
    return [
      grade,
      scores.length,
      round1(Math.min(...scores)),
      round1(median(scores)),
      round1(Math.max(...scores)),
    ];
  });
}

function markdownTable(headers, rows) {
  const safe = (value) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
  return [
    `| ${headers.map(safe).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(safe).join(" | ")} |`),
  ].join("\n");
}

const metadataWorkbook = await SpreadsheetFile.importXlsx(await FileBlob.load(TARGET_WORKBOOK));
const metadataSheet = metadataWorkbook.worksheets.getItem("生成問題一覧");
const metadataValues = metadataSheet.getRange("A1:E485").values;
const metadataRows = metadataValues.slice(1).map((row) => ({
  filename: row[0],
  grade: row[1],
  domain: row[2],
  unit: row[3],
  item: row[4],
}));

const irtWorkbook = await SpreadsheetFile.importXlsx(await FileBlob.load(IRT_WORKBOOK));
const irtValues = irtWorkbook.worksheets.getItem("Sheet1").getRange("A1:S173").values;
const irtRows = irtValues
  .slice(1)
  .map((row) => ({
    round: row[0],
    major: row[2],
    minor: row[3],
    branch: row[4],
    discrimination: Number(row[5]),
    difficultyTheta: Number(row[6]),
    correctedDifficulty: Number(row[12]),
    correctedDiscrimination: Number(row[13]),
    lowDiscriminationFlag: row[14],
    grade: row[15],
    domain: row[16],
    unit: row[17],
    item: row[18],
  }))
  .filter((row) => row.domain === "数と式" && Number.isFinite(row.correctedDifficulty));

const results = [];
for (const metadata of metadataRows) {
  const questionPath = path.join(TARGET_DIR, metadata.filename);
  let text = "";
  let fileMissing = false;
  try {
    text = await fs.readFile(questionPath, "utf8");
  } catch {
    fileMissing = true;
  }
  const analysis = analyzeQuestion(text, metadata.filename);
  const estimate = estimateDifficulty(metadata, analysis, irtRows);
  if (fileMissing) estimate.reviewReasons.push("問題ファイルが見つからない");
  results.push({ ...metadata, ...analysis, ...estimate });
}

if (results.length !== metadataRows.length) {
  throw new Error(`件数不一致: metadata=${metadataRows.length}, results=${results.length}`);
}

metadataSheet.getRange("F1:H1").values = [[
  "推定困難度スコア",
  "難易度レベル",
  "推定根拠",
]];
metadataSheet.getRange(`F2:H${results.length + 1}`).values = results.map((result) => [
  result.score,
  result.level,
  result.reason,
]);
metadataSheet.freezePanes.freezeRows(1);
metadataSheet.getRange("A1:H1").format = {
  fill: "#1F4E78",
  font: { bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#D9E2F3" },
};
metadataSheet.getRange(`A2:H${results.length + 1}`).format = {
  verticalAlignment: "top",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#D9E2F3" },
};
metadataSheet.getRange(`F2:F${results.length + 1}`).format.numberFormat = "0.0";
metadataSheet.getRange("A:A").format.columnWidth = 32;
metadataSheet.getRange("B:B").format.columnWidth = 12;
metadataSheet.getRange("C:C").format.columnWidth = 10;
metadataSheet.getRange("D:D").format.columnWidth = 20;
metadataSheet.getRange("E:E").format.columnWidth = 48;
metadataSheet.getRange("F:F").format.columnWidth = 14;
metadataSheet.getRange("G:G").format.columnWidth = 14;
metadataSheet.getRange("H:H").format.columnWidth = 70;

const summarySheet = metadataWorkbook.worksheets.add("難易度集計");
summarySheet.showGridLines = false;
summarySheet.getRange("A1:F1").merge();
summarySheet.getRange("A1").values = [["復習問題 推定困難度 dry-run 集計"]];
summarySheet.getRange("A1:F1").format = {
  fill: "#1F4E78",
  font: { bold: true, color: "#FFFFFF", size: 16 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
summarySheet.getRange("A3:B8").values = [
  ["対象問題数", results.length],
  ["IRT参照項目数（数と式）", irtRows.length],
  ["推定困難度 最小", Math.min(...results.map((result) => result.score))],
  ["推定困難度 中央値", round1(median(results.map((result) => result.score)))],
  ["推定困難度 最大", Math.max(...results.map((result) => result.score))],
  ["要確認", results.filter((result) => result.reviewReasons.length > 0).length],
];
summarySheet.getRange("D3:E3").values = [["難易度レベル", "件数"]];
const levelCounts = groupCounts(results, (result) => result.level);
summarySheet.getRange(`D4:E${levelCounts.length + 3}`).values = levelCounts;
summarySheet.getRange("A10:E10").values = [["学年", "件数", "最小", "中央値", "最大"]];
const stats = gradeStats(results);
summarySheet.getRange(`A11:E${stats.length + 10}`).values = stats;
summarySheet.getRange("A16:B16").values = [["推定方法", "件数"]];
const sourceCounts = groupCounts(results, (result) => sourceLabel(result.source));
summarySheet.getRange(`A17:B${sourceCounts.length + 16}`).values = sourceCounts;
for (const header of ["A3:B3", "D3:E3", "A10:E10", "A16:B16"]) {
  summarySheet.getRange(header).format = {
    fill: "#D9EAF7",
    font: { bold: true, color: "#17365D" },
    borders: { preset: "all", style: "thin", color: "#9EADBA" },
  };
}
summarySheet.getRange("A3:E24").format.wrapText = true;
summarySheet.getRange("A3:E24").format.borders = {
  preset: "all",
  style: "thin",
  color: "#D9E2F3",
};
summarySheet.getRange("A:A").format.columnWidth = 28;
summarySheet.getRange("B:B").format.columnWidth = 14;
summarySheet.getRange("C:C").format.columnWidth = 14;
summarySheet.getRange("D:D").format.columnWidth = 22;
summarySheet.getRange("E:E").format.columnWidth = 14;

const reviewResults = results.filter((result) => result.reviewReasons.length > 0);
const reviewSheet = metadataWorkbook.worksheets.add("要確認");
reviewSheet.getRange("A1:H1").values = [[
  "問題ファイル名",
  "学年",
  "単元",
  "項目",
  "推定困難度",
  "推定方法",
  "推定幅",
  "確認理由",
]];
if (reviewResults.length > 0) {
  reviewSheet.getRange(`A2:H${reviewResults.length + 1}`).values = reviewResults.map((result) => [
    result.filename,
    result.grade,
    result.unit,
    result.item,
    result.score,
    sourceLabel(result.source),
    `±${result.uncertainty}`,
    result.reviewReasons.join("／"),
  ]);
}
reviewSheet.freezePanes.freezeRows(1);
reviewSheet.getRange("A1:H1").format = {
  fill: "#9C6500",
  font: { bold: true, color: "#FFFFFF" },
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#F4B183" },
};
reviewSheet.getRange(`A2:H${Math.max(2, reviewResults.length + 1)}`).format = {
  wrapText: true,
  verticalAlignment: "top",
  borders: { preset: "all", style: "thin", color: "#FCE4D6" },
};
reviewSheet.getRange("A:A").format.columnWidth = 32;
reviewSheet.getRange("B:B").format.columnWidth = 12;
reviewSheet.getRange("C:C").format.columnWidth = 20;
reviewSheet.getRange("D:D").format.columnWidth = 45;
reviewSheet.getRange("E:G").format.columnWidth = 14;
reviewSheet.getRange("H:H").format.columnWidth = 35;

const referenceSheet = metadataWorkbook.worksheets.add("参照IRT");
referenceSheet.getRange("A1:J1").values = [[
  "回",
  "大問",
  "小問",
  "枝問",
  "学年",
  "単元",
  "項目",
  "補正後困難度",
  "補正後識別力",
  "困難度θ",
]];
referenceSheet.getRange(`A2:J${irtRows.length + 1}`).values = irtRows.map((row) => [
  row.round,
  row.major,
  row.minor,
  row.branch,
  row.grade,
  row.unit,
  row.item,
  round1(row.correctedDifficulty),
  row.correctedDiscrimination,
  row.difficultyTheta,
]);
referenceSheet.freezePanes.freezeRows(1);
referenceSheet.getRange("A1:J1").format = {
  fill: "#548235",
  font: { bold: true, color: "#FFFFFF" },
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#C6E0B4" },
};
referenceSheet.getRange(`A2:J${irtRows.length + 1}`).format = {
  wrapText: true,
  verticalAlignment: "top",
  borders: { preset: "all", style: "thin", color: "#E2F0D9" },
};
referenceSheet.getRange("A:F").format.columnWidth = 12;
referenceSheet.getRange("G:G").format.columnWidth = 58;
referenceSheet.getRange("H:J").format.columnWidth = 16;

const resultPayload = {
  generatedAt: new Date().toISOString(),
  mode: applyMode ? "apply" : "dry-run",
  configVersion: config.version,
  targetWorkbook: TARGET_WORKBOOK,
  irtWorkbook: IRT_WORKBOOK,
  count: results.length,
  results,
};
await fs.writeFile(RESULT_JSON, `${JSON.stringify(resultPayload, null, 2)}\n`, "utf8");

const outputPath = applyMode ? TARGET_WORKBOOK : PREVIEW_WORKBOOK;
if (applyMode) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${TARGET_WORKBOOK}.${timestamp}.bak.xlsx`;
  await fs.copyFile(TARGET_WORKBOOK, backupPath);
  console.log(`backup: ${backupPath}`);
}
const outputBlob = await SpreadsheetFile.exportXlsx(metadataWorkbook);
await outputBlob.save(outputPath);

await fs.mkdir(PREVIEW_DIR, { recursive: true });
const listPreview = await metadataWorkbook.render({
  sheetName: "生成問題一覧",
  range: "A1:H24",
  scale: 1,
  format: "png",
});
await fs.writeFile(
  path.join(PREVIEW_DIR, "difficulty_list_preview.png"),
  new Uint8Array(await listPreview.arrayBuffer()),
);
const summaryPreview = await metadataWorkbook.render({
  sheetName: "難易度集計",
  range: "A1:F24",
  scale: 1,
  format: "png",
});
await fs.writeFile(
  path.join(PREVIEW_DIR, "difficulty_summary_preview.png"),
  new Uint8Array(await summaryPreview.arrayBuffer()),
);

const levelTable = markdownTable(
  ["難易度レベル", "件数"],
  levelCounts.map(([label, count]) => [label, count]),
);
const gradeTable = markdownTable(["学年", "件数", "最小", "中央値", "最大"], stats);
const sourceTable = markdownTable(
  ["推定方法", "件数"],
  sourceCounts.map(([label, count]) => [label, count]),
);
const reviewTable = markdownTable(
  ["ファイル名", "学年", "単元", "項目", "推定困難度", "推定幅", "確認理由"],
  reviewResults.slice(0, 50).map((result) => [
    result.filename,
    result.grade,
    result.unit,
    result.item,
    result.score,
    `±${result.uncertainty}`,
    result.reviewReasons.join("／"),
  ]),
);
const report = `# 復習問題 推定困難度 dry-run レポート

作成日時: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}

## 結果概要

- 対象: Math_Question 内の一覧表に記載された ${results.length} 問
- 参照IRT項目: 数と式 ${irtRows.length} 項目（第1〜8回）
- 元の \`generated_question_metadata_table.xlsx\` は変更していません。
- 追加予定列: \`推定困難度スコア\`、\`難易度レベル\`、\`推定根拠\`
- 推定値は実受検データによる直接推定ではなく、IRT項目をアンカーにした**推定困難度**です。

## 推定方法

1. 学年・領域・単元・項目が一致するIRT項目の補正後困難度中央値を優先しました。
2. 一致項目がない場合は、高類似項目、同単元、同学年の順にアンカーを下げました。
3. 基礎・標準、分数・小数・根号、文章題、図、複数条件、説明・証明などを設定ファイルに従って補正しました。
4. AIの内容判定だけで値を決めず、必ずIRTアンカーを起点にしています。

## 難易度レベル

- L1 易: 140未満
- L2 やや易: 140以上180未満
- L3 標準: 180以上220未満
- L4 やや難: 220以上260未満
- L5 難: 260以上

${levelTable}

## 学年別分布

${gradeTable}

## 推定方法別件数

${sourceTable}

## 検証

- 件数照合: ${metadataRows.length === results.length ? "一致" : "不一致"}（元表 ${metadataRows.length} / 推定 ${results.length}）
- 推定困難度の範囲: ${Math.min(...results.map((result) => result.score))}〜${Math.max(...results.map((result) => result.score))}
- 推定困難度の中央値: ${round1(median(results.map((result) => result.score)))}
- 新規付与予定: ${results.length}件。元表には難易度列がないため、既存値の上書き変更はありません。
- 要確認: ${reviewResults.length}件

## 要確認一覧（先頭50件）

${reviewTable}

## 承認後の適用

dry-run結果を確認後、承認を得てから \`--apply --approved\` を実行します。適用時は元Excelのバックアップを自動作成します。

## 50問試行後の再確認

実運用後は、少なくとも50問について正誤・解答時間・ヒント利用を収集し、項目別正答率と推定困難度の順位相関を確認してください。乖離が大きい項目はアンカーまたは補正値を見直します。
`;
await fs.writeFile(SUMMARY_REPORT, report, "utf8");

const inspection = await metadataWorkbook.inspect({
  kind: "workbook,sheet,region",
  sheetId: "生成問題一覧",
  range: "A1:H8",
  maxChars: 5000,
  tableMaxRows: 8,
  tableMaxCols: 8,
});
console.log(inspection.ndjson);
console.log(`mode: ${applyMode ? "apply" : "dry-run"}`);
console.log(`questions: ${results.length}`);
console.log(`review: ${reviewResults.length}`);
console.log(`workbook: ${outputPath}`);
console.log(`report: ${SUMMARY_REPORT}`);
