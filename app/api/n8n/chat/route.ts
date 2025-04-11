// app/api/n8n/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    // Forward the message to your n8n webhook endpoint
    const n8nResponse = await fetch('https://sohaibsoussi.app.n8n.cloud/webhook-test/a9b6f013-43dc-497d-b69e-401d1afbbe54', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await n8nResponse.json();
    return NextResponse.json({ response: data.response });
  } catch (err) {
    console.error('Error forwarding to n8n:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}