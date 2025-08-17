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
    sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
  }

  // Add a new quote
  function createAddQuoteForm() {
    const newQouteText = document.getElementById('newQouteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (newQouteText !== "" && newQuoteCategory !== "") {
      const newQuoteObj = { text: newQouteText, category: newQuoteCategory };
      quotes.push(newQuoteObj);
      saveQuotes();
      alert("Quote added!");

      // ---- ALSO sync new quote to server ----
      syncQuoteToServer(newQuoteObj);
    }
  }

  // Create form dynamically
  function createForm() {
    let inputText = document.createElement('input');
    inputText.id = "newQouteText";
    inputText.type = "text";
    inputText.placeholder = "Enter a new quote";
    formContainer.appendChild(inputText);

    let newCategory = document.createElement('input');
    newCategory.id = "newQuoteCategory";
    newCategory.type = "text";
    newCategory.placeholder = "Enter quote category";
    formContainer.appendChild(newCategory);

    let addQuoteButton = document.createElement('button');
    addQuoteButton.textContent = "Add Quote";
    addQuoteButton.onclick = createAddQuoteForm;
    formContainer.appendChild(addQuoteButton);
  }

  // -------- SERVER SYNCING --------
  async function fetchQuotesFromServer() {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
      const serverData = await response.json();

      const serverQuotes = serverData.map(item => ({
        text: item.title,
        category: "Server"
      }));

      quotes = [...quotes, ...serverQuotes];
      saveQuotes();

      console.log("Quotes synced from server:", serverQuotes);
    } catch (error) {
      console.error("Error fetching from server:", error);
    }
  }

  // ---- POST new quote to server ----
  async function syncQuoteToServer(quoteObj) {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(quoteObj)
      });

      const result = await response.json();
      console.log("Quote sent to server:", result);
    } catch (error) {
      console.error("Error syncing to server:", error);
    }
  }

  // Periodic fetch every 30s
  setInterval(fetchQuotesFromServer, 30000);

  // -------- EVENTS --------
  newQuoteButton.addEventListener('click', showRandomQuote);
  createForm();

  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const parsedQuote = JSON.parse(lastQuote);
    quoteDisplay.innerHTML = `<p><strong>Quote:</strong> ${parsedQuote.text}</p>
                              <p><em>Category:</em> ${parsedQuote.category}</p>`;
  }
});
