const express = require('express');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
// node-tikzjax uses a default export for the tex2svg function when imported
// via CommonJS.  Destructuring `{ tex2svg }` returns undefined, so instead
// access the default export explicitly.
const tex2svg = require('node-tikzjax').default;

// Create an Express application
const app = express();
const mathPromptDir = process.env.MATH_PROMPT_DIR
  ? path.resolve(process.env.MATH_PROMPT_DIR)
  : path.resolve(__dirname, '..');
const mathQuestionDir = path.join(mathPromptDir, 'Math_Question');
const appAddedGenerationPromptPath = path.join(mathPromptDir, 'app_added_generation_prompt_instructions.txt');
const questionFileSeparator = '-';
const defaultOpenAIModel = 'gpt-5.6';
const generationJobs = new Map();

function buildPromptFileLabel(fileName, content) {
  const lines = content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const code = lines[0] || '';
  const title = lines[1] || '';
  const level = (lines[2] || '').replace(/^□/, '');
  const labelParts = [code, title, level].filter(Boolean);

  return {
    name: fileName,
    code,
    title,
    level,
    label: labelParts.length ? labelParts.join('｜') : fileName
  };
}

function splitPromptTitle(title) {
  const parts = title.split(/\s*[―-]\s*/);
  return {
    unit: (parts[0] || title || '').trim(),
    item: (parts.slice(1).join(' ― ') || parts[0] || title || '').trim()
  };
}

function isPromptCatalogItem(item) {
  return item.name && item.code && item.title && item.level;
}

function promptGrade(item) {
  const codeGrade = String(item.code || '').match(/^([123])-/)?.[1];
  const fileGrade = String(item.name || '').match(/m-jh([123])-/)?.[1];
  const grade = codeGrade || fileGrade || '';
  return grade ? { value: grade, label: `中学${grade}年` } : { value: '', label: '学年未設定' };
}

function comparePromptCode(a, b) {
  return String(a || '').localeCompare(String(b || ''), 'ja', { numeric: true });
}

function minPromptCode(current, next) {
  if (!current) return next || '';
  if (!next) return current;
  return comparePromptCode(current, next) <= 0 ? current : next;
}

function buildPromptCatalog(files) {
  const grades = new Map();

  for (const item of files.filter(isPromptCatalogItem)) {
    const grade = promptGrade(item);
    const { unit, item: itemName } = splitPromptTitle(item.title);
    if (!unit || !itemName) continue;

    if (!grades.has(grade.value)) {
      grades.set(grade.value, { grade: grade.value, label: grade.label, units: new Map() });
    }

    const gradeEntry = grades.get(grade.value);
    if (!gradeEntry.units.has(unit)) {
      gradeEntry.units.set(unit, { unit, code: item.code, items: new Map() });
    }

    const unitEntry = gradeEntry.units.get(unit);
    unitEntry.code = minPromptCode(unitEntry.code, item.code);
    if (!unitEntry.items.has(itemName)) {
      unitEntry.items.set(itemName, { item: itemName, code: item.code, levels: [] });
    }

    const itemEntry = unitEntry.items.get(itemName);
    itemEntry.code = minPromptCode(itemEntry.code, item.code);
    itemEntry.levels.push({
      level: item.level,
      fileName: item.name,
      code: item.code,
      title: item.title,
      label: item.label
    });
  }

  return Array.from(grades.values())
    .map(gradeEntry => ({
      grade: gradeEntry.grade,
      label: gradeEntry.label,
      units: Array.from(gradeEntry.units.values())
        .map(unitEntry => ({
          unit: unitEntry.unit,
          code: unitEntry.code,
          items: Array.from(unitEntry.items.values())
            .map(itemEntry => ({
              item: itemEntry.item,
              code: itemEntry.code,
              levels: itemEntry.levels.sort((a, b) => {
                const levelOrder = ['基本問題', '標準問題', '応用問題', '発展問題'];
                const levelDiff = levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
                if (levelDiff !== 0) return levelDiff;
                return a.label.localeCompare(b.label, 'ja', { numeric: true });
              })
            }))
            .sort((a, b) => comparePromptCode(a.code, b.code) || a.item.localeCompare(b.item, 'ja', { numeric: true }))
        }))
        .sort((a, b) => comparePromptCode(a.code, b.code) || a.unit.localeCompare(b.unit, 'ja', { numeric: true }))
    }))
    .sort((a, b) => {
      const gradeDiff = Number(a.grade || 99) - Number(b.grade || 99);
      if (gradeDiff !== 0) return gradeDiff;
      return a.label.localeCompare(b.label, 'ja', { numeric: true });
    });
}

