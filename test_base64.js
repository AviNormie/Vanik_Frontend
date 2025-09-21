#!/usr/bin/env node

// Test script to verify base64 conversion works correctly
const fs = require('fs');

// Read the JSON response
const jsonData = JSON.parse(fs.readFileSync('test_audio_response.json', 'utf8'));

console.log('Audio data type:', jsonData.audio.type);
console.log('Audio data length:', jsonData.audio.data.length);
console.log('First 10 bytes:', jsonData.audio.data.slice(0, 10));

// Convert to Uint8Array
const uint8Array = new Uint8Array(jsonData.audio.data);
console.log('Uint8Array length:', uint8Array.length);

// Test base64 conversion
let base64String = '';
const chunkSize = 1024;

for (let i = 0; i < uint8Array.length; i += chunkSize) {
  const chunk = uint8Array.slice(i, i + chunkSize);
  let chunkString = '';
  for (let j = 0; j < chunk.length; j++) {
    chunkString += String.fromCharCode(chunk[j]);
  }
  try {
    base64String += btoa(chunkString);
  } catch (error) {
    console.error('Base64 conversion error for chunk:', error);
    // Fallback: convert each byte individually
    for (let k = 0; k < chunk.length; k++) {
      base64String += btoa(String.fromCharCode(chunk[k]));
    }
  }
}

console.log('Base64 string length:', base64String.length);
console.log('First 100 chars of base64:', base64String.substring(0, 100));

// Test if base64 is valid
try {
  const decoded = atob(base64String.substring(0, 100));
  console.log('Base64 validation: PASSED');
} catch (error) {
  console.error('Base64 validation: FAILED', error);
}

// Write to file
fs.writeFileSync('test_audio_base64.txt', base64String);
console.log('Base64 data written to test_audio_base64.txt');
