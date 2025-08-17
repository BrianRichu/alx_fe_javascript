document.addEventListener("DOMContentLoaded",()=>{
  //create an array of quotes
  const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", 
    category: "Motivation"
   },
  { text: "Don’t let yesterday take up too much of today.", 
    category: "Inspiration" 
  },
  { text: "It’s not whether you get knocked down, it’s whether you get up.",
   category: "Perseverance" 
  },
];


const quoteDisplay= document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');


//function that selects a random quote and displays when button is clicked
function showRandomQuote() {
  const randomIndexQuote = Math.floor(Math.random()*quotes.length);
  const randomQuote = quotes[randomIndexQuote];
  quoteDisplay.innerHTML = `<p><strong>Quote:</strong> ${randomQuote.text} <p><em> Category: </em> ${randomQuote.category}</p>`;

}


// function to allow users to add their quotes
function createAddQuoteForm(){
  const newQouteText = document.getElementById('newQuoteText').value.trim();
  const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

  if (newQouteText !== "" && newQuoteCategory !== "") {
    quotes.push({text : newQouteText , category : newQuoteCategory});
  
  }
  
}

//create a form dynamically
function createForm(){
  let form = document.getElementById('form-container');
  //new quote field
  let inputText = document.createElement('input');
  inputText.id= "newQouteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quoteDisplay";
  form.appendChild(inputText);

  // new category field
  let newCategory = document.createElement('input');
  newCategory.id = "newQuoteCatergory";
  newCategory.type = "text";
  newCategory.placeholder = "Enter quote category";
  form.appendChild(newCategory);

  //add quote button
  let addQuoteButton = document.createElement('button');
  addQuoteButton.textContent = "Add Quote";
  addQuoteButton.onclick = addQuoteButton;
  form.appendChild(addQuoteButton);

}

newQuoteButton.addEventListener('click',showRandomQuote);
createForm();
})