function validatePromptFileName(fileName) {
  const safeName = path.basename(fileName || '');
  return safeName === fileName && safeName.toLowerCase().endsWith('.txt') ? safeName : '';
}

function questionFileBase(promptFileName) {
  return promptFileName.replace(/\.txt$/i, '');
}

function questionSourceStem(fileName) {
  const stem = questionFileBase(path.basename(fileName || ''));
  const match = stem.match(/^(m-jh[123]-[A-Z]-\d{2}-\d{2}[A-Za-z]*)(?:ｰ|-)(\d+)$/);
  return match ? match[1] : stem;
}

function learningItemKey(fileName) {
  const stem = questionSourceStem(fileName);
  const match = stem.match(/^(m-jh[123]-[A-Z]-\d{2}-\d{2})[A-Za-z]*$/);
  return match ? match[1] : stem;
}

async function nextQuestionIndex(promptFileName) {
  await fs.mkdir(mathQuestionDir, { recursive: true });

  const base = questionFileBase(promptFileName);
  const escapedBase = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^${escapedBase}(?:${questionFileSeparator}|-)(\\d+)\\.txt$`);
  const entries = await fs.readdir(mathQuestionDir, { withFileTypes: true });
  const max = entries.reduce((currentMax, entry) => {
    if (!entry.isFile()) return currentMax;
    const match = entry.name.match(re);
    return match ? Math.max(currentMax, Number(match[1])) : currentMax;
  }, 0);

  return max + 1;
}

async function writeUniqueQuestionFile(promptFileName, content) {
  let index = await nextQuestionIndex(promptFileName);

  while (true) {
    const outputName = `${questionFileBase(promptFileName)}${questionFileSeparator}${String(index).padStart(2, '0')}.txt`;
    const outputPath = path.join(mathQuestionDir, outputName);

    try {
      await fs.writeFile(outputPath, content, { encoding: 'utf8', flag: 'wx' });
      return outputName;
    } catch (err) {
      if (err && err.code === 'EEXIST') {
        index += 1;
        continue;
      }
      throw err;
    }
  }
}

function extractResponseText(responseData) {
  if (typeof responseData.output_text === 'string') return responseData.output_text;

  const chunks = [];
  for (const item of responseData.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n').trim();
}

async function readAppAddedGenerationInstructions() {
  const instructions = (await fs.readFile(appAddedGenerationPromptPath, 'utf8')).trim();
  if (!instructions) {
    throw new Error(`${appAddedGenerationPromptPath} is empty.`);
  }
  return instructions;
}

function extractGeneratedQuestion(content) {
  const questionStart = content.indexOf('■問題');
  const contentStart = questionStart >= 0 ? questionStart : 0;
  const answerStart = content.indexOf('【解答】', contentStart);
  const contentEnd = answerStart >= 0 ? answerStart : content.length;
  return content.slice(contentStart, contentEnd).trim();
}

function normalizeGeneratedQuestion(content) {
  return extractGeneratedQuestion(content).normalize('NFKC').replace(/\s+/g, '');
}

async function createQuestionWithOpenAI({
  apiKey,
  prompt,
  questionNumber,
  totalCount,
  previousQuestions = [],
  retryingDuplicate = false
}) {
  const appInstructions = await readAppAddedGenerationInstructions();
  const batchInstructions = [
    `これは同じ作問ジョブで生成する全${totalCount}問中の第${questionNumber}問です。`,
    '問題形式・難易度・解説構成は作問用プロンプトに従いながら、数値、符号、条件の組み合わせを変えてください。',
    '同じ作問ジョブですでに生成した問題と、問題文や問題式を重複させないでください。'
  ];

  if (previousQuestions.length > 0) {
    batchInstructions.push(
      '次の問題はすでに生成済みです。これらとは異なる問題を作成してください。',
      previousQuestions.map((question, index) => `既出${index + 1}:\n${question}`).join('\n\n')
    );
  }

  if (retryingDuplicate) {
    batchInstructions.push('直前の応答が既出問題と重複したため、数値や符号を必ず変更して再生成してください。');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: defaultOpenAIModel,
      instructions: appInstructions,
      input: [
        prompt,
        batchInstructions.join('\n')
      ].join('\n\n')
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error?.message || `OpenAI API error (${response.status})`;
    throw new Error(message);
  }

  const text = extractResponseText(data);
  if (!text) throw new Error('OpenAI API response did not include text.');
  return text;
}

function publicGenerationJob(job) {
  return {
    id: job.id,
    status: job.status,
    total: job.total,
    completed: job.completed,
    current: job.current,
    message: job.message,
    error: job.error,
    directory: job.directory,
    model: job.model,
    files: job.files,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt
  };
}

function touchGenerationJob(job, patch) {
  Object.assign(job, patch, { updatedAt: new Date().toISOString() });
}

async function runGenerationJob(job) {
  try {
    touchGenerationJob(job, {
      status: 'running',
      message: '保存先を確認しています'
    });

    for (let i = 0; i < job.total; i++) {
      touchGenerationJob(job, {
        current: i + 1,
        message: `第${i + 1}問を生成中です`
      });

      const previousQuestions = job.files.map((file) => extractGeneratedQuestion(file.content));
      const previousQuestionKeys = new Set(
        job.files.map((file) => normalizeGeneratedQuestion(file.content))
      );
      let content = '';

      for (let attempt = 0; attempt < 3; attempt++) {
        content = await createQuestionWithOpenAI({
          apiKey: job.apiKey,
          prompt: job.prompt,
          questionNumber: i + 1,
          totalCount: job.total,
          previousQuestions,
          retryingDuplicate: attempt > 0
        });

        if (!previousQuestionKeys.has(normalizeGeneratedQuestion(content))) break;
        content = '';
      }

      if (!content) {
        throw new Error('同じ問題が繰り返し生成されたため、作問を中止しました。');
      }
      const outputName = await writeUniqueQuestionFile(job.sourceFile, content);
      job.files.push({ name: outputName, content });

      touchGenerationJob(job, {
        completed: i + 1,
        message: `第${i + 1}問を保存しました`
      });
    }

    touchGenerationJob(job, {
      status: 'completed',
      message: `${job.files.length}問を作成して保存しました`
    });
  } catch (err) {
    console.error('Failed to generate questions:', err);
    touchGenerationJob(job, {
      status: 'failed',
      error: err.message || '作問に失敗しました。',
      message: '作問に失敗しました'
    });
  } finally {
    job.apiKey = '';
    setTimeout(() => generationJobs.delete(job.id), 1000 * 60 * 60);
  }
}

// Increase the JSON body size limit to allow reasonably complex diagrams
app.use(express.json({ limit: '5mb' }));

// Serve static assets from the "public" directory
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

app.get('/questions', (req, res) => {
  res.sendFile(path.join(publicDir, 'questions.html'));
});

app.get('/question-browser', (req, res) => {
  res.sendFile(path.join(publicDir, 'question-browser.html'));
});

// Expose the fonts.css file and associated fonts from node-tikzjax so that
// generated SVGs can refer to them.  The embedFontCss option will add a
// <style> tag importing this stylesheet.
const fontsCssPath = path.join(__dirname, 'node_modules', 'node-tikzjax', 'css', 'fonts.css');
const bakomaDir = path.join(__dirname, 'node_modules', 'node-tikzjax', 'css', 'bakoma');

// Route for the fonts.css file
app.get('/fonts.css', (req, res) => {
  res.sendFile(fontsCssPath);
});

// Serve the Bakoma font files under /bakoma.  These contain the TeX fonts used
// by node‑tikzjax.  Without these, text in diagrams may not render correctly.
app.use('/bakoma', express.static(bakomaDir));

app.get('/prompt-files', async (req, res) => {
  try {
    const entries = await fs.readdir(mathPromptDir, { withFileTypes: true });
    const fileNames = entries
      .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.txt'))
      .map(entry => entry.name)
      .sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }));

    const files = await Promise.all(fileNames.map(async fileName => {
      try {
        const content = await fs.readFile(path.join(mathPromptDir, fileName), 'utf8');
        return buildPromptFileLabel(fileName, content);
      } catch {
        return { name: fileName, code: '', title: '', level: '', label: fileName };
      }
    }));

    files.sort((a, b) => a.label.localeCompare(b.label, 'ja', { numeric: true }));

    res.json({ files });
  } catch (err) {
    console.error('Failed to list Math_Prompt files:', err);
    res.status(500).json({ error: 'Failed to list prompt files.' });
  }
});

app.get('/prompt-catalog', async (req, res) => {
  try {
    const entries = await fs.readdir(mathPromptDir, { withFileTypes: true });
    const fileNames = entries
      .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.txt'))
      .map(entry => entry.name)
      .sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }));

    const files = await Promise.all(fileNames.map(async fileName => {
      try {
        const content = await fs.readFile(path.join(mathPromptDir, fileName), 'utf8');
        return buildPromptFileLabel(fileName, content);
      } catch {
        return { name: fileName, code: '', title: '', level: '', label: fileName };
      }
    }));

    res.json({ grades: buildPromptCatalog(files) });
  } catch (err) {
    console.error('Failed to build Math_Prompt catalog:', err);
    res.status(500).json({ error: 'Failed to build prompt catalog.' });
  }
});

app.get('/prompt-files/:name', async (req, res) => {
  const fileName = path.basename(req.params.name);

  if (fileName !== req.params.name || !fileName.toLowerCase().endsWith('.txt')) {
    return res.status(400).json({ error: 'Invalid file name.' });
  }

  const filePath = path.join(mathPromptDir, fileName);

  try {
    const content = await fs.readFile(filePath, 'utf8');
    res.json({ name: fileName, content });
  } catch (err) {
    console.error('Failed to read Math_Prompt file:', err);
    res.status(404).json({ error: 'Prompt file not found.' });
  }
});

app.put('/prompt-files/:name', async (req, res) => {
  const fileName = validatePromptFileName(req.params.name);
  const { content } = req.body;

  if (!fileName) {
    return res.status(400).json({ error: 'Invalid file name.' });
  }

  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid `content` field.' });
  }

  const filePath = path.join(mathPromptDir, fileName);

  try {
    await fs.writeFile(filePath, content, 'utf8');
    res.json(buildPromptFileLabel(fileName, content));
  } catch (err) {
    console.error('Failed to save Math_Prompt file:', err);
    res.status(500).json({ error: 'Failed to save prompt file.' });
  }
});

app.post('/generate-questions', async (req, res) => {
  const { apiKey, prompt, sourceFile, count } = req.body;
  const fileName = validatePromptFileName(sourceFile);
  const questionCount = Number(count);

  if (!fileName) {
    return res.status(400).json({ error: '先に Math_Prompt のファイルを読み込んでください。' });
  }

  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    return res.status(400).json({ error: 'APIキーを設定してください。' });
  }

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'プロンプトが空です。' });
  }

  if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > 20) {
    return res.status(400).json({ error: '作問数は1〜20で指定してください。' });
  }

  const job = {
    id: crypto.randomUUID(),
    status: 'queued',
    total: questionCount,
    completed: 0,
    current: 0,
    message: '作問ジョブを開始しました',
    error: '',
    directory: mathQuestionDir,
    model: defaultOpenAIModel,
    sourceFile: fileName,
    prompt,
    apiKey: apiKey.trim(),
    files: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  generationJobs.set(job.id, job);
  setImmediate(() => runGenerationJob(job));
  res.status(202).json(publicGenerationJob(job));
});

app.get('/generate-jobs/:id', (req, res) => {
  const job = generationJobs.get(req.params.id);

  if (!job) {
    return res.status(404).json({ error: '作問ジョブが見つかりません。' });
  }

  res.json(publicGenerationJob(job));
});

app.get('/question-files', async (req, res) => {
  try {
    const sourceFile = validatePromptFileName(req.query.sourceFile);
    const showAll = req.query.all === '1' || req.query.all === 'true';
    const sourceStem = sourceFile ? questionFileBase(sourceFile) : '';
    await fs.mkdir(mathQuestionDir, { recursive: true });
    const entries = await fs.readdir(mathQuestionDir, { withFileTypes: true });
    const matchingEntries = entries
      .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.txt'))
      .filter(entry => {
        if (showAll) return true;
        if (!sourceStem) return false;
        return questionSourceStem(entry.name) === sourceStem;
      });

    const files = await Promise.all(matchingEntries.map(async entry => {
      const filePath = path.join(mathQuestionDir, entry.name);
      const stat = await fs.stat(filePath);
      return {
        name: entry.name,
        label: entry.name.replace(/\.txt$/i, ''),
        sourceStem: questionSourceStem(entry.name),
        learningItemKey: learningItemKey(entry.name),
        updatedAt: stat.mtime.toISOString(),
        size: stat.size
      };
    }));

    files.sort((a, b) => a.name.localeCompare(b.name, 'ja', { numeric: true }));

    res.json({ directory: mathQuestionDir, sourceFile, sourceStem, files });
  } catch (err) {
    console.error('Failed to list Math_Question files:', err);
    res.status(500).json({ error: 'Failed to list question files.' });
  }
});

app.get('/question-files/:name', async (req, res) => {
  const fileName = validatePromptFileName(req.params.name);

  if (!fileName) {
    return res.status(400).json({ error: 'Invalid file name.' });
  }

  try {
    const content = await fs.readFile(path.join(mathQuestionDir, fileName), 'utf8');
    res.json({ name: fileName, content });
  } catch (err) {
    console.error('Failed to read Math_Question file:', err);
    res.status(404).json({ error: 'Question file not found.' });
  }
});

app.put('/question-files/:name', async (req, res) => {
  const fileName = validatePromptFileName(req.params.name);
  const content = req.body?.content;

  if (!fileName) {
    return res.status(400).json({ error: 'Invalid file name.' });
  }

  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Invalid content.' });
  }

  try {
    await fs.writeFile(path.join(mathQuestionDir, fileName), content, 'utf8');
    const stat = await fs.stat(path.join(mathQuestionDir, fileName));
    res.json({
      saved: true,
      name: fileName,
      updatedAt: stat.mtime.toISOString(),
      size: stat.size
    });
  } catch (err) {
    console.error('Failed to save Math_Question file:', err);
    res.status(500).json({ error: 'Failed to save question file.' });
  }
});

app.patch('/question-files/:name', async (req, res) => {
  const fileName = validatePromptFileName(req.params.name);
  const newFileName = validatePromptFileName(req.body?.newName);

  if (!fileName || !newFileName) {
    return res.status(400).json({ error: 'Invalid file name.' });
  }

  if (fileName === newFileName) {
    return res.json({ renamed: false, name: fileName, newName: newFileName });
  }

  const oldPath = path.join(mathQuestionDir, fileName);
  const newPath = path.join(mathQuestionDir, newFileName);

  try {
    await fs.access(oldPath);
  } catch {
    return res.status(404).json({ error: 'Question file not found.' });
  }

  try {
    await fs.access(newPath);
    return res.status(409).json({ error: '同じ名前の作問結果がすでにあります。' });
  } catch {
    // Destination does not exist, so it is safe to rename.
  }

  try {
    await fs.rename(oldPath, newPath);
    res.json({ renamed: true, name: fileName, newName: newFileName });
  } catch (err) {
    console.error('Failed to rename Math_Question file:', err);
    res.status(500).json({ error: 'Failed to rename question file.' });
  }
});

app.delete('/question-files/:name', async (req, res) => {
  const fileName = validatePromptFileName(req.params.name);

  if (!fileName) {
    return res.status(400).json({ error: 'Invalid file name.' });
  }

  try {
    await fs.unlink(path.join(mathQuestionDir, fileName));
    res.json({ deleted: true, name: fileName });
  } catch (err) {
    console.error('Failed to delete Math_Question file:', err);
    res.status(404).json({ error: 'Question file not found.' });
  }
});

/**
 * POST /render
 *
 * Expects a JSON payload with a single key `tikz` containing a TikZ
 * environment (for example, "\\begin{tikzpicture} ... \\end{tikzpicture}").
 * Returns a JSON object with an `svg` property containing the rendered
 * diagram.  If rendering fails, responds with a 500 status and an error
 * message.
 */
app.post('/render', async (req, res) => {
  const { tikz } = req.body;
  if (typeof tikz !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid `tikz` field.' });
  }
  // Wrap the input in a minimal LaTeX document.  node‑tikzjax uses the
  // standalone document class by default, so there is no need to specify
  // \documentclass.  The packages necessary for TikZ are loaded
  // automatically.
  const source = `\\begin{document}\n${tikz}\n\\end{document}`;
  try {
    // Pass additional options to tex2svg.  The `calc` TikZ library
    // is loaded by default so that users can leverage coordinate
    // calculations (for example `$ (O)!2cm!30:(A) $`) and the
    // `rotate around` transformation without needing to specify
    // `\usetikzlibrary{calc}` in their input.  You can add
    // multiple libraries separated by commas.
    const svg = await tex2svg(source, {
      // Load the TikZ calc library.  See
      // https://www.npmjs.com/package/node-tikzjax#advanced-usage
      // for details.
      tikzLibraries: 'calc',
      // Embed the font import inside the generated SVG.  The URL points
      // to the /fonts.css endpoint defined above, ensuring the fonts are
      // resolved relative to this server.  This is necessary for
      // special characters to render correctly.
      embedFontCss: true,
      fontCssUrl: '/fonts.css'
    });
    res.json({ svg });
  } catch (err) {
    console.error('TikZ conversion failed:', err);
    res.status(500).json({ error: 'Failed to convert TikZ code.' });
  }
});

// Start the server.  Use the PORT environment variable if supplied; otherwise
// default to 3000.  When the server starts, log the URL to the console.
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`TikZ app listening at http://localhost:${port}`);
});

process.on('unhandledRejection', err => {
  console.error('Unhandled promise rejection:', err);
});

process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
