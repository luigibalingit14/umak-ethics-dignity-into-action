/**
 * Vercel Serverless API — Dynamic Virtue Lab AI Evaluator
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

  // ── Build the prompt ───────────────────────────────────────────────────────
  // Kept concise to minimize input token usage and save credits.
  let systemPrompt = `You are a Catholic moral theologian and Philippine legal scholar for the University of Makati (UMak) GEE: Ethics final defense project (Group 1 - Strand 3: Cyberbullying and Peer Pressure). Analyze ethical dilemmas using the four core virtues: Humility and Receptivity (Alice von Hildebrand, "The Privilege of Being a Woman"), Agency and Courage/Fortitude (Tim Gray & Curtis Martin, "Boys to Men"), Catechism of the Catholic Church (CCC 2477-2479), and Republic Act No. 11313 (Safe Spaces Act - GBOSH, cyber harassment, accomplice liability). Respond in 2-3 short, clear paragraphs, under 170 words. Be warm, principled, and rigorous.`;

  let userPrompt = '';

  if (mode === 'choice') {
    // Evaluate a pre-set simulator choice (A, B, or C)
    const choiceDescriptions = {
      A: 'Option A: React with laughing emojis and forward the meme of Leo crying to the other section to avoid being called a "killjoy" and fit in with the group.',
      B: 'Option B: Stay quietly passive, mute notifications, and pretend you never saw the message to avoid drama and avoid becoming the next target.',
      C: 'Option C: Refuse to react or forward (Agency). Call out the GC: "Guys, this is too much. Let\'s delete this, we are destroying someone" (Fortitude), and privately message Leo to reassure him he has an ally (Receptivity).'
    };

    const scenario = `Campus Dilemma: Javier is in a 15-member friend group chat. One night around 11:30 PM, the group leader posts an embarrassing photo of classmate Leo (secretly taken while crying over a failing grade), accompanied by an insulting meme: "Uy guys, tingnan niyo si Leo umiiyak haha! I-forward niyo sa kabilang section para kumalat at maging viral!" Everyone has reacted with laughing emojis. The leader pressures Javier to share it. If Javier does not cooperate, he will be called a "killjoy" and could be the group's next target.`;

    userPrompt = `${scenario}\n\nThe student chose: ${choiceDescriptions[choice] || 'Unknown option'}\n\nAnalyze this choice using the four core virtues (Humility, Receptivity, Agency, Courage/Fortitude) and Philippine Law (RA 11313 Safe Spaces Act). What virtues were exercised or violated? What is the moral and legal consequence?`;

  } else if (mode === 'custom') {
    // ── Relevance guard: NO API call for off-topic inputs ──────────────────────
    if (!customDilemma || customDilemma.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide a more detailed dilemma (at least 20 characters).' });
    }

    const trimmed = customDilemma.trim();

    if (!isEthicsRelated(trimmed)) {
      return res.status(400).json({
        error: 'Hindi mukhang etikal na dilema ang iyong input. Pakiusap mag-type ng ethical dilemma na may kaugnayan sa moral decisions, relasyon, batas, o tamang pagkilos — para makatipid sa AI credits.\n\nHalimbawa: "Nakita ko ang kaibigan ko na nangongopya sa exam. Ano ang dapat kong gawin?"',
        offTopic: true
      });
    }

    userPrompt = `Analyze this ethical dilemma using virtue ethics (von Hildebrand, Gray & Martin) and Philippine law where relevant. Give a moral evaluation and clear recommendation.\n\nDilemma: ${trimmed}`;

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
          'HTTP-Referer': 'https://umak-ethics-group1.vercel.app',
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
