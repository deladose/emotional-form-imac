// --- INIT & CONFIG ---
if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
window.scrollTo(0, 0);

const axis1_tag = 'AROU';
const axis2_tag = 'VALZ';

// Mobile Detection (Spart Rechenleistung auf Handys)
const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

// Mapping Helper
const map = (val, inMin, inMax, outMin, outMax) => {
    return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// ==========================================
// 1. HERO SECTION & MOUSE TRACKER (Optimized)
// ==========================================
const heroText = document.getElementById('hero-text');
const heroSection = document.getElementById('hero-section');
const cursorTracker = document.getElementById('cursor-tracker');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let currentX = mouseX;
let currentY = mouseY;
const ease = 0.1;

// Event Listener nur hinzufügen, wenn kein Touch (Spart Akku auf Mobile)
if (!isTouch) {
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (cursorTracker && heroSection) {
            const rect = heroSection.getBoundingClientRect();
            // Nur anzeigen, wenn Maus im Hero Bereich ist
            const isOverHero = (e.clientY <= rect.bottom);
            
            if (isOverHero) {
                cursorTracker.style.display = 'block';
                cursorTracker.style.left = Math.round(e.clientX) + 'px';
                cursorTracker.style.top = Math.round(e.clientY) + 'px';
            } else {
                cursorTracker.style.display = 'none';
            }
        }
    });
}

function animateHero() {
    currentX += (mouseX - currentX) * ease;
    currentY += (mouseY - currentY) * ease;

    const fontMinX = 0; const fontMaxX = 100;
    const fontMinY = 0; const fontMaxY = 100;

    const valFromX = map(currentX, 0, window.innerWidth, fontMinX, fontMaxX);
    const valFromY = map(currentY, 0, window.innerHeight, fontMaxY, fontMinY);

    if (heroText) {
        // toFixed(1) ist performanter als viele Nachkommastellen
        heroText.style.fontVariationSettings = `'${axis1_tag}' ${valFromY.toFixed(1)}, '${axis2_tag}' ${valFromX.toFixed(1)}`;
    }
    
    if (cursorTracker && !isTouch) {
        cursorTracker.innerHTML = `Arousal: ${Math.round(valFromY)}<br>Valenz: ${Math.round(valFromX)}`;
    }
    
    requestAnimationFrame(animateHero);
}
animateHero();

// ==========================================
// 2. TYPE TESTER
// ==========================================
const testerText = document.getElementById('tester-text');
const inputX = document.getElementById('axis-x');
const inputY = document.getElementById('axis-y');
const btnDecrease = document.getElementById('btn-decrease');
const btnIncrease = document.getElementById('btn-increase');
const sizeDisplay = document.getElementById('size-display'); 
let currentFontSize = 124; 

function updateTesterFont() {
    if(!testerText) return;
    testerText.style.transition = 'none';
    const valX = inputX.value;
    const valY = inputY.value;
    testerText.style.fontVariationSettings = `'${axis1_tag}' ${valX}, '${axis2_tag}' ${valY}`;
}

if(inputX && inputY) {
    inputX.addEventListener('input', updateTesterFont);
    inputY.addEventListener('input', updateTesterFont);
    // Initial call
    updateTesterFont();
}

// Font Size Controls
if(btnDecrease) btnDecrease.addEventListener('click', () => {
    currentFontSize = Math.max(12, currentFontSize - 4);
    if(testerText) {
        testerText.style.fontSize = currentFontSize + 'px';
        sizeDisplay.textContent = currentFontSize + 'px';
        // Auto-Resize Trigger
        testerText.style.height = 'auto';
        testerText.style.height = testerText.scrollHeight + 'px';
    }
});

if(btnIncrease) btnIncrease.addEventListener('click', () => {
    currentFontSize = Math.min(300, currentFontSize + 4);
    if(testerText) {
        testerText.style.fontSize = currentFontSize + 'px';
        sizeDisplay.textContent = currentFontSize + 'px';
        testerText.style.height = 'auto';
        testerText.style.height = testerText.scrollHeight + 'px';
    }
});

// Auto-Grow Textarea
if (testerText) {
    const resize = () => {
        testerText.style.height = 'auto';
        testerText.style.height = testerText.scrollHeight + 'px';
    };
    testerText.addEventListener('input', resize);
    window.addEventListener('load', resize);
}

// ==========================================
// 3. CIRCUMPLEX MAP (TOUCH + MOUSE SUPPORT)
// ==========================================
const mapContainer = document.querySelector('.circumplex-map');
const draggables = document.querySelectorAll('.type-point');

