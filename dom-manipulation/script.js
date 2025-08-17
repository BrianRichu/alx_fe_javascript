document.addEventListener("DOMContentLoaded", () => {
  // ---- QUOTES ARRAY ----
  let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
    { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" },
  ];

  const quoteDisplay = document.getElementById("quoteDisplay");
  const newQuoteButton = document.getElementById("newQuote");

  // ---- SHOW RANDOM QUOTE ----
  function showRandomQuote() {
    const randomIndexQuote = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndexQuote];
    quoteDisplay.innerHTML = `<p><strong>Quote:</strong> ${randomQuote.text}</p><p><em>Category:</em> ${randomQuote.category}</p>`;
    sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote)); // session storage
  }

  // ---- SAVE QUOTES TO LOCAL STORAGE ----
  function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }

  // ---- ADD NEW QUOTE ----
  function createAddQuoteForm() {
    const newQouteText = document.getElementById("newQouteText").value.trim();
    const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

    if (newQouteText !== "" && newQuoteCategory !== "") {
      const newQuote = { text: newQouteText, category: newQuoteCategory };
      quotes.push(newQuote);
      saveQuotes();
      syncQuoteToServer(newQuote); // send new quote to server
    }
  }

  // ---- CREATE FORM ----
  function createForm() {
    let form = document.getElementById("form-container");

    let inputText = document.createElement("input");
    inputText.id = "newQouteText";
    inputText.type = "text";
    inputText.placeholder = "Enter a new quote";
    form.appendChild(inputText);

    let newCategory = document.createElement("input");
    newCategory.id = "newQuoteCategory";
    newCategory.type = "text";
    newCategory.placeholder = "Enter quote category";
    form.appendChild(newCategory);

    let addQuoteButton = document.createElement("button");
    addQuoteButton.textContent = "Add Quote";
    addQuoteButton.onclick = createAddQuoteForm;
    form.appendChild(addQuoteButton);
  }

  // ---- EXPORT QUOTES ----
  function exportQuotes() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- IMPORT QUOTES ----
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      alert("Quotes imported successfully!");
    };
    fileReader.readAsText(event.target.files[0]);
  }

  // ---- FETCH QUOTES FROM SERVER (GET) ----
  async function fetchQuotesFromServer() {
    try {
      let response = await fetch("https://jsonplaceholder.typicode.com/posts");
      let data = await response.json();
      console.log("Fetched from server:", data.slice(0, 3)); // just show first 3 for testing
    } catch (error) {
      console.error("Error fetching from server:", error);
    }
  }

  // ---- SYNC NEW QUOTE TO SERVER (POST) ----
  async function syncQuoteToServer(quote) {
    try {
      let response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote),
      });
      let data = await response.json();
      console.log("Synced to server:", data);
    } catch (error) {
      console.error("Error syncing to server:", error);
    }
  }

  // ---- FULL SYNC (FETCH + PUSH ALL) ----
  async function syncQuotes() {
    await fetchQuotesFromServer();
    for (let q of quotes) {
      await syncQuoteToServer(q);
    }
    console.log("✅ Sync complete (local ↔ server)");
  }

  // ---- EVENT LISTENERS ----
  newQuoteButton.addEventListener("click", showRandomQuote);
  document.getElementById("exportQuotes").addEventListener("click", exportQuotes);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
  document.getElementById("syncQuotesBtn").addEventListener("click", syncQuotes);

  createForm();

  // ---- AUTO-SYNC EVERY 30 SECONDS ----
  setInterval(syncQuotes, 30000);
});
