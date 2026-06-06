import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

// Types that return structured JSON (not plain text)
const jsonTypes = ["would-you-rather", "guess-the", "countdown", "guess-it"];

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

  "kings-cup": (players) =>
    `Generate a single creative drinking game rule or challenge for a Kings Cup card game with players: ${players.join(", ")}. It should be a fun party rule, challenge, or mini-game. Keep it party-appropriate. Return ONLY a JSON object: {"rule": "Rule Name", "description": "What players must do"}`,

  "guess-the": (players) =>
    `Generate a single "Guess The..." challenge for a drinking game with players: ${players.join(", ")}. Pick a random category (song, movie, celebrity, country, animal, food, TV show, brand, etc). Return ONLY a JSON object: {"category": "Movie", "answer": "The actual answer", "hints": ["Easy-ish hint", "Medium hint", "Very specific hint"]}. Make the hints go from vague to specific. The answer should be well-known.`,

  "countdown": (players) =>
    `Generate a single "Countdown" challenge for a drinking game with players: ${players.join(", ")}. Pick a fun category and a number of items to name (between 3-7). Return ONLY a JSON object: {"category": "Types of pasta", "count": 5, "timeSeconds": 15, "examples": ["penne", "fusilli", "spaghetti", "rigatoni", "farfalle"]}. The category should be fun and the count should be achievable but challenging.`,

  "guess-it": (players) =>
    `Generate a single "Guess It" trivia challenge for a drinking game with players: ${players.join(", ")}. The question must have ONE specific, well-known correct answer (a number, year, name, or short fact) that everyone can guess at. Return ONLY a JSON object: {"question": "Guess the year the first iPhone was released", "answer": "2007"}. Keep the answer short and unambiguous. Make it fun and party-appropriate.`,
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

  "kings-cup": (count, players) =>
    `Generate ${count} unique creative drinking game rules/challenges for Kings Cup. Players: ${players.join(", ")}. Each should be a fun party rule, challenge, or mini-game. Keep it party-appropriate. Return ONLY a JSON array of objects. Example: [{"rule": "Rule Name", "description": "What players must do"}, ...]`,

  "guess-the": (count, players) =>
    `Generate ${count} unique "Guess The..." challenges for a drinking game. Players: ${players.join(", ")}. Use a MIX of categories (songs, movies, celebrities, countries, animals, foods, TV shows, brands, etc). Return ONLY a JSON array of objects. Example: [{"category": "Movie", "answer": "Titanic", "hints": ["It won 11 Academy Awards", "It's set in 1912", "Jack and Rose"]}, ...]. Make hints go from vague to specific. Answers should be well-known.`,

  "countdown": (count, players) =>
    `Generate ${count} unique "Countdown" challenges for a drinking game. Players: ${players.join(", ")}. Each has a fun category and number of items (3-7) to name within a time limit. Return ONLY a JSON array of objects. Example: [{"category": "Types of pasta", "count": 5, "timeSeconds": 15, "examples": ["penne", "fusilli", "spaghetti", "rigatoni", "farfalle"]}, ...]. Categories should be varied and fun.`,

  "guess-it": (count, players) =>
    `Generate ${count} unique "Guess It" trivia challenges for a drinking game. Players: ${players.join(", ")}. Each question must have ONE specific, well-known correct answer (a number, year, name, or short fact) that everyone can guess at. Use a MIX of topics (history, science, pop culture, sports, geography, etc). Return ONLY a JSON array of objects. Example: [{"question": "Guess the year the first iPhone was released", "answer": "2007"}, ...]. Keep answers short and unambiguous.`,
};

// Fallback questions if Claude API is unavailable
const fallbacks: Record<string, () => Record<string, unknown>> = {
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
  "kings-cup": () => ({
    rule: "Thumb Master",
    description: "Put your thumb on the table anytime. Last person to copy drinks!",
  }),
  "guess-the": () => {
    const items = [
      { category: "Movie", answer: "Titanic", hints: ["Won 11 Academy Awards", "Set in 1912", "Features Jack and Rose"] },
      { category: "Song", answer: "Bohemian Rhapsody", hints: ["By a British rock band", "Released in 1975", "Is this the real life?"] },
      { category: "Celebrity", answer: "Beyoncé", hints: ["Born in Houston, Texas", "Former member of a girl group", "Married to a rapper"] },
      { category: "Country", answer: "Japan", hints: ["Island nation in Asia", "Known for cherry blossoms", "Home of sushi and anime"] },
      { category: "TV Show", answer: "Breaking Bad", hints: ["Set in New Mexico", "Involves chemistry", "Say my name"] },
    ];
    return items[Math.floor(Math.random() * items.length)];
  },
  "countdown": () => {
    const items = [
      { category: "Types of pizza toppings", count: 5, timeSeconds: 15, examples: ["pepperoni", "mushrooms", "olives", "onions", "sausage"] },
      { category: "Disney movies", count: 4, timeSeconds: 12, examples: ["Lion King", "Frozen", "Aladdin", "Moana"] },
      { category: "Social media platforms", count: 5, timeSeconds: 10, examples: ["Instagram", "TikTok", "Twitter", "Snapchat", "Facebook"] },
    ];
    return items[Math.floor(Math.random() * items.length)];
  },
  "guess-it": () => {
    const items = [
      { question: "Guess the year the first iPhone was released", answer: "2007" },
      { question: "Guess how many bones are in the adult human body", answer: "206" },
      { question: "Guess how many hearts an octopus has", answer: "3" },
      { question: "Guess the year the Titanic sank", answer: "1912" },
      { question: "Guess how many keys are on a standard piano", answer: "88" },
    ];
    return items[Math.floor(Math.random() * items.length)];
  },
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

          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json({ questions: parsed });
          }
        } catch (err) {
          console.error("Claude batch error, using fallback:", err);
        }
      }

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
            max_tokens: 512,
            messages: [
              { role: "user", content: promptBuilder(players, currentPlayer) },
            ],
          });

          const text =
            message.content[0].type === "text" ? message.content[0].text.trim() : "";

          // For JSON-returning types, parse the response
          if (jsonTypes.includes(type)) {
            try {
              const jsonMatch = text.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return NextResponse.json(parsed);
              }
            } catch {
              // Fall through to fallback
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