if (mapContainer && draggables.length > 0) {
    
    let activePoint = null;
    let isDown = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    // Unified Handler für Start (Maus & Touch)
    const handleStart = (e) => {
        // Welches Event ist es?
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const target = e.target.closest('.type-point');

        if (!target) return;
        
        // Verhindert Scrollen auf Touchscreens beim Ziehen
        if(e.cancelable && e.touches) e.preventDefault(); 

        if (target.classList.contains('is-editing')) return;

        isDown = true;
        activePoint = target;
        activePoint.classList.add('is-dragging');
        
        startX = clientX;
        startY = clientY;
        initialLeft = activePoint.offsetLeft;
        initialTop = activePoint.offsetTop;
    };

    // Unified Handler für Bewegen
    const handleMove = (e) => {
        if (!isDown || !activePoint) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        const rect = mapContainer.getBoundingClientRect();
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        // Prozentrechnung für Responsive Design
        let percentX = (newLeft / rect.width) * 100;
        let percentY = (newTop / rect.height) * 100;

        // Begrenzen auf 0-100%
        percentX = Math.max(0, Math.min(100, percentX));
        percentY = Math.max(0, Math.min(100, percentY));

        activePoint.style.left = percentX + '%';
        activePoint.style.top = percentY + '%';

        const valValz = Math.round(percentX);
        const valArou = Math.round(100 - percentY);
        
        const pt = activePoint.querySelector('.font-preview');
        if (pt) {
            pt.style.fontVariationSettings = `'AROU' ${valArou}, 'VALZ' ${valValz}`;
        }
    };

    // Unified Handler für Ende
    const handleEnd = () => {
        if (isDown && activePoint) {
            isDown = false;
            activePoint.classList.remove('is-dragging');
            activePoint = null;
        }
    };

    // Event Listeners (Maus)
    draggables.forEach(p => p.addEventListener('mousedown', handleStart));
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    // Event Listeners (Touch)
    draggables.forEach(p => p.addEventListener('touchstart', handleStart, {passive: false}));
    window.addEventListener('touchmove', handleMove, {passive: false});
    window.addEventListener('touchend', handleEnd);

    // Editieren per Doppelklick (Desktop)
    draggables.forEach(point => {
        const previewText = point.querySelector('.font-preview');
        point.addEventListener('dblclick', () => {
            isDown = false; activePoint = null;
            point.classList.remove('is-dragging');
            point.classList.add('is-editing');
            previewText.focus();
        });
        previewText.addEventListener('blur', () => point.classList.remove('is-editing'));
        previewText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); previewText.blur(); }
        });
    });
}

// ==========================================
// 5. LEGIBILITY MASK TOGGLE
// ==========================================
const cbMask = document.getElementById('cb-mask');
const readingMask = document.getElementById('reading-mask');

if (cbMask && readingMask) {
    cbMask.addEventListener('change', (e) => {
        if(e.target.checked) {
            readingMask.classList.add('active');
        } else {
            readingMask.classList.remove('active');
        }
    });
}

// ==========================================
// 6. GALLERY SLIDER (Arrows + Dots + AutoPlay)
// ==========================================
const track = document.querySelector('.carousel-track');
const dotsNav = document.querySelector('.carousel-nav');
const nextBtn = document.querySelector('.btn-right');
const prevBtn = document.querySelector('.btn-left');

if (track && dotsNav) {
    const slides = Array.from(track.children);
    const dots = Array.from(dotsNav.children);
    
    const refreshPositions = () => {
        const width = slides[0].getBoundingClientRect().width || window.innerWidth;
        slides.forEach((slide, index) => slide.style.left = width * index + 'px');
    };
    
    window.addEventListener('load', refreshPositions);
    window.addEventListener('resize', () => {
        refreshPositions();
        const currentSlide = track.querySelector('.current-slide');
        track.style.transition = 'none';
        track.style.transform = 'translateX(-' + currentSlide.style.left + ')';
        setTimeout(() => track.style.transition = 'transform 500ms ease-in-out', 50);
    });

    const moveToSlide = (currentSlide, targetSlide) => {
        track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
        currentSlide.classList.remove('current-slide');
        targetSlide.classList.add('current-slide');
    };
    
    const updateDots = (targetIndex) => {
        const currentDot = dotsNav.querySelector('.current-slide');
        const targetDot = dots[targetIndex];
        if(currentDot) currentDot.classList.remove('current-slide');
        if(targetDot) targetDot.classList.add('current-slide');
    };

    const handleNext = () => {
        const currentSlide = track.querySelector('.current-slide');
        const currentIndex = slides.findIndex(slide => slide === currentSlide);
        let nextIndex = currentIndex + 1;
        if (nextIndex >= slides.length) nextIndex = 0;
        moveToSlide(currentSlide, slides[nextIndex]);
        updateDots(nextIndex);
    };

    const handlePrev = () => {
        const currentSlide = track.querySelector('.current-slide');
        const currentIndex = slides.findIndex(slide => slide === currentSlide);
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = slides.length - 1;
        moveToSlide(currentSlide, slides[prevIndex]);
        updateDots(prevIndex);
    };

    let slideInterval;
    const startAutoPlay = () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(handleNext, 4000);
    };
    const resetTimer = () => {
        clearInterval(slideInterval);
        startAutoPlay();
    };

    startAutoPlay();

    if (nextBtn) nextBtn.addEventListener('click', () => { handleNext(); resetTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { handlePrev(); resetTimer(); });

    dotsNav.addEventListener('click', e => {
        const targetDot = e.target.closest('button');
        if (!targetDot) return;
        const currentSlide = track.querySelector('.current-slide');
        const targetIndex = dots.findIndex(dot => dot === targetDot);
        const targetSlide = slides[targetIndex];
        moveToSlide(currentSlide, targetSlide);
        updateDots(targetIndex);
        resetTimer();
    });
}

