const songs = [
    { title: "Ambient Sunset", artist: "Chill Guy", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", cover: "https://picsum.photos/id/1015/300/300", time: "6:12" },
    { title: "Midnight Drive", artist: "Synthwave", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", cover: "https://picsum.photos/id/1016/300/300", time: "7:05" },
    { title: "Morning Routine", artist: "Coffee Beatz", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", cover: "https://picsum.photos/id/1018/300/300", time: "5:44" },
    { title: "Code & Focus", artist: "LoFi Dreamer", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", cover: "https://picsum.photos/id/1020/300/300", time: "5:02" }
];

let songIndex = 0;
let isPlaying = false;

// Audio setup
const audio = document.getElementById('audio-player');

// Playbar elements
const playBtn = document.getElementById('play-btn');
const playBtnIcon = playBtn.querySelector('i');
const mainPlayBtn = document.getElementById('main-play-btn');
const mainPlayBtnIcon = mainPlayBtn.querySelector('i');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const ffBtn = document.getElementById('ff-btn');

// Speed Slider
const speedSlider = document.getElementById('speed-slider');
const speedLabel = document.getElementById('speed-label');

// Progress & Time
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');

// Volume Controls
const volumeSlider = document.getElementById('volume-slider');
const muteBtn = document.getElementById('mute-btn');
const muteBtnIcon = muteBtn.querySelector('i');
let lastVolume = 1;

// Info Elements
const title = document.getElementById('song-title');
const artist = document.getElementById('song-artist');
const cover = document.getElementById('cover');
const mainTitle = document.getElementById('main-title');
const mainArtist = document.getElementById('main-artist');
const mainCover = document.getElementById('main-cover');

const tracksContainer = document.getElementById('tracks-container');
const sidebarPlaylist = document.getElementById('playlist-container');

// Initialization
loadSong(songs[songIndex]);
renderTracks();
renderSidebar();

// Load Song
function loadSong(song) {
    title.innerText = song.title;
    artist.innerText = song.artist;
    cover.src = song.cover;
    
    mainTitle.innerText = song.title;
    mainArtist.innerText = song.artist;
    mainCover.src = song.cover;
    
    audio.src = song.src;
    audio.playbackRate = parseFloat(speedSlider.value);
    
    updateTrackListUI();
}

// Render Main Track List
function renderTracks() {
    tracksContainer.innerHTML = '';
    songs.forEach((song, index) => {
        const row = document.createElement('div');
        row.classList.add('track-row');
        row.innerHTML = `
            <div class="track-num">${index + 1}</div>
            <div class="track-info-cell">
                <img src="${song.cover}" class="track-img" alt="">
                <div>
                    <div class="track-title">${song.title}</div>
                    <div class="track-artist">${song.artist}</div>
                </div>
            </div>
            <div class="track-album">Miniify Hits</div>
            <div class="track-time">${song.time || "--:--"}</div>
        `;
        
        row.addEventListener('click', () => {
            songIndex = index;
            loadSong(songs[songIndex]);
            playSong();
        });
        
        tracksContainer.appendChild(row);
    });
    updateTrackListUI();
}

// Render Sidebar dummy playlists
function renderSidebar() {
    sidebarPlaylist.innerHTML = '';
    const playlists = ["Chill Vibes", "Coding Mix", "Workout Pump", "Lo-Fi Beats", "Top 50 Global"];
    playlists.forEach(name => {
        const li = document.createElement('li');
        li.innerText = name;
        sidebarPlaylist.appendChild(li);
    });
}

function updateTrackListUI() {
    const rows = tracksContainer.querySelectorAll('.track-row');
    rows.forEach((row, index) => {
        if(index === songIndex) {
            row.classList.add('playing');
        } else {
            row.classList.remove('playing');
        }
    });
}

// Play & Pause logic
function playSong() {
    isPlaying = true;
    playBtnIcon.classList.replace('ph-play', 'ph-pause');
    mainPlayBtnIcon.classList.replace('ph-play', 'ph-pause');
    audio.play();
}

function pauseSong() {
    isPlaying = false;
    playBtnIcon.classList.replace('ph-pause', 'ph-play');
    mainPlayBtnIcon.classList.replace('ph-pause', 'ph-play');
    audio.pause();
}

playBtn.addEventListener('click', () => isPlaying ? pauseSong() : playSong());
mainPlayBtn.addEventListener('click', () => isPlaying ? pauseSong() : playSong());

// Next / Prev
prevBtn.addEventListener('click', () => {
    songIndex = (songIndex - 1 + songs.length) % songs.length;
    loadSong(songs[songIndex]);
    playSong();
});

nextBtn.addEventListener('click', () => {
    songIndex = (songIndex + 1) % songs.length;
    loadSong(songs[songIndex]);
    playSong();
});
audio.addEventListener('ended', () => nextBtn.click());

// Fast Forward
ffBtn.addEventListener('click', () => { audio.currentTime += 10; });

// Speed Slider Event
speedSlider.addEventListener('input', (e) => {
    const currentSpeed = parseFloat(e.target.value);
    audio.playbackRate = currentSpeed;
    if(Number.isInteger(currentSpeed)) {
        speedLabel.innerText = `${currentSpeed}.0x`;
    } else {
        speedLabel.innerText = `${currentSpeed}x`;
    }
});

// Time formatting
function formatTime(time) {
    if (isNaN(time)) return "0:00";
    let mins = Math.floor(time / 60);
    let secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0'+secs : secs}`;
}

// Progress Bar Updates
audio.addEventListener('timeupdate', (e) => {
    const { duration, currentTime } = e.srcElement;
    if (duration) {
        progress.style.width = `${(currentTime / duration) * 100}%`;
        currentTimeEl.innerText = formatTime(currentTime);
        durationEl.innerText = formatTime(duration);
    }
});

progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    audio.currentTime = (clickX / width) * audio.duration;
});

// --- Volume Slider Controls ---
volumeSlider.addEventListener('input', (e) => {
    const vol = parseFloat(e.target.value);
    audio.volume = vol;
    lastVolume = vol; 
    updateVolumeIcon(vol);
});

function updateVolumeIcon(vol) {
    muteBtnIcon.className = ''; 
    if (vol === 0) {
        muteBtnIcon.classList.add('ph', 'ph-speaker-x');
    } else if (vol < 0.5) {
        muteBtnIcon.classList.add('ph', 'ph-speaker-low');
    } else {
        muteBtnIcon.classList.add('ph', 'ph-speaker-high');
    }
}

muteBtn.addEventListener('click', () => {
    if (audio.volume > 0) {
        lastVolume = audio.volume;
        audio.volume = 0;
        volumeSlider.value = 0;
    } else {
        audio.volume = lastVolume > 0 ? lastVolume : 1; 
        volumeSlider.value = audio.volume;
    }
    updateVolumeIcon(audio.volume);
});

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    if (document.body.classList.contains('light-theme')) {
        themeIcon.classList.replace('ph-moon', 'ph-sun');
    } else {
        themeIcon.classList.replace('ph-sun', 'ph-moon');
    }
});

