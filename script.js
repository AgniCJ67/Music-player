const video = document.getElementById('video');
const videoContainer = document.getElementById('videoContainer');
const playPauseBtn = document.getElementById('playPauseBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');
const progressSlider = document.getElementById('progressSlider');
const progressBar = document.getElementById('progressBar');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const fullscreenBtn = document.getElementById('fullscreenBtn');

const emptyState = document.getElementById('emptyState');
const videoTitleDisplay = document.getElementById('videoTitleDisplay');
const videoInfoPanel = document.getElementById('videoInfoPanel');
const speedBtn = document.getElementById('speedBtn');
const speedOptions = document.getElementById('speedOptions');

const appImportBtn = document.getElementById('appImportBtn');
const appVideoUpload = document.getElementById('appVideoUpload');
const themeSelect = document.getElementById('themeSelect');

let isScrubbing = false;
let controlsTimeout;

// --- Mobile Controls Visibility ---
function showControls() {
    videoContainer.classList.add('show-controls');
    clearTimeout(controlsTimeout);
    if (!video.paused) {
        controlsTimeout = setTimeout(() => {
            videoContainer.classList.remove('show-controls');
        }, 2500); // Hide after 2.5s of playing
    }
}
videoContainer.addEventListener('mousemove', showControls);
videoContainer.addEventListener('touchstart', showControls);
videoContainer.addEventListener('click', showControls);

// --- Video State ---
video.addEventListener('play', () => {
    videoContainer.classList.remove('paused');
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    showControls();
});

video.addEventListener('pause', () => {
    videoContainer.classList.add('paused');
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    showControls();
});

function togglePlay(e) {
    if (!video.src || videoContainer.classList.contains('no-media')) return;
    if (e.target.closest('.controls') && e.target !== playPauseBtn) return; // Don't pause if clicking other buttons
    
    if (video.paused) video.play().catch(e => console.error(e));
    else video.pause();
}
playPauseBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(e); });
video.addEventListener('click', togglePlay);

// --- Rewind & Fast Forward ---
rewindBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    video.currentTime = Math.max(0, video.currentTime - 10);
    showControls();
});

forwardBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
    showControls();
});

// --- Time and Progress ---
function formatTime(time) {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

video.addEventListener('loadedmetadata', () => { durationEl.textContent = formatTime(video.duration); });
video.addEventListener('timeupdate', () => {
    if (!isScrubbing) {
        const percent = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${percent}%`;
        progressSlider.value = percent;
        currentTimeEl.textContent = formatTime(video.currentTime);
    }
});

progressSlider.addEventListener('input', (e) => {
    if (videoContainer.classList.contains('no-media')) return;
    isScrubbing = true;
    const percent = e.target.value;
    progressBar.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime((percent / 100) * video.duration);
    showControls();
});

progressSlider.addEventListener('change', (e) => {
    if (videoContainer.classList.contains('no-media')) return;
    video.currentTime = (e.target.value / 100) * video.duration;
    isScrubbing = false;
});

// --- Popups ---
function closePopups() { speedOptions.classList.remove('active'); }
speedBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = speedOptions.classList.contains('active');
    closePopups();
    if (!isActive) speedOptions.classList.add('active');
    showControls();
});

document.querySelectorAll('#speedOptions .popup-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
        e.stopPropagation();
        video.playbackRate = opt.dataset.speed;
        speedBtn.textContent = `${opt.dataset.speed}x`;
        document.querySelector('#speedOptions .active').classList.remove('active');
        opt.classList.add('active');
        closePopups();
    });
});
document.addEventListener('click', closePopups);

fullscreenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (videoContainer.classList.contains('no-media')) return;
    if (!document.fullscreenElement) {
        if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
        else if (videoContainer.webkitRequestFullscreen) videoContainer.webkitRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
});

// --- App Sidebar & File Import ---
appImportBtn.addEventListener('click', (e) => {
    e.preventDefault();
    appVideoUpload.click();
});

appVideoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const fileURL = URL.createObjectURL(file);
        video.src = fileURL;
        video.load(); 
        
        videoContainer.classList.remove('no-media');
        if (emptyState) emptyState.style.display = 'none'; // Force hide
        
        videoInfoPanel.style.opacity = '1';
        videoInfoPanel.style.pointerEvents = 'auto';
        videoTitleDisplay.textContent = file.name.replace(/\.[^/.]+$/, "");
        progressBar.style.width = `0%`;
        progressSlider.value = 0;
        
        video.play().catch(err => console.error("Autoplay blocked:", err));
        e.target.value = ''; 
    }
});

themeSelect.addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.value);
});
