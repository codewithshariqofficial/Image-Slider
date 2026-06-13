const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.carousel-button--right');
const prevButton = document.querySelector('.carousel-button--left');
const dotsNav = document.querySelector('.carousel-nav');
const dots = Array.from(dotsNav.children);
const progressFill = document.querySelector('.carousel-progress-fill');
const container = document.querySelector('.carousel-container');

let slideWidth = slides[0].getBoundingClientRect().width;
const autoplayInterval = 5000; // 5 seconds
let autoplayTimer;
let progressStartTime;
let pausedTime = 0;
let isPaused = false;

// Arrange slides next to each other
const setSlidePosition = (slide, index) => {
    slide.style.left = slideWidth * index + 'px';
};

const updateSlidePositions = () => {
    slideWidth = slides[0].getBoundingClientRect().width;
    slides.forEach(setSlidePosition);
    
    // Reposition track to current slide
    const currentSlide = track.querySelector('.current-slide');
    track.style.transition = 'none';
    track.style.transform = 'translateX(-' + currentSlide.style.left + ')';
    // Force reflow
    track.offsetHeight;
    track.style.transition = '';
};

window.addEventListener('resize', updateSlidePositions);
slides.forEach(setSlidePosition);

const moveToSlide = (track, currentSlide, targetSlide) => {
    track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
    currentSlide.classList.remove('current-slide');
    targetSlide.classList.add('current-slide');
    
    resetAutoplay();
};

const updateDots = (currentDot, targetDot) => {
    currentDot.classList.remove('current-slide');
    targetDot.classList.add('current-slide');
};

const hideShowArrows = (slides, prevButton, nextButton, targetIndex) => {
    if (targetIndex === 0) {
        prevButton.classList.add('is-hidden');
        nextButton.classList.remove('is-hidden');
    } else if (targetIndex === slides.length - 1) {
        prevButton.classList.remove('is-hidden');
        nextButton.classList.add('is-hidden');
    } else {
        prevButton.classList.remove('is-hidden');
        nextButton.classList.remove('is-hidden');
    }
};

// Autoplay Logic
const startAutoplay = () => {
    progressStartTime = Date.now();
    animateProgress();
    autoplayTimer = setInterval(nextSlide, autoplayInterval);
};

const resetAutoplay = () => {
    clearInterval(autoplayTimer);
    progressFill.style.transition = 'none';
    progressFill.style.width = '0';
    // Force reflow
    progressFill.offsetHeight;
    if (!isPaused) {
        progressFill.style.transition = `width ${autoplayInterval}ms linear`;
        progressFill.style.width = '100%';
        startAutoplay();
    }
};

const animateProgress = () => {
    if (isPaused) return;
    progressFill.style.transition = `width ${autoplayInterval}ms linear`;
    progressFill.style.width = '100%';
};

const nextSlide = () => {
    const currentSlide = track.querySelector('.current-slide');
    const nextSlide = currentSlide.nextElementSibling || slides[0];
    const currentDot = dotsNav.querySelector('.current-slide');
    const nextDot = currentDot.nextElementSibling || dots[0];
    const nextIndex = slides.findIndex(slide => slide === nextSlide);

    moveToSlide(track, currentSlide, nextSlide);
    updateDots(currentDot, nextDot);
    hideShowArrows(slides, prevButton, nextButton, nextIndex);
};

const prevSlide = () => {
    const currentSlide = track.querySelector('.current-slide');
    const prevSlide = currentSlide.previousElementSibling || slides[slides.length - 1];
    const currentDot = dotsNav.querySelector('.current-slide');
    const prevDot = currentDot.previousElementSibling || dots[dots.length - 1];
    const prevIndex = slides.findIndex(slide => slide === prevSlide);

    moveToSlide(track, currentSlide, prevSlide);
    updateDots(currentDot, prevDot);
    hideShowArrows(slides, prevButton, nextButton, prevIndex);
};

// Event Listeners
nextButton.addEventListener('click', e => {
    nextSlide();
});

prevButton.addEventListener('click', e => {
    prevSlide();
});

dotsNav.addEventListener('click', e => {
    const targetDot = e.target.closest('button');
    if (!targetDot) return;

    const currentSlide = track.querySelector('.current-slide');
    const currentDot = dotsNav.querySelector('.current-slide');
    const targetIndex = dots.findIndex(dot => dot === targetDot);
    const targetSlide = slides[targetIndex];

    moveToSlide(track, currentSlide, targetSlide);
    updateDots(currentDot, targetDot);
    hideShowArrows(slides, prevButton, nextButton, targetIndex);
});

// Hover to Pause
container.addEventListener('mouseenter', () => {
    isPaused = true;
    clearInterval(autoplayTimer);
    const computedStyle = window.getComputedStyle(progressFill);
    const width = computedStyle.getPropertyValue('width');
    progressFill.style.transition = 'none';
    progressFill.style.width = width;
});

container.addEventListener('mouseleave', () => {
    isPaused = false;
    resetAutoplay();
});

// Touch Support
let touchStartX = 0;
let touchEndX = 0;

track.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

track.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

const handleSwipe = () => {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
        nextSlide();
    } else if (touchEndX > touchStartX + swipeThreshold) {
        prevSlide();
    }
};

// Keyboard Support
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
});

// Initialize
startAutoplay();
