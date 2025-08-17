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

  // --- Step 3: server simulation config ---
  const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock API

  // Save quotes to localStorage
  function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }

  // --- Step 2 (from previous task): Categories ---
  function populateCategories() {
    if (!categoryFilter) return; // guard if element missing
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

    const categories = [...new Set(quotes.map(q => q.category))];
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });

    const savedCategory = localStorage.getItem("selectedCategory");
    if (savedCategory) {
      categoryFilter.value = savedCategory;
    }
  }

  function filterQuotes() {
    if (!categoryFilter) return;
    localStorage.setItem("selectedCategory", categoryFilter.value);
    showRandomQuote(); // keep simple: show a random from filtered set
  }

  // Function that selects a random quote and displays it (filter-aware)
  function showRandomQuote() {
    let list = quotes;
    if (categoryFilter && categoryFilter.value !== "all") {
      list = quotes.filter(q => q.category === categoryFilter.value);
    }

    if (list.length === 0) {
      quoteDisplay.innerHTML = `<p>No quotes available in this category.</p>`;
      return;
    }

    const randomIndexQuote = Math.floor(Math.random() * list.length);
    const randomQuote = list[randomIndexQuote];

    quoteDisplay.innerHTML =
      `<p><strong>Quote:</strong> ${randomQuote.text}</p>
       <p><em>Category:</em> ${randomQuote.category}</p>`;

    // optional: remember last viewed quote for this tab
    sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
  }

  // Function to allow users to add their quotes (kept same name/ids as you used)
  function createAddQuoteForm() {
    const newQouteText = document.getElementById('newQouteText').value.trim();
    const newQuoteCatergory = document.getElementById('newQuoteCatergory').value.trim();

    if (newQouteText !== "" && newQuoteCatergory !== "") {
      // add id + timestamp to help merge (does not break your structure)
      quotes.push({
        text: newQouteText,
        category: newQuoteCatergory,
        id: "loc_" + Date.now(),
        updatedAt: Date.now()
      });

      saveQuotes();
      populateCategories(); // update dropdown if new category was introduced

      // clear inputs
      document.getElementById('newQouteText').value = "";
      document.getElementById('newQuoteCatergory').value = "";

      alert("Quote added!");
    } else {
      alert("Please enter both a quote and a category.");
    }
  }

  // Create a form dynamically (kept your function + ids)
  function createForm() {
    const form = document.getElementById('form-container');

    const inputText = document.createElement('input');
    inputText.id = "newQouteText";     // keep your original id spelling
    inputText.type = "text";
    inputText.placeholder = "Enter a new quote";
    form.appendChild(inputText);

    const inputCat = document.createElement('input');
    inputCat.id = "newQuoteCatergory";  // keep your original id spelling
    inputCat.type = "text";
    inputCat.placeholder = "Enter quote category";
    form.appendChild(inputCat);

    const addQuoteButton = document.createElement('button');
    addQuoteButton.textContent = "Add Quote";
    addQuoteButton.onclick = createAddQuoteForm;
    form.appendChild(addQuoteButton);
  }

  // Export quotes to JSON file
  function exportQuotes() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import quotes from JSON file
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          // normalize imported items (ensure required fields)
          imported.forEach(item => {
            if (!item.text || !item.category) return;
            // ensure ids for future conflict checks
            if (!item.id) item.id = "loc_" + Date.now() + "_" + Math.random().toString(36).slice(2);
            if (!item.updatedAt) item.updatedAt = Date.now();
            quotes.push(item);
          });
          saveQuotes();
          populateCategories();
          showSyncMessage("Imported quotes successfully.");
        } else {
          alert("Invalid JSON format.");
        }
      } catch {
        alert("Error reading JSON file.");
      }
    };
    fileReader.readAsText(event.target.files[0]);
  }

  // --- Step 3: Sync + Conflict Resolution ---

  // Helper: show a small status message
  function showSyncMessage(msg) {
    const el = document.getElementById("syncStatus");
    if (!el) return;
    const time = new Date().toLocaleTimeString();
    el.textContent = `${msg} (${time})`;
  }

  // Map server payload -> local quote object
  function fromServer(post) {
    // jsonplaceholder posts: { id, title, body, userId }
    return {
      text: post.body,
      category: String(post.title || "Server"),
      id: "srv_" + post.id, // server-owned id
      updatedAt: Date.now()
    };
  }

  // Merge with "server-wins" policy
  function resolveConflictsAndMerge(serverQuotes) {
    let added = 0;
    let replaced = 0;

    serverQuotes.forEach(sq => {
      const idx = quotes.findIndex(q => q.id === sq.id);
      if (idx === -1) {
        quotes.push(sq);
        added++;
      } else {
        const lq = quotes[idx];
        // If different, replace with server version
        if (lq.text !== sq.text || lq.category !== sq.category) {
          quotes[idx] = sq;
          replaced++;
        }
      }
    });

    return { added, replaced };
  }

  // Fetch server quotes and merge locally
  async function syncNow() {
    showSyncMessage("Syncing...");
    try {
      // get a few posts to simulate quotes
      const res = await fetch(SERVER_URL + "?_limit=10");
      const data = await res.json(); // array of posts

      const serverQuotes = data.map(fromServer);
      const { added, replaced } = resolveConflictsAndMerge(serverQuotes);

      saveQuotes();
      populateCategories();

      if (added === 0 && replaced === 0) {
        showSyncMessage("Sync complete. No changes.");
      } else {
        showSyncMessage(`Sync complete. Added ${added}, resolved ${replaced} conflict(s).`);
      }
    } catch (e) {
      showSyncMessage("Sync failed. Server unreachable.");
    }
  }

  // Optional: auto-sync every 30 seconds
  function startAutoSync() {
    setInterval(syncNow, 30000);
  }

  // Event listeners
  newQuoteButton.addEventListener('click', showRandomQuote);
  if (exportButton) exportButton.addEventListener('click', exportQuotes);
  if (importFileInput) importFileInput.addEventListener('change', importFromJsonFile);
  if (categoryFilter) categoryFilter.addEventListener('change', filterQuotes);
  const syncBtn = document.getElementById('syncNow');
  if (syncBtn) syncBtn.addEventListener('click', syncNow);

  // Init
  createForm();
  populateCategories();

  // Restore last viewed quote (if any)
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const q = JSON.parse(last);
    quoteDisplay.innerHTML =
      `<p><strong>Quote:</strong> ${q.text}</p><p><em>Category:</em> ${q.category}</p>`;
  }

  // Start periodic sync
  startAutoSync();
});
