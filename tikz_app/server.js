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
const questionFileSeparator = 'ｰ';
const defaultOpenAIModel = 'gpt-5.5';
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
      gradeEntry.units.set(unit, { unit, items: new Map() });
    }

    const unitEntry = gradeEntry.units.get(unit);
    if (!unitEntry.items.has(itemName)) {
      unitEntry.items.set(itemName, { item: itemName, levels: [] });
    }

    unitEntry.items.get(itemName).levels.push({
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
          items: Array.from(unitEntry.items.values())
            .map(itemEntry => ({
              item: itemEntry.item,
              levels: itemEntry.levels.sort((a, b) => {
                const levelOrder = ['基本問題', '標準問題', '応用問題', '発展問題'];
                const levelDiff = levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
                if (levelDiff !== 0) return levelDiff;
                return a.label.localeCompare(b.label, 'ja', { numeric: true });
              })
            }))
            .sort((a, b) => a.item.localeCompare(b.item, 'ja', { numeric: true }))
        }))
        .sort((a, b) => a.unit.localeCompare(b.unit, 'ja', { numeric: true }))
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

async function createQuestionWithOpenAI({ apiKey, prompt, questionNumber, totalCount }) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: defaultOpenAIModel,
      instructions: [
        'あなたは日本の中学校数学教材を作る編集者です。',
        '入力された作問用プロンプトに厳密に従って、問題、解答、解説を1問分だけ作成してください。',
        '出力には作問用プロンプトの本文やメタ説明を繰り返さず、教材として保存できる完成稿だけを書いてください。',
        '解説の文体は常体に統一してください。',
        '文末は「〜する」「〜である」「〜となる」「〜できる」「〜を求める」のように書き、「〜します」「〜です」「〜になります」などの敬体は使わないでください。',
        '同じ解説内で常体と敬体を混在させないでください。'
      ].join('\n'),
      input: [
        `全${totalCount}問のうち第${questionNumber}問として、重複しにくい問題を1問だけ作成してください。`,
        '',
        prompt
      ].join('\n')
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

    let index = await nextQuestionIndex(job.sourceFile);

    for (let i = 0; i < job.total; i++) {
      touchGenerationJob(job, {
        current: i + 1,
        message: `第${i + 1}問を生成中です`
      });

      const content = await createQuestionWithOpenAI({
        apiKey: job.apiKey,
        prompt: job.prompt,
        questionNumber: i + 1,
        totalCount: job.total
      });
      const outputName = `${questionFileBase(job.sourceFile)}${questionFileSeparator}${String(index).padStart(2, '0')}.txt`;
      const outputPath = path.join(mathQuestionDir, outputName);

      await fs.writeFile(outputPath, content, 'utf8');
      job.files.push({ name: outputName, content });
      index += 1;

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
    const sourceBase = sourceFile ? questionFileBase(sourceFile) : '';
    await fs.mkdir(mathQuestionDir, { recursive: true });
    const entries = await fs.readdir(mathQuestionDir, { withFileTypes: true });
    const files = entries
      .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.txt'))
      .filter(entry => {
        if (!sourceBase) return false;
        return entry.name.startsWith(`${sourceBase}${questionFileSeparator}`) || entry.name.startsWith(`${sourceBase}-`);
      })
      .map(entry => ({
        name: entry.name,
        label: entry.name.replace(/\.txt$/i, '')
      }))
      .sort((a, b) => b.name.localeCompare(a.name, 'ja', { numeric: true }));

    res.json({ directory: mathQuestionDir, sourceFile, files });
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
app.listen(port, () => {
  console.log(`TikZ app listening at http://localhost:${port}`);
});
