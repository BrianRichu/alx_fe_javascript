document.addEventListener("DOMContentLoaded", () => {
  // Load quotes from localStorage or defaults
  let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
    { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
  ];

  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteButton = document.getElementById('newQuote');
  const exportButton = document.getElementById('exportQuotes');
  const importFileInput = document.getElementById('importFile');
  const categoryFilter = document.getElementById('categoryFilter');

  // Save quotes to localStorage
  function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }

  // Populate unique categories in filter dropdown
  function populateCategories() {
    // Clear old options except "All"
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

    const categories = [...new Set(quotes.map(q => q.category))];
    categories.forEach(cat => {
      let option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });

    // Restore last selected category if available
    const savedCategory = localStorage.getItem("selectedCategory");
    if (savedCategory) {
      categoryFilter.value = savedCategory;
      filterQuotes(); // Apply immediately
    }
  }

  // Show random quote (based on filter if active)
  function showRandomQuote() {
    let filteredQuotes = quotes;

    if (categoryFilter.value !== "all") {
      filteredQuotes = quotes.filter(q => q.category === categoryFilter.value);
    }

    if (filteredQuotes.length === 0) {
      quoteDisplay.innerHTML = `<p>No quotes available in this category.</p>`;
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];

    quoteDisplay.innerHTML = `<p><strong>Quote:</strong> ${randomQuote.text}</p>
                              <p><em>Category:</em> ${randomQuote.category}</p>`;

    sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
  }

  // Filter quotes (used when dropdown changes)
  function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem("selectedCategory", selectedCategory);
    showRandomQuote();
  }

  // Allow users to add new quotes
  function createAddQuoteForm() {
    const newQouteText = document.getElementById('newQouteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCatergory').value.trim();

    if (newQouteText !== "" && newQuoteCategory !== "") {
      quotes.push({ text: newQouteText, category: newQuoteCategory });
      saveQuotes();
      populateCategories(); // Update categories dropdown
      alert("Quote added successfully!");
    } else {
      alert("Please enter both a quote and a category.");
    }
  }

  // Create form dynamically
  function createForm() {
    let form = document.getElementById('form-container');

    let inputText = document.createElement('input');
    inputText.id = "newQouteText";
    inputText.type = "text";
    inputText.placeholder = "Enter a new quote";
    form.appendChild(inputText);

    let newCategory = document.createElement('input');
    newCategory.id = "newQuoteCategory";
    newCategory.type = "text";
    newCategory.placeholder = "Enter quote category";
    form.appendChild(newCategory);

    let addQuoteButton = document.createElement('button');
    addQuoteButton.textContent = "Add Quote";
    addQuoteButton.onclick = createAddQuoteForm;
    form.appendChild(addQuoteButton);
  }

  // Export quotes
  function exportQuotes() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  // Import quotes
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      try {
        const importedQuotes = JSON.parse(event.target.result);
        if (Array.isArray(importedQuotes)) {
          quotes.push(...importedQuotes);
          saveQuotes();
          populateCategories();
          alert("Quotes imported successfully!");
        } else {
          alert("Invalid file format. Please upload a valid JSON file.");
        }
      } catch (err) {
        alert("Error reading file. Make sure it’s a valid JSON.");
      }
    };
    fileReader.readAsText(event.target.files[0]);
  }

  // Event listeners
  newQuoteButton.addEventListener('click', showRandomQuote);
  exportButton.addEventListener('click', exportQuotes);
  importFileInput.addEventListener('change', importFromJsonFile);
  categoryFilter.addEventListener('change', filterQuotes);

  // Initialize
  createForm();
  populateCategories();

  // Restore last viewed quote if available
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const parsedQuote = JSON.parse(lastQuote);
    quoteDisplay.innerHTML = `<p><strong>Quote:</strong> ${parsedQuote.text}</p> <p><em>Category:</em> ${parsedQuote.category}</p>`;
  }
});
