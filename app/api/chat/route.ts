import { generateText, isStepCount } from 'ai';
import { model, getTools, SYSTEM_PROMPT } from '@/lib/agent';
import { saveMessage, getHistory } from '@/lib/db';

export const maxDuration = 30;

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
    const conversation = history.map((h) => ({ role: h.role, content: h.content }));

    const result = await generateText({
      model,
      system: SYSTEM_PROMPT,
      messages: conversation,
      tools: getTools(),
      stopWhen: isStepCount(5),
    });

    console.log('generateText result:', { text: result.text, steps: result.steps?.length, usage: result.usage });

    await saveMessage('web', sessionId, 'assistant', result.text).catch(() => {});

    return Response.json({ reply: result.text });
  } catch (err) {
    console.error('chat route error', err);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
