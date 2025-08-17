document.addEventListener("DOMContentLoaded", () => {
  // Load quotes from localStorage or use defaults
  let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
    { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" },
  ];

  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteButton = document.getElementById('newQuote');
  const formContainer = document.getElementById('form-container');

  // Save quotes to localStorage
  function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }

  // Show random quote
  function showRandomQuote() {
    const randomIndexQuote = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndexQuote];
    quoteDisplay.innerHTML = `<p><strong>Quote:</strong> ${randomQuote.text}</p>
                              <p><em>Category:</em> ${randomQuote.category}</p>`;
    // store last viewed quote in sessionStorage
    sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
  }

  // Add a new quote
  function createAddQuoteForm() {
    const newQouteText = document.getElementById('newQouteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (newQouteText !== "" && newQuoteCategory !== "") {
      quotes.push({ text: newQouteText, category: newQuoteCategory });
      saveQuotes();
      alert("Quote added!");
    }
  }

  // Create form dynamically
  function createForm() {
    // new quote field
    let inputText = document.createElement('input');
    inputText.id = "newQouteText";
    inputText.type = "text";
    inputText.placeholder = "Enter a new quote";
    formContainer.appendChild(inputText);

    // new category field
    let newCategory = document.createElement('input');
    newCategory.id = "newQuoteCategory";
    newCategory.type = "text";
    newCategory.placeholder = "Enter quote category";
    formContainer.appendChild(newCategory);

    // add quote button
    let addQuoteButton = document.createElement('button');
    addQuoteButton.textContent = "Add Quote";
    addQuoteButton.onclick = createAddQuoteForm;
    formContainer.appendChild(addQuoteButton);
  }

  // --------- SERVER SYNCING (NEW) ----------
  // Fetch quotes from a simulated server (JSONPlaceholder)
  async function fetchQuotesFromServer() {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
      const serverData = await response.json();

      // convert server data into quote format
      const serverQuotes = serverData.map(item => ({
        text: item.title,
        category: "Server"
      }));

      // conflict resolution: server data takes precedence
      quotes = [...quotes, ...serverQuotes];
      saveQuotes();

      console.log("Quotes synced from server:", serverQuotes);
      alert("Quotes synced from server!");
    } catch (error) {
      console.error("Error fetching from server:", error);
    }
  }

  // Periodically fetch from server (every 30s)
  setInterval(fetchQuotesFromServer, 30000);

  // --------- EVENT LISTENERS ----------
  newQuoteButton.addEventListener('click', showRandomQuote);
  createForm();

  // Load last viewed quote from sessionStorage
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const parsedQuote = JSON.parse(lastQuote);
    quoteDisplay.innerHTML = `<p><strong>Quote:</strong> ${parsedQuote.text}</p>
                              <p><em>Category:</em> ${parsedQuote.category}</p>`;
  }
});
