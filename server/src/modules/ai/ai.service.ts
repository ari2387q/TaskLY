import { AIChat } from "./ai.model";
import PracticeLog from "../logs/log.model";
import Skill from "../skills/skill.model";

type Role = "system" | "user" | "assistant";

const buildSystemContext = async (userId: string) => {
  
const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const logs = await PracticeLog.find({
    user: userId,
    practicedAt: { $gte: sevenDaysAgo },
  })
    .populate("skill", "name")
    .lean(); 

  if (!logs.length) {
    return `
You are SkillTracker Pro AI — a warm, highly encouraging, and supportive personal skills development coach.
Your goal is to inspire, support, and guide the user on their learning journey, celebrating their efforts and keeping them optimistic and focused.
Respond with deep empathy and a positive, encouraging tone. Highlight their potential and outline actionable steps.

DATA (Last 7 Days):
No practice activity recorded yet.

Guidelines:
- Do NOT use markdown headers (such as #, ##, ###, etc.) in your output at all.
- Use plain text or bold labels (e.g., **Activity Overview**) to structure your message.
- Keep the tone warm, welcoming, and motivational.

Respond with:
- **Welcoming & Encouragement**: Warm message of support.
- **Gentle 24-Hour Plan**: A tiny, achievable step to get started today.
- **Positive Performance Projection**: Inspiring visualization of their potential.
`;
  }

  const skillCount: Record<string, number> = {};

  for (const log of logs) {
    const skillName = (log.skill as any)?.name;
    if (!skillName) continue;

    skillCount[skillName] = (skillCount[skillName] || 0) + 1;
  }

  const sorted = Object.entries(skillCount).sort((a, b) => b[1] - a[1]);

  const mostPracticed = sorted[0]?.[0] || "N/A";
  const leastPracticed = sorted[sorted.length - 1]?.[0] || "N/A";

  return `
You are SkillTracker Pro AI — a warm, highly encouraging, and supportive personal skills development coach.
Your goal is to celebrate the user's progress, help them stay consistent, and guide them with high positive energy.
Respond with deep empathy and a positive, encouraging tone. Highlight their potential and outline actionable steps.

DATA (Last 7 Days):
Active Skills: ${sorted.map((s) => s[0]).join(", ")}
Most Practiced: ${mostPracticed}
Least Practiced: ${leastPracticed}
Total Sessions: ${logs.length}

Guidelines:
- Do NOT use markdown headers (such as #, ##, ###, etc.) in your output at all.
- Use plain text or bold labels (e.g., **Key Metrics**) to structure your message.
- Keep the tone energetic, motivational, and highly encouraging.

Respond with:
- **Key Metrics & Celebration**: Highlight what they've achieved.
- **Strongest Area**: Acknowledge their primary focus.
- **Growth & Optimization Opportunity**: Frame improvement areas positively.
- **Supportive 48-Hour Plan**: Actionable steps for the next two days.
- **Exciting Performance Projection**: Motivate them with what lies ahead.
`;
};

/* ======================================================
   CHAT WITH AI (Optimized)
====================================================== */

export const chatWithAI = async (
  userId: string,
  prompt: string,
  callAI: (messages: { role: Role; content: string }[]) => Promise<string>
) => {
  let chat = await AIChat.findOne({ user: userId });

  if (!chat) {
    chat = await AIChat.create({
      user: userId,
      messages: [],
    });
  }

  // Save user message
  chat.messages.push({
    role: "user",
    content: prompt,
  });

  // Limit stored DB messages (prevent infinite growth)
  const MAX_DB_MESSAGES = 50;
  if (chat.messages.length > MAX_DB_MESSAGES) {
  const excess = chat.messages.length - MAX_DB_MESSAGES;
  chat.messages.splice(0, excess);
}

  // Build system context
  const systemContext = await buildSystemContext(userId);

  // Limit messages sent to AI
  const MAX_HISTORY = 16; // Last 16 messages only
  const trimmedMessages = chat.messages.slice(-MAX_HISTORY);

  const messagesForAI: { role: Role; content: string }[] = [
    { role: "system", content: systemContext },
    ...trimmedMessages.map((m) => ({
      role: m.role as Role,
      content: m.content,
    })),
  ];

  // Call AI
  const aiReply = await callAI(messagesForAI);

  // Clean reply from any leftover markdown headers (eliminate ##, ### etc) and replace with bold labels
  const cleanedReply = aiReply.replace(/^#+\s*(.*)$/gm, '**$1**');

  // Save assistant reply
  chat.messages.push({
    role: "assistant",
    content: cleanedReply,
  });

  await chat.save();

  return cleanedReply;
};

/* ======================================================
   GET CHAT HISTORY
====================================================== */

export const getChatHistory = async (userId: string) => {
  const chat = await AIChat.findOne({ user: userId }).lean();
  return chat?.messages || [];
};

/* ======================================================
   CALL AI (Performance Optimized)
====================================================== */

export const callAI = async (
  messages: { role: string; content: string }[]
): Promise<string> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15 sec timeout

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "skill-tracker",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages,
        max_tokens: 500,       // Prevent long slow responses
        temperature: 0.4,      // More focused, faster output
        top_p: 0.9,
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenRouter API error: ${errText}`);
    }

    const data = await res.json() as any;

    return data.choices?.[0]?.message?.content || "No response generated.";
  } catch (error: any) {
    if (error.name === "AbortError") {
      return "AI request timed out. Please try again.";
    }
    throw error;
  }
};

/* ======================================================
   GET DYNAMIC MOTIVATION QUOTE
====================================================== */

const MOTIVATION_THEMES = [
  "overcoming procrastination",
  "building daily habits",
  "the power of consistency",
  "embracing the learning curve",
  "celebrating small wins",
  "staying focused on your goals",
  "resilience and bouncing back",
  "the compound effect of practice",
  "mastering new skills",
  "growth mindset",
];

export const getMotivation = async (): Promise<string> => {
  const theme = MOTIVATION_THEMES[Math.floor(Math.random() * MOTIVATION_THEMES.length)];
  const seed = Math.random().toString(36).substring(7);

  const messages = [
    {
      role: "system" as const,
      content:
        "You are a motivational coach. Return ONLY a single powerful, original, short motivational quote (1-2 sentences max) about the given theme. No author attribution. No markdown. No extra commentary. Just the quote text.",
    },
    {
      role: "user" as const,
      content: `Give me a unique motivational quote about: ${theme}. (seed: ${seed})`,
    },
  ];

  try {
    const quote = await callAI(messages);
    return quote.trim().replace(/^"|"$/g, "");
  } catch {
    return "Every expert was once a beginner. Keep going.";
  }
};
