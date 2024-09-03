document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const videoContainer = document.getElementById('videoContainer');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoDate = document.getElementById('videoDate');
    const videoTitle = document.getElementById('videoTitle');
    const yearSelect = document.getElementById('yearSelect');
    const splash = document.getElementById('splash');
    const mainContent = document.getElementById('mainContent');
    const startBtn = document.getElementById('startBtn');
    const randomBtn = document.getElementById('randomBtn');
    const randomBtnMain = document.getElementById('randomBtnMain');
    const shareBtn = document.getElementById('shareBtn');
    let videos = [];
    let currentVideoIndex = 0;

    // Function to load the video list
    function loadVideoList(callback) {
        fetch('video_list.txt')
            .then(response => response.text())
            .then(data => {
                videos = data.trim().split('\n').filter(line => line.trim() !== '').map(line => {
                    const [filename, humanDate, title] = line.split('|');
                    return { filename, humanDate, title };
                });
                updateYearSelect();
                if (callback) callback();
            })
            .catch(error => console.error('Error loading the video list:', error));
    }

    // Function to update the year select
function updateYearSelect() {
    const years = [...new Set(videos.map(video => video.filename.substring(0, 4)))].sort();
    
    // Dynamically add options for years in the select, without replacing the "YEAR" option
    yearSelect.innerHTML += years.map(year => `<option value="${year}">${year}</option>`).join('');

    yearSelect.addEventListener('change', function () {
        const selectedYear = yearSelect.value;

        // Check that the user has selected a valid year (non-empty)
        if (selectedYear) {
            const index = videos.findIndex(video => video.filename.startsWith(selectedYear));
            if (index !== -1) {
                currentVideoIndex = index;
                loadVideoWithoutAnimation(videos[currentVideoIndex]);
            }
        }
    });
}


    // Function to load a specific video
    function loadVideo(video) {
        videoPlayer.src = `./${video.filename}`;
        videoPlayer.addEventListener('canplay', function() {
            videoPlayer.play().catch(error => console.error('Error playing the video:', error));
        }, { once: true });
        videoDate.textContent = video.humanDate;
        videoTitle.textContent = video.title;
    }

    // Function to load a specific video without animation
    function loadVideoWithoutAnimation(video) {
        videoPlayer.src = `./${video.filename}`;
        videoPlayer.addEventListener('canplay', function () {
            videoPlayer.play().catch(error => console.error('Error playing the video:', error));
        }, { once: true });
        videoDate.textContent = video.humanDate;
        videoTitle.textContent = video.title;
        videoContainer.classList.remove('slide-up', 'slide-down', 'slide-up-in', 'slide-down-in');
    }

    // Function to load a video with a sliding effect
    function changeVideoWithSlideEffect(video, direction) {
        const slideOutClass = direction === 'up' ? 'slide-up' : 'slide-down';
        const slideInClass = direction === 'up' ? 'slide-up-in' : 'slide-down-in';

        // Apply the slide-out animation
        videoContainer.classList.add(slideOutClass);

        // Wait for the slide-out animation to end before loading the new video
        setTimeout(() => {
            loadVideo(video);

            // Reset position for slide-in
            videoContainer.classList.remove(slideOutClass);
            videoContainer.classList.add(slideInClass);

            // Remove the slide-in class after the animation
            setTimeout(() => {
                videoContainer.classList.remove(slideInClass);
            }, 500); // Animation duration of 500ms
        }, 500); // Slide-out animation duration of 500ms
    }

    // Function to load a specific video
    function loadVideo(video) {
        videoPlayer.src = `./${video.filename}`;
        videoPlayer.addEventListener('canplay', function () {
            videoPlayer.play().catch(error => console.error('Error playing the video:', error));
        }, { once: true });
        videoDate.textContent = video.humanDate;
        videoTitle.textContent = video.title;
    }
    // Function to get the current URL with the video parameter
    function getCurrentVideoURL() {
        const video = videos[currentVideoIndex];
        return `${window.location.origin}${window.location.pathname}?video=${video.filename}`;
    }

    // Function to load a video from the URL parameter
    function handlePageLoad() {
        const urlParams = new URLSearchParams(window.location.search);
        const videoFilename = urlParams.get('video');

        if (videoFilename) {
            const video = videos.find(v => v.filename === videoFilename);
            if (video) {
                currentVideoIndex = videos.indexOf(video);
                splash.style.display = 'none';
                mainContent.style.display = 'flex';
                loadVideoWithoutAnimation(video);
                return; // Exit the function
            }
        }
    }

    // Event handling for buttons
    startBtn.addEventListener('click', function () {
        splash.classList.add('fade-out');
        mainContent.classList.add('fade-in');
        setTimeout(() => {
            splash.style.display = 'none';
            mainContent.style.display = 'flex';
            if (videos.length > 0) {
                loadVideoWithoutAnimation(videos[currentVideoIndex]);
            }
        }, 500); // Animation duration for the splash screen
    });

    // Click event on the camera image
