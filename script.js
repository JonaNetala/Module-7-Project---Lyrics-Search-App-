// Module 7 Project - Lyrics Search App 🎤 (Final Version)
// === Selects all important elements ===
const form = document.getElementById('form');
const search = document.getElementById('search');
const result = document.getElementById('result');
const more = document.getElementById('more');
const toggleSwitch = document.getElementById('theme-toggle');

const apiURL = 'https://api.lyrics.ovh';

// Loads favorites from localStorage
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// === Handles dark/light mode ===
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  toggleSwitch.checked = true;
}
toggleSwitch.addEventListener('change', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// === Saves recent search ===
function saveSearch(term) {
  if (!searchHistory.includes(term)) {
    searchHistory.unshift(term);
    if (searchHistory.length > 5) searchHistory.pop(); // Keep last 5
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }
  showHistory();
}

// === Shows recent search history ===
function showHistory() {
  const historyContainer = document.getElementById('history') || document.createElement('div');
  historyContainer.id = 'history';
  historyContainer.innerHTML = 'Recent: ' + searchHistory.join(', ');
  form.insertAdjacentElement('afterend', historyContainer);
}

// === Showing favorites ===
function showFavorites() {
  if (favorites.length === 0) {
    alert('No favorite songs yet.');
    return;
  }
  result.innerHTML = '<h2>Favorite Songs</h2><ul class="songs">' + favorites.map(song =>
    `<li><strong>${song.artist}</strong> - ${song.title}</li>`
  ).join('') + '</ul>';
  more.innerHTML = '';
}

// === Clearing favorites ===
function clearFavorites() {
  if (confirm('Are you sure you want to clear favorites?')) {
    favorites = [];
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Favorites cleared.');
  }
}

// === Searches songs by term ===
async function searchSongs(term) {
  try {
    result.innerHTML = '<p>Loading results...</p>';
    const res = await fetch(`${apiURL}/suggest/${term}`);
    const data = await res.json();
    showData(data);
    saveSearch(term);
  } catch (err) {
    result.innerHTML = '<p>Failed to search songs. Try again later.</p>';
  }
}

// === Displays fetched songs in DOM ===
function showData(data) {
  if (!data.data.length) {
    result.innerHTML = '<p>No songs found.</p>';
    more.innerHTML = '';
    return;
  }
  result.innerHTML = `<ul class="songs">
    ${data.data.map(song => `
      <li>
        <span><strong>${song.artist.name}</strong> - ${song.title}</span>
        <button class="btn" onclick="getLyrics('${song.artist.name}', '${song.title}')">Get Lyrics</button>
        <button class="small-btn" onclick="addFavorite('${song.artist.name}', '${song.title}')">⭐</button>
      </li>
    `).join('')}
  </ul>`;

  more.innerHTML = data.next ? `<button class="btn" onclick="getMoreSongs('${data.next}')">Next</button>` : '';
}

// === Adds favorite song ===
function addFavorite(artist, title) {
  if (!favorites.some(f => f.artist === artist && f.title === title)) {
    favorites.push({ artist, title });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Song added to favorites!');
  }
}

// === Gets more songs (pagination) ===
async function getMoreSongs(url) {
  try {
    // Uses encodeURIComponent to ensure the URL is properly formatted
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (data && data.data && data.data.length > 0) {
      showData(data); // Displays the next set of results
    } else {
      alert('No more results available.');
    }
  } catch (err) {
    alert('Failed to load more results. Please try again later.');
    console.error('Pagination error:', err);
  }
}

// === Gets lyrics for song ===
async function getLyrics(artist, title) {
  try {
    result.innerHTML = '<p>Loading lyrics...</p>';
    // Properly encodes artist and title to handle special characters
    const res = await fetch(`${apiURL}/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    const data = await res.json();

    if (data.error || !data.lyrics) {
      // Displays a message if lyrics are not found
      result.innerHTML = `
        <p>Sorry, lyrics not found for <strong>${title}</strong> by <strong>${artist}</strong>.</p>
        <div class="centered">
          <button class="btn small" onclick="window.location.reload()">Return Home</button>
        </div>
        <p style="margin-top: 20px;">This may be due to limitations in the lyrics database.</p>
      `;
    } else {
      // Displays the lyrics if found
      result.innerHTML = `
        <h2><strong>${artist}</strong> - ${title}</h2>
        <pre>${data.lyrics}</pre>
        <div class="centered">
          <button class="btn small" onclick="copyLyrics('${artist}', '${title}')">Share Song Title And Artist</button>
          <button class="btn small" onclick="window.location.reload()">Return Home</button>
        </div>
        <p style="margin-top: 20px;" id="suggestions">You might also like songs from <strong>${artist}</strong>.</p>
      `;

      // Fetches and displays related songs
      fetchRelatedSongs(artist);
    }
    more.innerHTML = '';
  } catch (err) {
    // Handles network or API errors
    result.innerHTML = `
      <p>Failed to load lyrics. Please check your connection or try again later.</p>
      <div class="centered">
        <button class="btn small" onclick="window.location.reload()">Return Home</button>
      </div>
    `;
  }
}

// Fetches related songs based on the artist
async function fetchRelatedSongs(artist) {
  try {
    const res = await fetch(`${apiURL}/suggest/${encodeURIComponent(artist)}`);
    const data = await res.json();

    if (data && data.data && data.data.length > 0) {
      const suggestions = data.data
        .slice(0, 5) // Limiting to 5 suggestions
        .map(song => `<li>${song.title} by ${song.artist.name}</li>`)
        .join('');
      document.getElementById('suggestions').innerHTML += `
        <ul>${suggestions}</ul>
      `;
    } else {
      document.getElementById('suggestions').innerHTML += `<p>No suggestions available.</p>`;
    }
  } catch (err) {
    console.error('Failed to fetch related songs:', err);
    document.getElementById('suggestions').innerHTML += `<p>Failed to load suggestions.</p>`;
  }
}

// === Sharing Song Info (copy to clipboard) ===
function copyLyrics(artist, title) {
  navigator.clipboard.writeText(`${artist} - ${title}`).then(() => {
    alert('Song info copied to clipboard!');
  });
}

// === Clears search history ===
function clearHistory() {
  if (confirm('Clear search history?')) {
    searchHistory = [];
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    showHistory();
  }
}

// === Sets up event listeners ===
form.addEventListener('submit', e => {
  e.preventDefault();
  const term = search.value.trim();
  if (term) {
    searchSongs(term);
  } else {
    alert('Please enter a search term.');
  }
});

// Adds event listener for "View Favorites" button
document.getElementById('view-favorites').addEventListener('click', showFavorites);
document.getElementById('clear-history').addEventListener('click', clearHistory);
document.getElementById('clear-favorites').addEventListener('click', clearFavorites);

// === Initializes on load ===
showHistory();