// Navigation Tab Logic
const navHome = document.getElementById('nav-home');
const navSearch = document.getElementById('nav-search');
const navLibrary = document.getElementById('nav-library');
const viewHome = document.getElementById('view-home');
const viewSearch = document.getElementById('view-search');
const viewLibrary = document.getElementById('view-library');

function switchView(selectedNav, selectedView) {
    navHome.classList.remove('active');
    navSearch.classList.remove('active');
    navLibrary.classList.remove('active');
    
    viewHome.style.display = 'none';
    viewSearch.style.display = 'none';
    viewLibrary.style.display = 'none';
    
    selectedNav.classList.add('active');
    selectedView.style.display = 'block';
}

navHome.addEventListener('click', () => switchView(navHome, viewHome));
navSearch.addEventListener('click', () => switchView(navSearch, viewSearch));
navLibrary.addEventListener('click', () => switchView(navLibrary, viewLibrary));

// Play Local Audio File Logic
const navLocalFile = document.getElementById('nav-local-file');
const localFileInput = document.getElementById('local-file-input');

navLocalFile.addEventListener('click', () => localFileInput.click());

localFileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const fileURL = URL.createObjectURL(file);
        const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
        
        const customSong = {
            title: cleanTitle,
            artist: "Local File",
            src: fileURL,
            cover: "https://picsum.photos/id/1025/300/300",
            time: "--:--"
        };
        
        songs.push(customSong);
        songIndex = songs.length - 1;
        
        renderTracks();
        loadSong(songs[songIndex]);
        playSong();
        switchView(navHome, viewHome);
    }
});
