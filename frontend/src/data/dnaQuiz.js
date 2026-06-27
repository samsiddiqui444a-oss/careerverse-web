// 10 quiz questions. Each option carries weights toward career categories.
// Categories must match the seeded category IDs in /app/backend/data/seed_data.py.
export const DNA_QUESTIONS = [
    { id: "q1", q: "When you have free time, you most often…",
      options: [
        { id: "a", label: "Build, code or tinker with tech", w: { tech: 2, engg: 1 } },
        { id: "b", label: "Draw, design or make videos", w: { design: 2, media: 1 } },
        { id: "c", label: "Read, write, debate ideas", w: { law: 2, edu: 1, media: 1 } },
        { id: "d", label: "Help, listen to, or care for people", w: { health: 2, edu: 1 } },
      ] },
    { id: "q2", q: "Which school subject do you secretly enjoy the most?",
      options: [
        { id: "a", label: "Math & Physics", w: { engg: 2, tech: 1 } },
        { id: "b", label: "Biology & Chemistry", w: { health: 2 } },
        { id: "c", label: "Economics & Business Studies", w: { biz: 2 } },
        { id: "d", label: "History, Civics, English", w: { law: 1, media: 2, edu: 1 } },
      ] },
    { id: "q3", q: "If you ran a club, you'd be the…",
      options: [
        { id: "a", label: "Strategist mapping the plan", w: { biz: 2, tech: 1 } },
        { id: "b", label: "Designer making the posters", w: { design: 2, media: 1 } },
        { id: "c", label: "Speaker at the front of the room", w: { law: 2, media: 1 } },
        { id: "d", label: "Researcher digging up the facts", w: { edu: 2, health: 1 } },
      ] },
    { id: "q4", q: "A perfect work environment is…",
      options: [
        { id: "a", label: "A focused desk with a computer", w: { tech: 2 } },
        { id: "b", label: "A studio with materials and tools", w: { design: 2, engg: 1 } },
        { id: "c", label: "A clinic, lab, or hospital", w: { health: 2 } },
        { id: "d", label: "On stage, on site, or on the field", w: { media: 2, law: 1 } },
      ] },
    { id: "q5", q: "Pick a phrase you most relate to:",
      options: [
        { id: "a", label: "Numbers don't lie", w: { biz: 2, tech: 1 } },
        { id: "b", label: "Form follows feeling", w: { design: 2 } },
        { id: "c", label: "Knowledge is power", w: { edu: 2, law: 1 } },
        { id: "d", label: "Care is the best craft", w: { health: 2 } },
      ] },
    { id: "q6", q: "How do you handle a tricky problem?",
      options: [
        { id: "a", label: "Break it into logical steps", w: { tech: 2, engg: 1 } },
        { id: "b", label: "Sketch it out visually", w: { design: 2 } },
        { id: "c", label: "Argue both sides aloud", w: { law: 2, media: 1 } },
        { id: "d", label: "Find a kinder, calmer answer", w: { health: 2, edu: 1 } },
      ] },
    { id: "q7", q: "Your dream first salary is…",
      options: [
        { id: "a", label: "High and risk-friendly", w: { biz: 2, tech: 1 } },
        { id: "b", label: "Stable and respectable", w: { edu: 1, engg: 2, law: 1 } },
        { id: "c", label: "Meaningful over money", w: { health: 2, edu: 1 } },
        { id: "d", label: "Creative-led, flexible", w: { design: 2, media: 1 } },
      ] },
    { id: "q8", q: "Which weekend project sounds fun?",
      options: [
        { id: "a", label: "Build a small app or game", w: { tech: 2 } },
        { id: "b", label: "Run a stall or mini-business", w: { biz: 2 } },
        { id: "c", label: "Volunteer at a hospital or NGO", w: { health: 2, edu: 1 } },
        { id: "d", label: "Make a short film or magazine", w: { media: 2, design: 1 } },
      ] },
    { id: "q9", q: "Which compliment would you treasure?",
      options: [
        { id: "a", label: "You think so clearly", w: { tech: 1, law: 2, engg: 1 } },
        { id: "b", label: "You make beautiful things", w: { design: 2, media: 1 } },
        { id: "c", label: "You really care for people", w: { health: 2, edu: 1 } },
        { id: "d", label: "You get things done", w: { biz: 2, engg: 1 } },
      ] },
    { id: "q10", q: "If you could fix one thing in India, it would be…",
      options: [
        { id: "a", label: "Tech access & innovation gap", w: { tech: 2 } },
        { id: "b", label: "Healthcare & well-being", w: { health: 2 } },
        { id: "c", label: "Justice & governance", w: { law: 2 } },
        { id: "d", label: "Education & opportunity", w: { edu: 2, media: 1 } },
      ] },
];

export function scoreAnswers(answers) {
    const totals = {};
    for (const q of DNA_QUESTIONS) {
        const choice = answers[q.id];
        const opt = q.options.find((o) => o.id === choice);
        if (!opt) continue;
        for (const [cat, w] of Object.entries(opt.w)) {
            totals[cat] = (totals[cat] || 0) + w;
        }
    }
    const ranked = Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, score]) => ({ cat, score }));
    return ranked;
}
