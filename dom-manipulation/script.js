document.addEventListener("DOMContentLoaded",()=>{

  // create an array of quotes (load from localStorage if available)
  let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The best way to get started is to quit talking and begin doing.", 
      category: "Motivation" 
    },
    { text: "Don’t let yesterday take up too much of today.", 
      category: "Inspiration" 
    },
    { text: "It’s not whether you get knocked down, it’s whether you get up.", 
      category: "Perseverance" 
    }
  ];

  const quoteDisplay= document.getElementById('quoteDisplay');
  const newQuoteButton = document.getElementById('newQuote');

  // function that selects a random quote and displays when button is clicked
  function showRandomQuote() {
    const randomIndexQuote = Math.floor(Math.random()*quotes.length);
    const randomQuote = quotes[randomIndexQuote];
    quoteDisplay.innerHTML = `<p><strong>Quote:</strong> ${randomQuote.text} </p><p><em> Category: </em> ${randomQuote.category}</p>`;

    // save last shown quote in sessionStorage
    sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
  }

  // function to allow users to add their quotes
  function createAddQuoteForm(){
    const newQouteText = document.getElementById('newQouteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCatergory').value.trim();

    if (newQouteText !== "" && newQuoteCategory !== "") {
      quotes.push({text : newQouteText , category : newQuoteCategory});
      localStorage.setItem("quotes", JSON.stringify(quotes)); // save updated list

      document.getElementById('newQouteText').value = "";
      document.getElementById('newQuoteCatergory').value = "";
      alert("Quote added!");
    } else {
      alert("Please enter both a quote and a category.");
    }
  }

  // export quotes as JSON file
  function exportQuotes() {
    const data = JSON.stringify(quotes);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  // import quotes from JSON file
  function importQuotes(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          quotes.push(...imported);
          localStorage.setItem("quotes", JSON.stringify(quotes));
          alert("Quotes imported successfully!");
        } else {
          alert("Invalid JSON file.");
        }
      } catch {
        alert("Error reading file.");
      }
    };
    reader.readAsText(file);
  }

  // create a form dynamically
  function createForm(){
    let form = document.getElementById('form-container');

    // new quote field
    let inputText = document.createElement('input');
    inputText.id= "newQouteText";
    inputText.type = "text";
    inputText.placeholder = "Enter a new quote";
    form.appendChild(inputText);

    form.appendChild(document.createElement("br"));

    // new category field
    let newCategory = document.createElement('input');
    newCategory.id = "newQuoteCatergory";
    newCategory.type = "text";
    newCategory.placeholder = "Enter quote category";
    form.appendChild(newCategory);

    form.appendChild(document.createElement("br"));

    // add quote button
    let addQuoteButton = document.createElement('button');
    addQuoteButton.textContent = "Add Quote";
    addQuoteButton.onclick = createAddQuoteForm;
    form.appendChild(addQuoteButton);

    form.appendChild(document.createElement("br"));

    // export button
    let exportBtn = document.createElement("button");
    exportBtn.textContent = "Export Quotes";
    exportBtn.onclick = exportQuotes;
    form.appendChild(exportBtn);

    form.appendChild(document.createElement("br"));

    // import file input
    let importInput = document.createElement("input");
    importInput.type = "file";
    importInput.accept = ".json";
    importInput.onchange = importQuotes;
    form.appendChild(importInput);
  }

  newQuoteButton.addEventListener('click',showRandomQuote);
  createForm();

  // restore last shown quote if it exists
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const q = JSON.parse(lastQuote);
    quoteDisplay.innerHTML = `<p><strong>Quote:</strong> ${q.text} </p><p><em> Category: </em> ${q.category}</p>`;
  }
});
