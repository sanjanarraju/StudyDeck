import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

const { runtime } = addOnSandboxSdk.instance;

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pickMissingWord(sentence) {
  // 1. Check for numbers
  const numberMatch = sentence.match(/\b\d+(\.\d+)?\b/);
  if (numberMatch) return numberMatch[0];

  // 2. Check for first Proper Noun (capitalized, not first word, not all caps)
  const words = sentence.split(/\s+/);
  for (let i = 1; i < words.length; i++) { // skip first word (often start of sentence)
    const word = words[i].replace(/[^\w]/g, '');
    if (
      word.length > 1 &&
      /^[A-Z][a-z]+$/.test(word)
    ) {
      return word;
    }
  }

  // 3. First common noun (simple heuristic: not a stopword, not capitalized, >3 chars)
  const stopwords = [
    'law', 'object', 'cell', 'cells', 'thing', 'stuff', 'motion', 'body', 'state', 'process', 'cycle', 'play', 'water', 'air', 'place',
    'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'so', 'because', 'of', 'in', 'on', 'at', 'by', 'with', 'to', 'for', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being'
  ];
  for (let word of words) {
    const clean = word.replace(/[^\w]/g, '');
    if (
      clean.length > 3 &&
      !stopwords.includes(clean.toLowerCase()) &&
      /^[a-z]+$/.test(clean)
    ) {
      return clean;
    }
  }
  return null;
}

function start() {
  const sandboxApi = {
    generateFlashcards: async (notes) => {
      console.log("generateFlashcards called with notes:", notes);

      const sentences = notes.split('.').map(s => s.trim()).filter(s => s.length > 0);

      let yOffset = 10; // Start y position for flashcards
      for (const sentence of sentences) {
        // Pick a word to blank out
        const missingWord = pickMissingWord(sentence);
        if (!missingWord) continue;

        const regex = new RegExp(`\\b${escapeRegex(missingWord)}\\b`, 'i');
        const question = sentence.replace(regex, "_____");

        // Create a rectangle to represent the flashcard
        const flashcard = editor.createRectangle();
        flashcard.width = 300;
        flashcard.height = 150;
        flashcard.translation = { x: 10, y: yOffset };

        const backgroundColor = { red: 0.9, green: 0.9, blue: 0.9, alpha: 1 };
        flashcard.fill = editor.makeColorFill(backgroundColor);

        // Add text label for the question
        const textObject = editor.createText();
        textObject.text = question;
        textObject.translation = { x: 20, y: yOffset + 20 };
        textObject.fontSize = 14;
        textObject.fill = editor.makeColorFill({ red: 0, green: 0, blue: 0, alpha: 1 });

        // Add flashcard and text into the document
        const insertionParent = editor.context.insertionParent;
        insertionParent.children.append(flashcard);
        insertionParent.children.append(textObject);

        yOffset += 200; // Space flashcards vertically
      }
    }
  };

  runtime.exposeApi(sandboxApi);
}

start();