// ==========================================
// 8. INSTANCES GRID
// ==========================================
const instanceCards = document.querySelectorAll('.instance-card');
if (instanceCards.length > 0) {
    instanceCards.forEach(card => {
        const btn = card.querySelector('.reveal-btn');
        const preview = card.querySelector('.instance-preview');
        const targetArou = card.getAttribute('data-arou');
        const targetValz = card.getAttribute('data-valz');

        btn.addEventListener('click', () => {
            card.classList.toggle('active');
            if (card.classList.contains('active')) {
                preview.style.fontVariationSettings = `'AROU' ${targetArou}, 'VALZ' ${targetValz}`;
            } else {
                preview.style.fontVariationSettings = `'AROU' 50, 'VALZ' 50`;
            }
        });
    });
}

// ==========================================
// BONUS: VELOCITY SENSITIVE TYPING
// ==========================================
// (Wird übernommen wie im Original)
const velocityInput = document.getElementById('tester-text');
const sliderArouVal = document.getElementById('axis-x'); 
const sliderValzVal = document.getElementById('axis-y');
let lastKeyTime = Date.now();
let typingHistory = []; 
const historySize = 10; 

if (velocityInput && sliderArouVal && sliderValzVal) {
    velocityInput.addEventListener('input', () => {
        velocityInput.style.transition = 'font-variation-settings 0.4s ease-out';
        const currentTime = Date.now();
        const timeDiff = currentTime - lastKeyTime; 
        lastKeyTime = currentTime;
        if (timeDiff > 2000) { typingHistory = []; return; }
        typingHistory.push(timeDiff);
        if (typingHistory.length > historySize) { typingHistory.shift(); }
        const sum = typingHistory.reduce((a, b) => a + b, 0);
        const avgTime = sum / typingHistory.length;
        let calculatedArou = map(avgTime, 130, 350, 100, 0);
        if (calculatedArou < 0) calculatedArou = 0;
        if (calculatedArou > 100) calculatedArou = 100;
        const currentValz = sliderValzVal.value;
        velocityInput.style.fontVariationSettings = `'AROU' ${calculatedArou}, 'VALZ' ${currentValz}`;
        sliderArouVal.value = calculatedArou;
    });
}

// ==========================================
// MAGNETIC GLYPH GRID (Desktop Only)
// ==========================================
const glyphItems = document.querySelectorAll('.glyph-grid div');
if (glyphItems.length > 0 && !isTouch) {
    window.addEventListener('mousemove', (e) => {
        glyphItems.forEach(char => {
            const rect = char.getBoundingClientRect();
            // Performance: Nur berechnen wenn im Viewport
            if (rect.top > window.innerHeight || rect.bottom < 0) return;

            const charX = rect.left + rect.width / 2;
            const charY = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - charX, e.clientY - charY);
            
            let arou = 0;
            if (dist < 300) {
                arou = map(dist, 10, 300, 100, 0);
            }
            char.style.fontVariationSettings = `'AROU' ${arou}, 'VALZ' 50`;
        });
    });
}

// ==========================================
// SCREENPLAY INTERACTION
// ==========================================
const scriptBlocks = document.querySelectorAll('.script-block');
if (scriptBlocks.length > 0) {
    scriptBlocks.forEach(block => {
        const dialogue = block.querySelector('.dialogue');
        const targetArou = block.getAttribute('data-arou');
        const targetValz = block.getAttribute('data-valz');

        block.addEventListener('mouseenter', () => {
            dialogue.style.fontVariationSettings = `'AROU' ${targetArou}, 'VALZ' ${targetValz}`;
        });
        block.addEventListener('mouseleave', () => {
            dialogue.style.fontVariationSettings = `'AROU' 50, 'VALZ' 50`;
        });
    });
}

// ==========================================
// LIVE AUDIO SYNC (FLEABAG)
// ==========================================
const audioBtn = document.getElementById('btn-play-audio');
const audioFile = document.getElementById('audio-file');
const scriptPage = document.querySelector('.script-page');
const allBlocks = document.querySelectorAll('.script-block');

const timeCues = [
    { time: 3.9, index: 0 }, { time: 4.7, index: 1 }, { time: 5.8, index: 2 }, 
    { time: 6.6, index: 3 }, { time: 7.3, index: 4 }, { time: 8.2, index: 5 }, 
    { time: 9.4, index: 6 }, { time: 10.8, index: 7 }, { time: 12.6, index: 8 }, 
    { time: 14.1, index: 9 }, { time: 15.1, index: 10 }, { time: 17.6, index: 11 },
    { time: 18.8, index: 12 }, { time: 19.9, index: 13 }, { time: 21.2, index: 14 },
    { time: 21.8, index: 15 }, { time: 22.6, index: 16 }, { time: 23.5, index: 17 },
    { time: 27.3, index: 18 }, { time: 28.2, index: 19 }
];