document.getElementById('camera').addEventListener('click', function () {
    startBtn.click(); // Simulate a click on the PLAY button
});

// Add swipe on the splash to start playback
splash.addEventListener('touchstart', function (event) {
    touchStartY = event.touches[0].clientY;
});

splash.addEventListener('touchend', function (event) {
    const touchEndY = event.changedTouches[0].clientY;
    const touchDifference = touchStartY - touchEndY;

    if (Math.abs(touchDifference) > 50) { // If the swipe is significant
        startBtn.click(); // Simulate a click on the PLAY button
    }
});

//Add keyboard support

    randomBtn.addEventListener('click', function () {
        splash.classList.add('fade-out');
        mainContent.classList.add('fade-in');
        setTimeout(() => {
            splash.style.display = 'none';
            mainContent.style.display = 'flex';
            playRandomVideo();
        }, 500); // Animation duration for the splash screen
    });

    randomBtnMain.addEventListener('click', function () {
        playRandomVideo(); // Load a random video without animation
    });

    shareBtn.addEventListener('click', function() {
        const videoURL = getCurrentVideoURL();
        // Copy the URL to the clipboard
        navigator.clipboard.writeText(videoURL).then(() => {
            alert('Video URL copied to clipboard!');
        }).catch(err => {
            console.error('Error copying the URL:', err);
        });
    });

    // Function to go to the next video
    function nextVideo() {
        currentVideoIndex = (currentVideoIndex + 1) % videos.length;
        changeVideoWithSlideEffect(videos[currentVideoIndex], 'up');
    }

    // Function to go to the previous video
    function previousVideo() {
        currentVideoIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
        changeVideoWithSlideEffect(videos[currentVideoIndex], 'down');
    }

    // Function to play a random video
    function playRandomVideo() {
        const randomIndex = Math.floor(Math.random() * videos.length);
        currentVideoIndex = randomIndex;
        loadVideoWithoutAnimation(videos[currentVideoIndex], 'up');
    }

    // Handling vertical swipe limited to the mainContent element
let touchStartY = 0;

mainContent.addEventListener('touchstart', function (event) {
    touchStartY = event.touches[0].clientY;
});

mainContent.addEventListener('touchend', function (event) {
    const touchEndY = event.changedTouches[0].clientY;
    const touchDifference = touchStartY - touchEndY;

    if (Math.abs(touchDifference) > 50) { // Check that the swipe is significant
        if (touchDifference > 0) {
            nextVideo();
        } else {
            previousVideo();
        }
    }
});


    // Handling keyboard keys
document.addEventListener('keydown', function (event) {
    // Check if the splash is displayed
    if (splash.style.display !== 'none') {
        if (event.key === 'ArrowDown') {
            startBtn.click();
        } else if (event.key === 'ArrowUp') {
            startBtn.click();
        }
        
    } else {
        // If the splash is not displayed (so mainContent is visible)
        if (event.key === 'ArrowDown') {
            nextVideo();
        } else if (event.key === 'ArrowUp') {
            previousVideo();
        }
    }
});


    // Load the video list when the page is ready
    loadVideoList(handlePageLoad);
});
