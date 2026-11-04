/**
 * Vercel Serverless API — AI reflection aid
 * File: /api/virtue-eval.js
 *
 * Logic:
 *  1. For 'custom' mode: run a FREE local relevance check — reject off-topic
 *     inputs before spending any API credits.
 *  2. Try OpenRouter (primary) — openai/gpt-4o-mini
 *  3. If OpenRouter fails, fallback to Groq (llama-3.1-8b-instant)
 *  4. Returns { response: "<AI ethical analysis text>" }
 *
 * Environment variables needed:
 *  - OPENROUTER_API_KEY
 *  - OPENROUTER_API_KEY_2   (optional fallback)
 *  - GROQ_API_KEY           (optional fallback)
 */

// ── Relevance keywords for the custom dilemma guard ──────────────────────────
// The input must contain AT LEAST ONE word from this set to be considered
// ethics-related. This check runs locally — ZERO API cost.
const ETHICS_KEYWORDS = [
  // Core ethics / virtue concepts
  'etika', 'ethics', 'moral', 'virtue', 'kabutihan', 'mabuti', 'masama', 'evil',
  'dignidad', 'dignity', 'respeto', 'respect', 'responsibilidad', 'responsibility',
  'katotohanan', 'truth', 'honest', 'tapat', 'justice', 'katarungan',
  'prudence', 'prudensya', 'temperance', 'fortitude', 'kabaitan', 'kindness',
  // Philippine law / social norms
  'batas', 'law', 'legal', 'karapatan', 'right', 'rights', 'obligasyon', 'duty',
  'safe spaces', 'harassment', 'panliligalig', 'bullying', 'cyberbullying',
  'peer pressure', 'pressure', 'group project', 'contribution', 'credit',
  'diskriminasyon', 'discrimination', 'privacy', 'pribilehiyo',
  // Dilemma / decision-making language
  'dilemma', 'dilema', 'pagpili', 'choice', 'decide', 'desisyon', 'decision',
  'dapat', 'tama', 'mali', 'right or wrong', 'tama ba', 'mali ba',
  'situation', 'sitwasyon', 'problema', 'issue', 'concern', 'tanong',
  // Social/relational context (common ethics scenarios)
  'kaibigan', 'friend', 'classmate', 'kaklase', 'professor', 'guro', 'teacher',
  'pamilya', 'family', 'anak', 'magulang', 'asawa', 'relasyon', 'relationship',
  'trabaho', 'work', 'opisina', 'school', 'paaralan', 'grupo', 'group',
  'cheat', 'mandaraya', 'kopya', 'plagiarism', 'plagiarismo',
  'share', 'post', 'screenshot', 'forward', 'spread', 'nagkalat',
  // Religious / theological context
  'diyos', 'god', 'faith', 'pananampalataya', 'church', 'simbahan',
  'sin', 'kasalanan', 'kapatawaran', 'forgiveness', 'awa', 'charity',
  'von hildebrand', 'hildebrand', 'gray', 'martin', 'catholic', 'katoliko',
  // Broad safety net: verbs/words indicating a moral situation
  'ginawa', 'nagawa', 'gawa', 'aksyon', 'action', 'nangyari', 'happened',
  'nasaktan', 'hurt', 'natulong', 'helped', 'natawanan', 'pinahiya', 'embarrassed',
  'nagsinungaling', 'lied', 'ninakaw', 'stolen', 'steal', 'cheated', 'betrayed',
  'natakot', 'afraid', 'guilty', 'nagkasala', 'regret', 'nagsisi'
];

