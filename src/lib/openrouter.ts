const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CategoryBreakdown {
  [category: string]: number;
}

export async function callAI(
  messages: Message[],
  maxTokens: number = 800,
  temperature: number = 0.7
): Promise<string> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
      'X-Title': 'HisaabAI',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0].message.content;
}

export async function generateTips(
  month: string,
  budget: number,
  spent: number,
  categories: CategoryBreakdown
): Promise<string> {
  const budgetDisplay = (budget / 100).toLocaleString('en-IN');
  const spentDisplay = (spent / 100).toLocaleString('en-IN');
  const categoryText = Object.entries(categories)
    .map(([cat, amount]) => `${cat}: ₹${(amount / 100).toLocaleString('en-IN')}`)
    .join(', ');

  const messages: Message[] = [
    {
      role: 'system',
      content:
        'You are a personal finance advisor for Indian users. Give practical, actionable advice. Always use ₹ symbol.',
    },
    {
      role: 'user',
      content: `Analyze my spending for ${month}:\nTotal budget: ₹${budgetDisplay}\nTotal spent: ₹${spentDisplay}\nCategory breakdown: ${categoryText}\nGive me 5 specific saving tips based on my spending pattern. Be concise.`,
    },
  ];

  return callAI(messages);
}

export async function generateAnalysis(
  month: string,
  expenseList: string
): Promise<string> {
  const messages: Message[] = [
    {
      role: 'system',
      content:
        'You are a financial analyst. Be direct and use Indian context (₹, Indian cities, Indian spending habits).',
    },
    {
      role: 'user',
      content: `My ${month} expenses:\n${expenseList}\nGive a 3-sentence analysis: what I spent most on, how I compare to typical Indian spending, and one key action to take next month.`,
    },
  ];

  return callAI(messages);
}
