import { generateText, isStepCount } from 'ai';
import { model, getTools, SYSTEM_PROMPT } from '@/lib/agent';
import { saveMessage, getHistory } from '@/lib/db';

// Gemini free tier can have slow spells (plus SDK-internal retries) — give the
// full turn room to finish rather than dying at Vercel's default limit.
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { message, sessionId } = (await req.json()) as { message?: string; sessionId?: string };

    if (!message?.trim() || !sessionId) {
      return Response.json({ error: 'message and sessionId are required' }, { status: 400 });
    }

    await saveMessage('web', sessionId, 'user', message).catch(() => {});

    const history = await getHistory('web', sessionId, 20).catch(() => [
      { role: 'user' as const, content: message, created_at: '' },
    ]);
    // Empty messages poison Gemini into returning an empty response — never send them.
    const conversation = history
      .filter((h) => h.content.trim().length > 0)
      .map((h) => ({ role: h.role, content: h.content }));

    const result = await generateText({
      model,
      system: SYSTEM_PROMPT,
      messages: conversation,
      tools: getTools(),
      stopWhen: isStepCount(5),
    });

    const reply =
      result.text.trim() ||
      "Sorry — I glitched on that one. Could you send that again?";

    // Never persist an empty assistant turn; it would poison every later request in this session.
    if (result.text.trim()) {
      await saveMessage('web', sessionId, 'assistant', result.text).catch(() => {});
    }

    return Response.json({ reply });
  } catch (err) {
    console.error('chat route error', err);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
