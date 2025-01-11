// Replace with your API key and spreadsheet ID
const apiKey = "AIzaSyASTIrHzZTlsgRbg_37IOlLv7Hh2nO71IA";
const spreadsheetId = "1pLNRqdH0jJhCc4GLr_y5TEOla81ocVW4hVvifRg9KyE";

// Define the cells and their corresponding span IDs
const cellData = [
  { cellRange: "A2", spanId: "cellA2" },
  { cellRange: "B2", spanId: "cellB2" },
  { cellRange: "C2", spanId: "cellC2" },
  { cellRange: "A4", spanId: "cellA4" },
  { cellRange: "B4", spanId: "cellB4" },
  { cellRange: "C4", spanId: "cellC4" },
  { cellRange: "A5", spanId: "cellA5" },
  { cellRange: "B5", spanId: "cellB5" },
  { cellRange: "C5", spanId: "cellC5" },
  { cellRange: "A6", spanId: "cellA6" },
  { cellRange: "B6", spanId: "cellB6" },
  { cellRange: "C6", spanId: "cellC6" },
  { cellRange: "A7", spanId: "cellA7" },
  { cellRange: "B7", spanId: "cellB7" },
  { cellRange: "C7", spanId: "cellC7" },
  { cellRange: "A8", spanId: "cellA8" },
  { cellRange: "B8", spanId: "cellB8" },
  { cellRange: "C8", spanId: "cellC8" },

];

// Function to fetch and display data for a single cell
function fetchAndDisplayCell(cellData) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${cellData.cellRange}?key=${apiKey}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const cellValue = data.values[0][0];
      const targetElement = document.getElementById(cellData.spanId);
      targetElement.textContent = cellValue;
    })
    .catch(error => {
      console.error(`Error fetching data for ${cellData.cellRange}:`, error);
    });
}

// Fetch and display data for each cell
cellData.forEach(fetchAndDisplayCell);