if (audioBtn && audioFile) {
    audioBtn.addEventListener('click', () => {
        if (audioFile.paused) {
            audioFile.play();
            audioBtn.innerHTML = "■ AUDIO STOPPEN";
            audioBtn.classList.add('playing');
            scriptPage.classList.add('focus-mode'); 
        } else {
            stopAudio();
        }
    });

    audioFile.addEventListener('timeupdate', () => {
        const currentTime = audioFile.currentTime;
        let activeCue = null;
        for (let i = 0; i < timeCues.length; i++) {
            if (currentTime >= timeCues[i].time) activeCue = timeCues[i];
        }
        if (activeCue) activateBlock(activeCue.index);
    });

    audioFile.addEventListener('ended', () => stopAudio());
}

function stopAudio() {
    audioFile.pause();
    audioFile.currentTime = 0;
    resetScript();
    audioBtn.innerHTML = "▶ PLAY LIVE SCRIPT";
    audioBtn.classList.remove('playing');
    scriptPage.classList.remove('focus-mode');
}

function activateBlock(index) {
    if (allBlocks[index].classList.contains('is-active')) return;
    allBlocks.forEach(block => {
        block.classList.remove('is-active');
        const dialogue = block.querySelector('.dialogue');
        dialogue.style.fontVariationSettings = `'AROU' 50, 'VALZ' 50`;
    });
    const targetBlock = allBlocks[index];
    if (targetBlock) {
        targetBlock.classList.add('is-active');
        const dialogue = targetBlock.querySelector('.dialogue');
        const targetArou = targetBlock.getAttribute('data-arou');
        const targetValz = targetBlock.getAttribute('data-valz');
        dialogue.style.fontVariationSettings = `'AROU' ${targetArou}, 'VALZ' ${targetValz}`;
        targetBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function resetScript() {
    allBlocks.forEach(block => {
        block.classList.remove('is-active');
        const dialogue = block.querySelector('.dialogue');
        dialogue.style.fontVariationSettings = `'AROU' 50, 'VALZ' 50`;
    });
}

// ==========================================
// 9. ANIMATION LIVE DISPLAY & WORD MATCHING (Final Optimized)
// ==========================================
const breathingGlyph = document.querySelector('.breathing-glyph');
const liveArou = document.getElementById('live-arou');
const liveValz = document.getElementById('live-valz');
const tickerContainer = document.getElementById('word-ticker');
const pauseBtn = document.getElementById('btn-pause-animation');
const statusBox = document.querySelector('.animation-status-box');

// !!! HIER MUSST DU DEINE LANGE LISTE EINFÜGEN !!!
const bawlData = [
  {w: "abgelehnt", a: 65, v: 10}, {w: "abwartend", a: 22, v: 50}, {w: "aggressiv", a: 85, v: 15}, {w: "agil", a: 32.9, v: 66.7},
  {w: "aktiv", a: 56.6, v: 76.7}, {w: "alarmiert", a: 80, v: 35}, {w: "allein", a: 36.2, v: 20}, {w: "alleingelassen", a: 35, v: 15},
  {w: "altklug", a: 30.3, v: 31.7}, {w: "ambivalent", a: 38, v: 50}, {w: "angekommen", a: 24, v: 84}, {w: "angenommen", a: 40, v: 90},
  {w: "angeregt", a: 61.8, v: 71.7}, {w: "angespannt", a: 60, v: 30}, {w: "angst", a: 84.5, v: 6.7}, {w: "anmutig", a: 33.3, v: 81.7},
  {w: "apathisch", a: 5, v: 25}, {w: "arg", a: 38.2, v: 30}, 
  {w: "asozial", a: 38.2, v: 10}, {w: "aufgebracht", a: 80, v: 18}, {w: "aufgewühlt", a: 70, v: 45}, {w: "ausgeglichen", a: 22, v: 83},
  {w: "ausgelassen", a: 80, v: 88}, {w: "ausgeschlossen", a: 55, v: 10}, {w: "befangen", a: 40.8, v: 30}, {w: "begeistert", a: 85, v: 90},
  {w: "begnadet", a: 35.3, v: 78.3}, {w: "behaglich", a: 18, v: 80}, {w: "behutsam", a: 17.1, v: 70}, {w: "beliebt", a: 47.2, v: 90},
  {w: "bequem", a: 23.6, v: 78.3}, {w: "beschämt", a: 60, v: 15}, {w: "besorgt", a: 55, v: 28}, {w: "bitter", a: 38.2, v: 28.3},
  {w: "blutig", a: 83.8, v: 20}, {w: "bodenlos", a: 63.9, v: 23.3}, {w: "boshaft", a: 73.6, v: 18.3}, {w: "brillant", a: 54.2, v: 86.7},
  {w: "brutal", a: 88.2, v: 16.7}, {w: "bullig", a: 69.7, v: 35}, {w: "dankbar", a: 40, v: 86}, {w: "dekadent", a: 31.6, v: 16.7},
  {w: "derb", a: 40.8, v: 31.7}, {w: "diffus", a: 36.8, v: 30}, {w: "distanziert", a: 25, v: 42}, {w: "ehrlich", a: 27.8, v: 86.7},
  {w: "einsam", a: 25, v: 12}, {w: "eitel", a: 51.3, v: 31.7}, {w: "elend", a: 77.5, v: 15}, {w: "emotional flach", a: 10, v: 38},
  {w: "energiegeladen", a: 75, v: 82}, {w: "enthusiastisch", a: 78, v: 87}, {w: "entmutigt", a: 30, v: 18}, {w: "entsetzt", a: 90, v: 8},
  {w: "entspannt", a: 15, v: 82}, {w: "enttäuscht", a: 45, v: 18}, {w: "ermutigt", a: 50, v: 78}, {w: "euphorisch", a: 90, v: 92},
  {w: "feurig", a: 79, v: 65}, {w: "fraulich", a: 37.5, v: 75}, {w: "freude", a: 60.3, v: 95}, {w: "freudig", a: 48.6, v: 81.7},
  {w: "freudlos", a: 34.2, v: 13.3}, {w: "freundlich", a: 42, v: 82}, {w: "froh", a: 55, v: 92}, {w: "frustriert", a: 68, v: 22},
  {w: "fröhlich", a: 60, v: 90}, {w: "furcht", a: 85.5, v: 13.3}, {w: "geborgen", a: 20, v: 88}, {w: "gelassen", a: 18, v: 80},
  {w: "geliebt", a: 50, v: 95}, {w: "gemein", a: 72.5, v: 18.3}, {w: "genial", a: 62.5, v: 90}, {w: "gereizt", a: 70, v: 20},
  {w: "gestresst", a: 78, v: 25}, {w: "gesund", a: 15.8, v: 95}, {w: "gierig", a: 73.7, v: 25}, {w: "gleichgültig", a: 15, v: 45},
  {w: "glück", a: 48.3, v: 93.6}, {w: "grandios", a: 61.1, v: 86.7}, {w: "gratis", a: 40.3, v: 75}, {w: "grausam", a: 72.2, v: 13.3},
  {w: "gruselig", a: 68.4, v: 25}, {w: "gutartig", a: 23.6, v: 83.3}, {w: "halbtot", a: 44.7, v: 16.7}, {w: "heilfroh", a: 31.9, v: 86.7},
  {w: "heiter", a: 52, v: 85}, {w: "herzlos", a: 31.6, v: 8.3}, {w: "hilflos", a: 60, v: 13}, {w: "hoffnung", a: 40.3, v: 86.7},
  {w: "hoffnungslos", a: 20, v: 10}, {w: "hoffnungsvoll", a: 55, v: 84}, {w: "human", a: 26.2, v: 81.7}, {w: "humorlos", a: 31.6, v: 15},
  {w: "ideell", a: 36.8, v: 70}, {w: "innerlich gespalten", a: 42, v: 45}, {w: "innerlich ruhig", a: 10, v: 78}, {w: "innerlich unruhig", a: 62, v: 40},
  {w: "inspiriert", a: 70, v: 88}, {w: "intensiv", a: 72.4, v: 66.7}, {w: "intim", a: 69.7, v: 71.7}, {w: "irre", a: 69.4, v: 25},
  {w: "konzentriert", a: 48, v: 60}, {w: "kopflos", a: 52.6, v: 28.3}, {w: "korrupt", a: 60.5, v: 18.3}, {w: "kraftlos", a: 18, v: 30},
  {w: "kreativ", a: 48.6, v: 93.3}, {w: "labil", a: 51.2, v: 25}, {w: "launisch", a: 55.6, v: 18.3}, {w: "lebendig", a: 68, v: 86},
  {w: "leblos", a: 62.5, v: 11.7}, {w: "leer", a: 15, v: 20}, {w: "lernbar", a: 25, v: 71.7}, {w: "letzte", a: 54, v: 30},
  {w: "lieb", a: 29.2, v: 86.7}, {w: "liebe", a: 65.8, v: 98.3}, {w: "lieblos", a: 56.9, v: 11.7}, {w: "liquide", a: 22.4, v: 66.7},
  {w: "loyal", a: 27.6, v: 85}, {w: "lukrativ", a: 37.5, v: 78.3}, {w: "lustlos", a: 31.9, v: 25}, {w: "machtlos", a: 50, v: 16.7},
  {w: "magisch", a: 44.7, v: 70}, {w: "makaber", a: 48.7, v: 31.7}, {w: "makellos", a: 45.8, v: 75}, {w: "mausgrau", a: 18.4, v: 26.7},
  {w: "maximal", a: 39.5, v: 70}, {w: "melancholisch", a: 28, v: 28}, {w: "mickrig", a: 30.3, v: 31.7}, {w: "mies", a: 63.9, v: 16.7},
  {w: "militant", a: 65.3, v: 16.7}, {w: "missverstanden", a: 50, v: 20}, {w: "mitleid", a: 50, v: 50}, {w: "monoton", a: 21.1, v: 28.3},
  {w: "motiviert", a: 65, v: 80}, {w: "muffig", a: 18.4, v: 26.7}, {w: "munter", a: 55.3, v: 78.3}, {w: "mutig", a: 57.9, v: 86.7},
  {w: "mutlos", a: 25, v: 26.7}, {w: "nachdenklich", a: 35, v: 55}, {w: "namenlos", a: 19.7, v: 33.3}, {w: "namhaft", a: 38.2, v: 68.3},
  {w: "narbig", a: 38.2, v: 35}, {w: "negativ", a: 63.9, v: 10}, {w: "neid", a: 63.9, v: 18.3}, {w: "neidisch", a: 70.8, v: 25},
  {w: "neidlos", a: 13.2, v: 65}, {w: "nett", a: 26.4, v: 80}, {w: "niedergeschlagen", a: 30, v: 18}, {w: "niedlich", a: 19.7, v: 66.7},
  {w: "niemand", a: 21.1, v: 31.7}, {w: "nuklear", a: 75, v: 15}, {w: "nüchtern", a: 20, v: 50}, {w: "optimistisch", a: 45, v: 82},
  {w: "panik", a: 89.5, v: 20}, {w: "panisch", a: 95, v: 5}, {w: "passiv", a: 13.2, v: 31.7}, {w: "peinlich", a: 68.1, v: 25},
  {w: "perfekt", a: 54.2, v: 90}, {w: "pervers", a: 65.8, v: 15}, {w: "pfiffig", a: 36.1, v: 76.7}, {w: "planlos", a: 36.8, v: 21.7},
  {w: "planvoll", a: 28.9, v: 70}, {w: "pleite", a: 68.4, v: 18.3}, {w: "positiv", a: 40.3, v: 90}, {w: "prima", a: 39.5, v: 95},
  {w: "putzig", a: 30.3, v: 65}, {w: "rasend", a: 95, v: 10}, {w: "rastlos", a: 54.2, v: 25}, {w: "ratlos", a: 48.7, v: 30},
  {w: "reglos", a: 28.9, v: 30}, {w: "reizvoll", a: 58.3, v: 76.7}, {w: "reserviert", a: 20, v: 48}, {w: "resigniert", a: 22, v: 22},
  {w: "reue", a: 48.6, v: 51.7}, {w: "robust", a: 36.8, v: 76.7}, {w: "ruhelos", a: 39.5, v: 26.7}, {w: "ruhig", a: 12, v: 82},
  {w: "ruhmlos", a: 26.3, v: 26.7}, {w: "rutschig", a: 51.3, v: 28.3}, {w: "sachlich", a: 18, v: 52}, {w: "saftig", a: 38.2, v: 68.3},
  {w: "sanft", a: 20, v: 71.7}, {w: "sauer", a: 63.2, v: 35}, {w: "scham", a: 67.1, v: 28.3}, {w: "schaurig", a: 68.4, v: 28.3},
  {w: "schlaff", a: 32.9, v: 30}, {w: "schlapp", a: 18.4, v: 25}, {w: "schlau", a: 42.5, v: 76.7}, {w: "schlecht", a: 69.4, v: 11.7},
  {w: "schlimm", a: 66.7, v: 18.3}, {w: "schreck", a: 79.2, v: 23.3}, {w: "schuldig", a: 55, v: 12}, {w: "schwach", a: 40.3, v: 23.3},
  {w: "seekrank", a: 57.9, v: 16.7}, {w: "selbstsicher", a: 45, v: 82}, {w: "selbstzweifelnd", a: 40, v: 30}, {w: "sicher", a: 25, v: 87},
  {w: "sinnlich", a: 55.6, v: 80}, {w: "sinnvoll", a: 23.6, v: 83.3}, {w: "skeptisch", a: 35, v: 40}, {w: "sonnig", a: 34.7, v: 90},
  {w: "spannend", a: 71, v: 70}, {w: "spontan", a: 56.6, v: 73.3}, {w: "spritzig", a: 51.4, v: 76.7}, {w: "spurlos", a: 52.6, v: 33.3},
  {w: "stachlig", a: 47.4, v: 31.7}, {w: "stark", a: 64.5, v: 78.3}, {w: "stilvoll", a: 48.7, v: 73.3}, {w: "stolz", a: 60, v: 80},
  {w: "strafbar", a: 67.1, v: 21.7}, {w: "strebsam", a: 28.9, v: 65}, {w: "streng", a: 61.8, v: 30}, {w: "stur", a: 54.2, v: 25},
  {w: "super", a: 58.8, v: 91.7}, {w: "tabu", a: 63.2, v: 28.3}, {w: "tadellos", a: 36.1, v: 78.3}, {w: "taktvoll", a: 20.8, v: 81.7},
  {w: "tapfer", a: 52.6, v: 78.3}, {w: "tatendurstig", a: 72, v: 78}, {w: "taub", a: 51.5, v: 21.7}, {w: "teilnahmslos", a: 12, v: 40},
  {w: "tolerant", a: 33.3, v: 83.3}, {w: "toll", a: 51.4, v: 83.3}, {w: "topfit", a: 63.8, v: 88.3}, {w: "tot", a: 79.2, v: 8.3},
  {w: "toxisch", a: 65.8, v: 20}, {w: "tragisch", a: 70.8, v: 15}, {w: "trauer", a: 66.2, v: 15}, {w: "traurig", a: 25, v: 15},
  {w: "treu", a: 33.3, v: 86.7}, {w: "treulos", a: 35.5, v: 15}, {w: "trist", a: 41.2, v: 20}, {w: "tropisch", a: 48.7, v: 70},
  {w: "trostlos", a: 58.3, v: 15}, {w: "trotzig", a: 56.6, v: 31.7}, {w: "trunken", a: 47.2, v: 46.7}, {w: "uferlos", a: 43.4, v: 28.3},
  {w: "unbefugt", a: 51.3, v: 30}, {w: "unbequem", a: 52.8, v: 23.3}, {w: "unfair", a: 48.7, v: 16.7}, {w: "ungesund", a: 34.2, v: 21.7},
  {w: "unsicher", a: 45, v: 35}, {w: "verboten", a: 62.5, v: 21.7}, {w: "verbunden", a: 45, v: 88}, {w: "verdreht", a: 32.9, v: 33.3},
  {w: "verflixt", a: 63.2, v: 35}, {w: "verletzt", a: 58, v: 15}, {w: "verliebt", a: 82, v: 92}, {w: "verlogen", a: 63.2, v: 11.7},
  {w: "vertraut", a: 15.3, v: 81.7}, {w: "verunsichert", a: 50, v: 32}, {w: "verwaist", a: 42.1, v: 31.7}, {w: "verweint", a: 39.5, v: 23.3},
  {w: "verzweifelt", a: 80, v: 8}, {w: "vital", a: 47.5, v: 86.7}, {w: "voreilig", a: 46, v: 30}, {w: "vornehm", a: 31.6, v: 65},
  {w: "wachsam", a: 65, v: 50}, {w: "wehrlos", a: 72.2, v: 21.7}, {w: "weise", a: 27.5, v: 80}, {w: "weltfern", a: 28.9, v: 28.3},
  {w: "wertgeschätzt", a: 42, v: 88}, {w: "wertlos", a: 30, v: 8}, {w: "wertvoll", a: 35, v: 88}, {w: "wohlwollend", a: 35, v: 80},
  {w: "wortkarg", a: 15.8, v: 35}, {w: "wütend", a: 92, v: 13}, {w: "zahm", a: 9.2, v: 58.3}, {w: "zart", a: 30.6, v: 78.3},
  {w: "zerlumpt", a: 48.6, v: 18.3}, {w: "ziellos", a: 50, v: 23.3}, {w: "zorn", a: 77.9, v: 20}, {w: "zornig", a: 88, v: 12},
  {w: "zufrieden", a: 28, v: 85}, {w: "zuversichtlich", a: 48, v: 83}, {w: "zwanglos", a: 35.5, v: 68.3}, {w: "zwecklos", a: 30.3, v: 16.7},
  {w: "zögerlich", a: 40, v: 42}, {w: "ängstlich", a: 65, v: 20}, {w: "überfordert", a: 75, v: 18}, {w: "überrascht", a: 75, v: 55}
];

if (breathingGlyph && liveArou && liveValz && tickerContainer) {
    
    tickerContainer.innerHTML = '';
    
    let lastWordTime = 0;
    let isAnimationPaused = false;
    const wordUpdateInterval = 120; 
    
    // Pause Logic
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            isAnimationPaused = !isAnimationPaused;
            if (isAnimationPaused) {
                pauseBtn.innerHTML = "▶";
                if (statusBox) statusBox.classList.add('animation-paused');
                breathingGlyph.classList.add('paused'); 
            } else {
                pauseBtn.innerHTML = "❚❚";
                if (statusBox) statusBox.classList.remove('animation-paused');
                breathingGlyph.classList.remove('paused'); 
            }
        });
    }

    const updateLiveStats = (timestamp) => {
        if (isAnimationPaused) {
            requestAnimationFrame(updateLiveStats);
            return; 
        }

        const computedStyle = window.getComputedStyle(breathingGlyph).fontVariationSettings;
        let arouMatch = computedStyle.match(/["']?AROU["']?\s+([\d\.]+)/);
        let valzMatch = computedStyle.match(/["']?VALZ["']?\s+([\d\.]+)/);

        let cA = 0, cV = 0;
        if (arouMatch && arouMatch[1]) cA = parseFloat(arouMatch[1]);
        if (valzMatch && valzMatch[1]) cV = parseFloat(valzMatch[1]);

        liveArou.textContent = Math.round(cA);
        liveValz.textContent = Math.round(cV);

        if (timestamp - lastWordTime > wordUpdateInterval) {
            findAndAnimateWord(cA, cV);
            lastWordTime = timestamp;
        }

        requestAnimationFrame(updateLiveStats);
    };

    // FUZZY SEARCH LOGIK (Top 5)
    const findAndAnimateWord = (cA, cV) => {
        // Berechne Abstand für alle Wörter
        const candidates = bawlData.map(item => {
            // Optimierte Distanzberechnung (Quadriert ist schneller als Wurzel)
            const dist = (cA - item.a)**2 + (cV - item.v)**2;
            return { w: item.w, dist: dist };
        });

        // Sortieren (kleinste Distanz zuerst)
        candidates.sort((a, b) => a.dist - b.dist);

        // Nimm die Top 5
        const top5 = candidates.slice(0, 5);

        // Filter das Wort raus, das schon da steht
        const currentWord = tickerContainer.textContent.trim();
        const freshCandidates = top5.filter(c => c.w.toUpperCase() !== currentWord);

        // Fallback falls alle gleich wären
        const pool = freshCandidates.length > 0 ? freshCandidates : top5;

        // Zufälligen Gewinner ziehen
        const winner = pool[Math.floor(Math.random() * pool.length)];

        if (winner) {
            animateTicker(winner.w);
        }
    };

    // ALWAYS-UPDATE TICKER ANIMATION
    const animateTicker = (newWordText) => {
        const nextSpan = document.createElement('span');
        nextSpan.classList.add('ticker-item', 'enter');
        nextSpan.textContent = newWordText;
        tickerContainer.appendChild(nextSpan);

        requestAnimationFrame(() => {
            const currentSpan = tickerContainer.querySelector('.active');
            if (currentSpan) {
                currentSpan.classList.remove('active');
                currentSpan.classList.add('exit');
            }
            nextSpan.classList.remove('enter');
            nextSpan.classList.add('active');
        });

        setTimeout(() => {
            const oldSpans = tickerContainer.querySelectorAll('.exit');
            oldSpans.forEach(s => s.remove());
        }, 120); 
    };

    requestAnimationFrame(updateLiveStats);
}

// ==========================================
// 12. SCROLL TRIGGER (Intersection Observer - Re-Triggerable)
// ==========================================
const mapSection = document.querySelector('.circumplex-map');
const mapPoints = document.querySelectorAll('.type-point');

if (mapSection && mapPoints.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            
            // FALL 1: Map ist sichtbar (rein gescrollt)
            if (entry.isIntersecting) {
                mapPoints.forEach((point, index) => {
                    // Kleine Verzögerung für den "Wellen"-Effekt
                    point.style.animationDelay = (index * 0.1) + 's';
                    point.classList.add('animate-now');
                });
            } 
            
            // FALL 2: Map ist NICHT mehr sichtbar (raus gescrollt)
            else {
                mapPoints.forEach(point => {
                    // Klasse entfernen, damit sie beim nächsten Mal neu starten kann
                    point.classList.remove('animate-now');
                    // Delay resetten (sauberer Stil)
                    point.style.animationDelay = '0s';
                });
            }
            
            // WICHTIG: Die Zeile "observer.unobserve(mapSection)" haben wir GELÖSCHT.
            // Dadurch beobachtet er jetzt endlos weiter.
        });
    }, { 
        threshold: 0.4 // Animation startet, wenn 40% der Map zu sehen sind
    });

    observer.observe(mapSection);
}