function isEthicsRelated(text) {
  const lower = text.toLowerCase();
  return ETHICS_KEYWORDS.some(kw => lower.includes(kw));
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { choice, customDilemma, mode } = req.body || {};
  const validChoices = ['A', 'B', 'C'];

  // ── Build the prompt ───────────────────────────────────────────────────────
  // Kept concise to minimize input token usage and save credits.
  let systemPrompt = `You are an AI discussion aid for a University of Makati GEE: Ethics Group 3 project asking how humility and receptivity can coexist with agency and courage when peers pressure a student to stay silent. Help analyze the described choice using these as interpretive lenses: von Hildebrand, The Privilege of Being a Woman, Parts V-VI; Gray & Martin, Boys to Men, Chapter 4 (fortitude); and, where useful, Catholic teaching on prudence and fortitude (Catechism §§1806, 1808). "Agency" is the project's working term, not a virtue directly established by the cited Chapter 4 passage. Do not claim these authors address the fictional case directly. Do not invent quotations, page numbers, evidence, policies, legal consequences, diagnoses, or outcomes; do not give legal advice. State uncertainty and distinguish source ideas from the project's application. Silence is not automatically complicity, and courage does not always require public confrontation. Offer proportionate options and mention limits. Respond in 2-3 short paragraphs under 170 words.`;

  let userPrompt = '';

  if (mode === 'choice') {
    if (!validChoices.includes(choice)) {
      return res.status(400).json({ error: 'Invalid choice. Use A, B, or C.' });
    }

    // Evaluate a pre-set simulator choice (A, B, or C)
    const choiceDescriptions = {
      A: 'Option A: Stay quiet and accept the group decision to leave the teammate’s idea and contribution out without checking the source.',
      B: 'Option B: Publicly accuse the group of dishonesty and insist the idea be included before checking the source or hearing their reasons.',
      C: 'Option C: Ask the teammate to explain the source, review it with the group, request fair credit, and seek ordinary course guidance if the concern remains.'
    };

    const scenario = `Fictional college-life case, not an actual UMak incident: During a group-project meeting, a teammate offers a source and an idea for the report. The group dismisses it without checking, and a friend pressures Javier to stay quiet so they can finish quickly. Javier is unsure whether the source supports the idea.`;

    userPrompt = `${scenario}\n\nThe student chose: ${choiceDescriptions[choice] || 'Unknown option'}\n\nReflect on the choice using humility, receptivity, agency (as this project's working term), and fortitude. Explain one strength, one possible difficulty, and a proportionate next step. Do not assign numerical virtue scores.`;

  } else if (mode === 'custom') {
    // ── Relevance guard: NO API call for off-topic inputs ──────────────────────
    if (typeof customDilemma !== 'string') {
      return res.status(400).json({ error: 'Please submit your dilemma as text.' });
    }

    const trimmed = customDilemma.trim();
    if (trimmed.length < 20 || trimmed.length > 800) {
      return res.status(400).json({ error: 'Please provide a dilemma between 20 and 800 characters.' });
    }

    if (!isEthicsRelated(trimmed)) {
      return res.status(400).json({
        error: 'Hindi mukhang etikal na dilema ang iyong input. Pakiusap mag-type ng ethical dilemma na may kaugnayan sa moral decisions, relasyon, batas, o tamang pagkilos — para makatipid sa AI credits.\n\nHalimbawa: "Nakita ko ang kaibigan ko na nangongopya sa exam. Ano ang dapat kong gawin?"',
        offTopic: true
      });
    }

    userPrompt = `Discuss this dilemma as a limited reflection, not an authoritative judgment. Use humility, receptivity, agency (the project's working term), and fortitude as lenses where relevant. Distinguish your application from claims made by the assigned authors, avoid legal conclusions, and offer proportionate options rather than a guaranteed outcome. Do not invent citations or numerical virtue scores.\n\nDilemma: ${trimmed}`;

  } else {
    return res.status(400).json({ error: 'Invalid mode. Use "choice" or "custom".' });
  }

  // ── Load API keys ──────────────────────────────────────────────────────────
  const openRouterKey1 = (process.env.OPENROUTER_API_KEY || '').trim();
  const openRouterKey2 = (process.env.OPENROUTER_API_KEY_2 || '').trim();
  const openRouterModel = (process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini').trim();

  const groqKey = (process.env.GROQ_API_KEY || '').trim();
  const groqModel = (process.env.GROQ_MODEL || 'llama-3.1-8b-instant').trim();

  const orKeys = [openRouterKey1, openRouterKey2].filter(k => k && k !== 'your_openrouter_api_key_here');
  const isGroqValid = groqKey && groqKey !== 'your_groq_api_key_here';

  if (orKeys.length === 0 && !isGroqValid) {
    return res.status(500).json({ 
      error: 'Wala pang API key na nakalagay. Paki-paste ang iyong OPENROUTER_API_KEY o GROQ_API_KEY sa .env.local (kung local) o sa Vercel Environment Variables (kung online).' 
    });
  }

  // ── Attempt OpenRouter (try key 1, then key 2) ─────────────────────────────
  for (const currentORKey of orKeys) {
    try {
      const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentORKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://umak-ethics-dignity-into-action-g1.vercel.app',
          'X-Title': 'UMak Ethics - Dignity into Action'
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 280,
          temperature: 0.65
        })
      });

      if (orResponse.ok) {
        const data = await orResponse.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          const displayModel = openRouterModel.split('/').pop() || openRouterModel;
          return res.status(200).json({ response: text, provider: `OpenRouter (${displayModel})` });
        }
      }
      console.warn('OpenRouter key attempt returned non-OK status:', orResponse.status);
    } catch (e) {
      console.warn('OpenRouter request error:', e.message);
    }
  }

  // ── Attempt Groq fallback ──────────────────────────────────────────────────
  if (isGroqValid) {
    try {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 280,
          temperature: 0.65
        })
      });

      if (groqResponse.ok) {
        const data = await groqResponse.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          const displayModel = groqModel.split('/').pop() || groqModel;
          return res.status(200).json({ response: text, provider: `Groq (${displayModel})` });
        }
      }

      const errText = await groqResponse.text();
      console.error('Groq error response:', errText);
    } catch (e) {
      console.error('Groq error:', e.message);
    }
  }

  return res.status(502).json({ error: 'Both AI providers failed. Please verify your API key or model name in .env.local.' });
}
