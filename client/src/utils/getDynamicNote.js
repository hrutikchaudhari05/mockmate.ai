export const getDynamicNote = ({ difficulty, type, expectedWords }) => {
  const notes = [];

  // 1️⃣ Difficulty-based guidance
  if (difficulty === "advanced") {
    notes.push(
      "Focus on depth and trade-offs. Mention edge cases and justify your choices."
    );
  } else if (difficulty === "hard") {
    notes.push(
      "Structure your answer clearly. Partial reasoning is better than skipping."
    );
  } else if (difficulty === "medium") {
    notes.push(
      "Explain the core idea clearly before diving into details."
    );
  } else {
    notes.push(
      "Keep your answer simple and to the point."
    );
  }

  // 2️⃣ Question type guidance
  switch (type) {
    case "conceptual":
      notes.push(
        "Explain the concept in your own words and, if possible, give a small example."
      );
      break;

    case "real-world":
      notes.push(
        "Relate your answer to real-world systems or practical use cases."
      );
      break;

    case "deep-dive":
      notes.push(
        "Go deeper into internals, limitations, and why certain approaches work better."
      );
      break;

    case "practical":
      notes.push(
        "Focus on implementation details and decision-making rather than theory."
      );
      break;

    case "scenario":
      notes.push(
        "State assumptions clearly and walk through your approach step by step."
      );
      break;

    default:
      break;
  }

  // 3️⃣ Expected word count guidance
  const maxWords = Number(expectedWords);

  if (!Number.isNaN(maxWords)) {
    if (maxWords >= 150) {
      notes.push(
        "A structured response with sections or bullet points will work well."
      );
    } else if (maxWords >= 80) {
      notes.push(
        "Balance clarity with detail. Avoid unnecessary tangents."
      );
    } else {
      notes.push(
        "Be concise. Focus only on the most important points."
      );
    }
  }

  // 4️⃣ Final safety net (guarantee at least one note)
  if (notes.length === 0) {
    return "Answer thoughtfully and explain your reasoning clearly.";
  }

  // 🎯 Return ONE strong, combined note
  return notes.slice(0, 2).join(" ");
};
 