import { streamText, isStepCount } from 'ai';
import { after } from 'next/server';
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

    // History doesn't include the current message (it's appended in memory
    // below), so its save doesn't need to block the model call.
    const history = await getHistory('web', sessionId, 20).catch(() => []);
    after(() => saveMessage('web', sessionId, 'user', message).catch(() => {}));

    // Empty messages poison Gemini into returning an empty response — never send them.
    const conversation = [
      ...history
        .filter((h) => h.content.trim().length > 0)
        .map((h) => ({ role: h.role, content: h.content })),
      { role: 'user' as const, content: message },
    ];

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: conversation,
      tools: getTools(),
      stopWhen: isStepCount(5),
      onFinish: async ({ text }) => {
        // Never persist an empty assistant turn; it would poison every later
        // request in this session.
        if (text.trim()) {
          await saveMessage('web', sessionId, 'assistant', text).catch(() => {});
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error('chat route error', err);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
