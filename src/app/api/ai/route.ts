import OpenAI from "openai";

const openai = new OpenAI();


type Payload = {
    input: string;
}

export async function POST(request: Request) {
    const { input } = await request.json() as Payload;

    if (!input) {
        return Response.json({
            message: "No input provided"
        })
    }

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a marketing agent assistant that generated tweets from github commit messages." },
            { role: "user", content: `Generate a tweet for: ${input}` }
        ],
        max_tokens: 150,
        model: "gpt-3.5-turbo",
    });

    return Response.json({
        message: completion.choices[0]?.message?.content ?? "No response from AI"
    })
}