// ==========================================
// 13. READ MORE / THEORY TOGGLE (Smart Scroll)
// ==========================================
const btnReadMore = document.getElementById('btn-toggle-info');
const theoryContainer = document.getElementById('hidden-theory-container');
const triggerSection = document.getElementById('read-more-trigger');

if (btnReadMore && theoryContainer && triggerSection) {
    
    btnReadMore.addEventListener('click', () => {
        const isOpen = theoryContainer.classList.contains('open');

        if (!isOpen) {
            // --- ÖFFNEN ---
            theoryContainer.classList.add('open');
            btnReadMore.textContent = "SCHLIESSEN";
            
            // Timeout auf 350ms erhöht (Warten bis Animation stabil ist)
            setTimeout(() => {
                // TRICK: Wir suchen die erste Überschrift im Container
                const firstHeadline = theoryContainer.querySelector('h2');
                
                if (firstHeadline) {
                    // Wir berechnen die exakte Position der Überschrift auf der Seite
                    const y = firstHeadline.getBoundingClientRect().top + window.scrollY;
                    
                    // Wir scrollen dorthin, lassen aber 80px Platz nach oben (Puffer),
                    // damit die Überschrift nicht am Bildschirmrand klebt.
                    window.scrollTo({ 
                        top: y - 80, 
                        behavior: 'smooth' 
                    });
                }
            }, 350);

        } else {
            // --- SCHLIESSEN ---
            theoryContainer.classList.remove('open');
            btnReadMore.textContent = "MEHR LESEN";
            
            // Zurück zum Trigger scrollen
            triggerSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    });
}