const fs = require('fs');

// Define the file path and the original encoding
const filePath = 'titles.json';
const originalEncoding = 'iso-8859-1';

// Read the contents of the file
const fileContents = fs.readFileSync(filePath, originalEncoding);

// Convert the file contents to a new encoding
const newEncoding = 'utf-8';
const convertedContents = Buffer.from(fileContents, originalEncoding).toString(newEncoding);

// Write the converted contents back to the file
fs.writeFileSync(filePath, convertedContents, newEncoding);