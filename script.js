// Module 7 Project - Lyrics Search App 🎤

// Selectors
const form = document.getElementById('form');
const search = document.getElementById('search');
const result = document.getElementById('result');
const more = document.getElementById('more');

// Base API URL
const apiURL = 'https://api.lyrics.ovh';

// Search by song or artist
async function searchSongs(term) {
  const res = await fetch(`${apiURL}/suggest/${term}`);
  const data = await res.json();

  showDataSafe(data);
}

// Show song and artist in the DOM (safe approach)
function showDataSafe(lyrics) {
  result.innerHTML = '';
  more.innerHTML = '';

  const ul = document.createElement('ul');
  ul.className = 'songs';

  lyrics.data.forEach((song) => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    const strong = document.createElement('strong');
    strong.textContent = song.artist.name;

    span.appendChild(strong);
    span.append(` - ${song.title}`);
    li.appendChild(span);

    const button = document.createElement('button');
    button.className = 'btn';
    button.textContent = 'Get Lyrics';
    button.dataset.artist = song.artist.name;
    button.dataset.songtitle = song.title;

    li.appendChild(button);
    ul.appendChild(li);
  });

  result.appendChild(ul);

  if (lyrics.prev || lyrics.next) {
    if (lyrics.prev) {
      const prevButton = document.createElement('button');
      prevButton.className = 'btn';
      prevButton.textContent = 'Prev';
      prevButton.addEventListener('click', () => getMoreSongs(lyrics.prev));
      more.appendChild(prevButton);
    }

    if (lyrics.next) {
      const nextButton = document.createElement('button');
      nextButton.className = 'btn';
      nextButton.textContent = 'Next';
      nextButton.addEventListener('click', () => getMoreSongs(lyrics.next));
      more.appendChild(nextButton);
    }
  }
}

// Get lyrics for song
async function getLyricsSafe(artist, songTitle) {
  const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
  const data = await res.json();

  result.innerHTML = '';
  more.innerHTML = '';

  if (data.error) {
    const errorMessage = document.createElement('p');
    errorMessage.textContent = data.error;
    result.append(errorMessage);
    return;
  }
  
  // Create heading
  const heading = document.createElement('h2');
  const strong = document.createElement('strong');
  strong.textContent = artist;
  heading.append(strong, ` - ${songTitle}`);
  result.append(heading);

  // Create lyrics block with line breaks
  const span = document.createElement('span');
  const lines = data.lyrics.split(/\r\n|\r|\n/);
  lines.forEach((line, index) => {
    span.append(line);
    if (index < lines.length - 1) {
      span.append(document.createElement('br'));
    }
  });

  result.append(span);
}

// Get more songs
async function getMoreSongs(url) {
  const res = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
  const data = await res.json();
  showDataSafe(data);
}

// Event listeners
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const searchTerm = search.value.trim();

  if (!searchTerm) {
    alert('Please type in a search term');
  } else {
    searchSongs(searchTerm);
  }
});

result.addEventListener('click', (e) => {
  const clickedEl = e.target;

  if (clickedEl.tagName === 'BUTTON') {
    const artist = clickedEl.getAttribute('data-artist');
    const songTitle = clickedEl.getAttribute('data-songtitle');
    getLyricsSafe(artist, songTitle);
  }
});
