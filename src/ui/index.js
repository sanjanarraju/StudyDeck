import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

addOnUISdk.ready.then(async () => {
  console.log("addOnUISdk is ready for use.");

  const { runtime } = addOnUISdk.instance;
  const sandboxProxy = await runtime.apiProxy("documentSandbox");
  console.log("sandboxProxy ready:", sandboxProxy);

  const generateButton = document.getElementById("generateFlashcards");

  generateButton.addEventListener("click", async () => {
    const notes = document.getElementById("notesInput").value;
    console.log("Button clicked, notes:", notes);
    try {
      await sandboxProxy.generateFlashcards(notes);
      console.log("generateFlashcards called");
    } catch (e) {
      console.error("Error calling generateFlashcards:", e);
      alert("An error occurred: " + e.message);
    }
  });

  generateButton.disabled = false;
}).catch(e => {
  console.error("addOnUISdk failed to initialize:", e);
  alert("Failed to load Adobe Add-on SDK.");
});
