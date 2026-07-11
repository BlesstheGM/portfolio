import { generateText, isStepCount } from 'ai';
import twilio from 'twilio';
import { model, getTools, SYSTEM_PROMPT } from '@/lib/agent';
import { saveMessage, getHistory } from '@/lib/db';

export const maxDuration = 30;

function xml(body: string) {
  return new Response(body, { headers: { 'Content-Type': 'text/xml' } });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody).entries());

  // Confirm the request really came from Twilio before doing anything with it.
  const signature = req.headers.get('x-twilio-signature') ?? '';
  const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';
  const url = `https://${req.headers.get('host')}/api/whatsapp`;
  const valid = twilio.validateRequest(authToken, signature, url, params);
  if (!valid) {
    return new Response('Invalid signature', { status: 403 });
  }

  const from = params.From; // "whatsapp:+27821234567"
  const text = params.Body ?? '';
  const twiml = new twilio.twiml.MessagingResponse();

  if (!from || !text.trim()) {
    twiml.message("Sorry, I didn't catch that — could you send it again?");
    return xml(twiml.toString());
  }

  try {
    await saveMessage('whatsapp', from, 'user', text);
    const history = await getHistory('whatsapp', from, 20);
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

    // Never persist an empty assistant turn; it would poison every later request in this session.
    if (result.text.trim()) {
      await saveMessage('whatsapp', from, 'assistant', result.text);
    }
    twiml.message(result.text.trim() || "I'm here — what are you looking for?");
  } catch (err) {
    console.error('whatsapp route error', err);
    twiml.message('Something went wrong on my end — please try again in a moment.');
  }

  return xml(twiml.toString());
}
