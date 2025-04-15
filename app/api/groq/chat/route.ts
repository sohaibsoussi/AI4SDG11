import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// Initialize Groq with your API key (set via environment variable)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Define the static transportation context (from your PDF)
// You can paste the full text or a summarized version here
const transportationContext = `
Transportation Options in Casablanca, Morocco

Taxis in Casablanca:
• Petit taxis are metered red taxis for up to 3 passengers.
• Grand taxis operate on fixed routes and can carry up to 6 passengers.
• Ride-hailing services (Careem, inDrive, Roby) are popular alternatives.

Casablanca Tram System:
• Four lines (T1-T4) span the city with stops at key transit hubs.
• Trams run from early morning to approximately 10:30 PM.
• They are efficient, affordable, and linked with other public transport.

Trains in Casablanca:
• Major stations: Casa-Voyageurs and Casa-Port.
• High-speed trains (Al Boraq) and regional trains provide excellent connectivity.

CO₂ Emissions & Safety:
• Petit taxis produce around 160 g CO₂/km; grand taxis more.
• The tram system and trains have much lower emissions.
• Safety tips include using official taxis and staying aware in certain neighborhoods.
`; 

export async function POST(request: Request) {
  try {
    // Extract payload with messages and dynamic context (if any)
    const { messages, context } = await request.json();

    // Build the complete system prompt by prepending your static transportation context
    // along with any additional dynamic details (like current route data)
    const fullContext = `
${transportationContext}

Current Route Information:
${context}
    `.trim();
    
    // Insert fullContext as a system message at the front of the conversation
    const fullMessages = [{ role: "system", content: fullContext }, ...messages];

    // Call Groq Chat API
    const chatCompletion = await groq.chat.completions.create({
      messages: fullMessages,
      model: "llama-3.3-70b-versatile",
    });

    const answer = chatCompletion.choices[0]?.message?.content || "";
    return NextResponse.json({ response: answer });
  } catch (error) {
    console.error("Groq chat error:", error);
    return NextResponse.json(
      { error: "Error processing chat with Groq" },
      { status: 500 }
    );
  }
}
