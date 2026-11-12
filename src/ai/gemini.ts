export type GeminiTurn = {
  role: 'user' | 'model';
  text: string;
  image?: { mime: string; data: string };
};

const MODEL = 'gemini-3.5-flash-lite';

function latestQuestion(turns: GeminiTurn[]) {
  return [...turns].reverse().find((turn) => turn.role === 'user')?.text.trim() ?? '';
}

function isGreeting(text: string) {
  const cleaned = text.toLowerCase().replace(/[¡!¿?.,]/g, '').trim();
  return ['hola', 'hello', 'hi', 'hey', 'buenas', 'buenos días', 'buenos dias', 'buenas tardes', 'buenas noches', 'pura vida', 'qué tal', 'que tal', 'saludos'].includes(cleaned);
}

function history(turns: GeminiTurn[]) {
  const filled = turns.filter((turn) => turn.text);
  const pairs: GeminiTurn[] = [];
  for (let index = 0; index < filled.length; index += 1) {
    const turn = filled[index];
    const next = filled[index + 1];
    if (turn.role === 'user' && next?.role === 'model' && next.text) {
      pairs.push(turn, next);
      index += 1;
    }
  }
  const latest = [...filled].reverse().find((turn) => turn.role === 'user');
  if (latest && pairs[pairs.length - 1] !== latest) pairs.push(latest);
  return pairs;
}

function headers() {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!key) throw new Error('missing');
  return { 'Content-Type': 'application/json', 'x-goog-api-key': key };
}

function tavilyHeaders() {
  const key = process.env.EXPO_PUBLIC_TAVILY_API_KEY;
  if (!key) throw new Error('missing');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` };
}

function searchQuery(question: string) {
  if (/semana 10|week 10/i.test(question)) return question;
  return `${question} NFL week 10 2026`;
}

async function tavilyAnswer(question: string) {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: tavilyHeaders(),
    body: JSON.stringify({
      query: searchQuery(question),
      search_depth: 'advanced',
      topic: 'general',
      max_results: 5,
      include_answer: 'advanced',
    }),
  });
  if (!response.ok) throw new Error(response.status === 429 ? '429' : 'request');
  const payload = (await response.json()) as { answer?: string; results?: { title?: string; url?: string }[] };
  const answer = payload.answer?.trim() ?? '';
  if (!answer) throw new Error('empty');
  const source = payload.results?.find((item) => item.url && !/youtube\.com|youtu\.be/i.test(item.url));
  if (!source?.url || answer.includes(source.url)) return answer;
  return `${answer}\n${source.title ?? ''}\n${source.url}`;
}

function greetingPrompt(language: string) {
  return language.startsWith('es')
    ? 'Usted es el lector de la NFL de PlayBookCR. Responda de usted, en una o dos frases, e invite a preguntar por un partido o por jugadores.'
    : 'You are the PlayBookCR NFL reader. Answer in one or two sentences and invite a question about a game or its players.';
}

async function streamGreeting(language: string, turns: GeminiTurn[], onText: (text: string) => void) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: greetingPrompt(language) }] },
      generationConfig: { temperature: 0.4, maxOutputTokens: 180 },
      contents: history(turns).map((turn) => ({
        role: turn.role,
        parts: [{ text: turn.text }],
      })),
    }),
  });
  if (!response.ok || !response.body) {
    await response.text().catch(() => undefined);
    throw new Error(response.status === 429 ? '429' : 'request');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  let full = '';
  while (true) {
    const step = await reader.read();
    pending += decoder.decode(step.value, { stream: !step.done });
    const lines = pending.split('\n');
    pending = step.done ? '' : (lines.pop() ?? '');
    for (const line of lines) {
      const data = line.trim().startsWith('data:') ? line.trim().slice(5).trim() : '';
      if (!data || data === '[DONE]') continue;
      try {
        const payload = JSON.parse(data) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
        const piece = payload.candidates?.[0]?.content?.parts
          ?.filter((part) => part.text && !part.thought)
          .map((part) => part.text ?? '')
          .join('');
        if (!piece) continue;
        full += piece;
        onText(full);
      } catch {
        // A partial JSON line is completed on the next read.
      }
    }
    if (step.done) break;
  }
  if (!full.trim()) throw new Error('empty');
}

export async function streamGemini(language: string, turns: GeminiTurn[], onText: (text: string) => void) {
  const question = latestQuestion(turns);
  if (isGreeting(question)) {
    await streamGreeting(language, turns, onText);
    return;
  }
  onText(await tavilyAnswer(question));
}
