import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

// Single question prompts (used mid-game)
const singlePrompts: Record<string, (players: string[], currentPlayer?: string) => string> = {
  "truth-or-drink": (players, currentPlayer) =>
    `Generate a single spicy, fun "Truth or Drink" question for a drinking game. The current player is ${currentPlayer || "someone"}. Players: ${players.join(", ")}. Make it personal, funny, or mildly embarrassing — the kind of question that makes people laugh and squirm. Keep it party-appropriate (no extremely NSFW content). Return ONLY the question text, nothing else.`,

  "never-have-i-ever": (players) =>
    `Generate a single fun "Never Have I Ever" statement for a drinking game with players: ${players.join(", ")}. Make it relatable, surprising, or funny. It should start with "Never have I ever". Keep it party-appropriate. Return ONLY the statement, nothing else.`,

  "most-likely-to": (players) =>
    `Generate a single fun "Most Likely To" prompt for a drinking game with players: ${players.join(", ")}. Make it funny, creative, or absurd. It should start with "Most likely to". Keep it party-appropriate. Return ONLY the prompt, nothing else.`,

  "would-you-rather": (players) =>
    `Generate a single fun "Would You Rather" question for a drinking game with players: ${players.join(", ")}. Return ONLY a JSON object with two fields: "optionA" and "optionB". Both options should be funny, creative, or thought-provoking dilemmas. Keep it party-appropriate. Example format: {"optionA": "...", "optionB": "..."}`,

  "spin-the-bottle": (players) =>
    `Generate a single fun dare/challenge for a Spin the Bottle drinking game with players: ${players.join(", ")}. It can be a drinking dare, funny challenge, or social task. Keep it party-appropriate. Return ONLY the dare text, nothing else.`,
};

// Batch prompts (used for pre-generation)
const batchPrompts: Record<string, (count: number, players: string[]) => string> = {
  "truth-or-drink": (count, players) =>
    `Generate ${count} unique, spicy "Truth or Drink" questions for a drinking game. Players: ${players.join(", ")}. Make them personal, funny, or mildly embarrassing — the kind of questions that make people laugh and squirm. Keep it party-appropriate. Return ONLY a JSON array of strings. Example: ["Question 1?", "Question 2?"]`,

  "never-have-i-ever": (count, players) =>
    `Generate ${count} unique "Never Have I Ever" statements for a drinking game. Players: ${players.join(", ")}. Each must start with "Never have I ever". Make them relatable, surprising, or funny. Keep it party-appropriate. Return ONLY a JSON array of strings. Example: ["Never have I ever ...", "Never have I ever ..."]`,

  "most-likely-to": (count, players) =>
    `Generate ${count} unique "Most Likely To" prompts for a drinking game. Players: ${players.join(", ")}. Each must start with "Most likely to". Make them funny, creative, or absurd. Keep it party-appropriate. Return ONLY a JSON array of strings. Example: ["Most likely to ...", "Most likely to ..."]`,

  "would-you-rather": (count, players) =>
    `Generate ${count} unique "Would You Rather" dilemmas for a drinking game. Players: ${players.join(", ")}. Make them funny, creative, or thought-provoking. Keep it party-appropriate. Return ONLY a JSON array of objects. Example: [{"optionA": "...", "optionB": "..."}, {"optionA": "...", "optionB": "..."}]`,

  "spin-the-bottle": (count, players) =>
    `Generate ${count} unique fun dares/challenges for a Spin the Bottle drinking game. Players: ${players.join(", ")}. Include a mix of drinking dares, funny challenges, and social tasks. Keep it party-appropriate. Return ONLY a JSON array of strings. Example: ["Take two sips!", "Do your best dance move!"]`,
};

// Fallback questions if Claude API is unavailable
const fallbacks: Record<string, () => Record<string, string>> = {
  "truth-or-drink": () => ({
    question: [
      "If you could swap lives with someone in this room, who and why?",
      "What's the most embarrassing thing in your camera roll right now?",
      "What's a secret you've never told anyone here?",
      "What's the biggest red flag you've ignored in a relationship?",
      "What's something you pretend to like but secretly hate?",
    ][Math.floor(Math.random() * 5)],
  }),
  "never-have-i-ever": () => ({
    question: [
      "Never have I ever cried in public over something silly",
      "Never have I ever pretended to know a song and just hummed along",
      "Never have I ever sent a risky text to the wrong person",
      "Never have I ever pretended to work while doing nothing",
      "Never have I ever Googled myself",
    ][Math.floor(Math.random() * 5)],
  }),
  "most-likely-to": () => ({
    question: [
      "Most likely to accidentally go live on social media",
      "Most likely to survive on a deserted island the longest",
      "Most likely to cry at a dog video",
      "Most likely to go viral for something embarrassing",
      "Most likely to forget their password to everything",
    ][Math.floor(Math.random() * 5)],
  }),
  "would-you-rather": () => ({
    optionA: "Have to announce every lie you tell",
    optionB: "Never be able to tell a lie",
  }),
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, players = [], currentPlayer, count } = body;
    const isBatch = count && count > 1;

    if (isBatch) {
      // --- BATCH GENERATION (pre-game) ---
      const batchBuilder = batchPrompts[type];
      if (!batchBuilder) {
        return NextResponse.json({ error: "Unknown game type" }, { status: 400 });
      }

      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const message = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 4096,
            messages: [
              { role: "user", content: batchBuilder(count, players) },
            ],
          });

          const text =
            message.content[0].type === "text" ? message.content[0].text.trim() : "[]";

          // Extract JSON array from response (handle markdown code blocks)
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json({ questions: parsed });
          }
        } catch (err) {
          console.error("Claude batch error, using fallback:", err);
        }
      }

      // Fallback: return empty array, games will use built-in questions
      return NextResponse.json({ questions: [] });
    } else {
      // --- SINGLE GENERATION (mid-game) ---
      const promptBuilder = singlePrompts[type];
      if (!promptBuilder) {
        return NextResponse.json({ error: "Unknown game type" }, { status: 400 });
      }

      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const message = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 256,
            messages: [
              { role: "user", content: promptBuilder(players, currentPlayer) },
            ],
          });

          const text =
            message.content[0].type === "text" ? message.content[0].text.trim() : "";

          if (type === "would-you-rather") {
            try {
              const parsed = JSON.parse(text);
              return NextResponse.json(parsed);
            } catch {
              const match = text.match(/optionA["\s:]+([^"]+)".*optionB["\s:]+([^"]+)"/);
              if (match) {
                return NextResponse.json({ optionA: match[1], optionB: match[2] });
              }
            }
          } else {
            return NextResponse.json({ question: text });
          }
        } catch (err) {
          console.error("Claude API error, using fallback:", err);
        }
      }

      const fallback = fallbacks[type];
      return NextResponse.json(fallback ? fallback() : { error: "Unknown type" });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
