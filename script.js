import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase, ref, push, set, serverTimestamp, onValue } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

const firebaseConfig = window.FIREBASE_CONFIG;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    // 0. Confetti Animation
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    let pieces = [];
    const numberOfPieces = 150;
    const colors = ['#D4AF37', '#2C3E50', '#8E9AAF', '#FAF9F6', '#E5E5E5'];

    function setupCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Piece {
        constructor(side) {
            this.x = side === 'left' ? 0 : canvas.width;
            this.y = canvas.height;
            this.size = Math.random() * 8 + 4;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            
            // Launch direction and speed
            const angle = side === 'left' ? 
                          (Math.random() * -45 - 20) * (Math.PI / 180) : 
                          (Math.random() * -45 - 115) * (Math.PI / 180);
            const speed = Math.random() * 15 + 10;
            
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.gravity = 0.2;
            this.opacity = 1;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.rotation += this.rotationSpeed;
            this.opacity -= 0.005;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * (Math.PI / 180));
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }

    function initConfetti() {
        for (let i = 0; i < numberOfPieces / 2; i++) {
            pieces.push(new Piece('left'));
            pieces.push(new Piece('right'));
        }
    }

    let isAnimating = false;
    function animate() {
        isAnimating = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces = pieces.filter(p => p.opacity > 0);
        pieces.forEach(p => {
            p.update();
            p.draw();
        });
        if (pieces.length > 0) {
            requestAnimationFrame(animate);
        } else {
            isAnimating = false;
        }
    }

    function startConfetti() {
        initConfetti();
        if (!isAnimating) {
            animate();
        }
    }

    window.addEventListener('resize', setupCanvas);
    setupCanvas();
    startConfetti();

    // Confetti Trigger
    const confettiTrigger = document.getElementById('confetti-trigger');
    if (confettiTrigger) {
        confettiTrigger.addEventListener('click', () => {
            startConfetti();
        });
    }

    // 1. Countdown Timer
    const targetDate = new Date('April 16, 2026 19:30:00').getTime();

    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.getElementById('timer').innerHTML = "PARTY TIME!";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    };

    setInterval(updateTimer, 1000);
    updateTimer();

    // 2. Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // 3. Form Submissions (Firebase Realtime Database)
    const rsvpForm = document.getElementById('rsvp-form');
    const recommendForm = document.getElementById('recommend-form');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = rsvpForm.querySelector('button');
            const originalBtnText = submitBtn.innerText;
            
            const formData = new FormData(rsvpForm);
            const rsvpData = {
                name: formData.get('name'),
                attendance: formData.get('attendance'),
                timestamp: serverTimestamp()
            };

            try {
                submitBtn.innerText = "제출 중...";
                submitBtn.disabled = true;
                
                const rsvpRef = ref(db, 'rsvp');
                const newRsvpRef = push(rsvpRef);
                await set(newRsvpRef, rsvpData);
                
                alert(`${rsvpData.name}님, 참석 여부가 성공적으로 제출되었습니다!`);
                rsvpForm.reset();
            } catch (error) {
                console.error("Error saving to database: ", error);
                alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    if (recommendForm) {
        recommendForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = recommendForm.querySelector('button');
            const originalBtnText = submitBtn.innerText;
            
            const formData = new FormData(recommendForm);
            const recommendData = {
                restaurant: formData.get('restaurant'),
                url: formData.get('url'),
                timestamp: serverTimestamp()
            };

            try {
                submitBtn.innerText = "추천 중...";
                submitBtn.disabled = true;

                const recommendRef = ref(db, 'recommendations');
                const newRecommendRef = push(recommendRef);
                await set(newRecommendRef, recommendData);
                
                alert(`식당 '${recommendData.restaurant}' 추천이 제출되었습니다. 감사합니다!`);
                recommendForm.reset();
            } catch (error) {
                console.error("Error saving to database: ", error);
                alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // 4. Fetch Records (Guest List & Recommendations)
    const guestListElement = document.getElementById('guest-list');
    const recommendListElement = document.getElementById('recommend-list');

    // Guest List
    if (guestListElement) {
        const rsvpRef = ref(db, 'rsvp');
        onValue(rsvpRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                guestListElement.innerHTML = '<p class="no-data">아직 참석 등록이 없습니다.</p>';
                return;
            }

            const guests = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
            guestListElement.innerHTML = '';
            guests.forEach(guest => {
                const guestItem = document.createElement('div');
                guestItem.className = 'guest-item';
                let attendanceClass = guest.attendance === '참여' ? 'status-yes' : guest.attendance === '불참' ? 'status-no' : 'status-maybe';
                guestItem.innerHTML = `<span class="guest-name">${guest.name}</span><span class="guest-status ${attendanceClass}">${guest.attendance}</span>`;
                guestListElement.appendChild(guestItem);
            });
        });
    }

    // Recommendations
    if (recommendListElement) {
        const recommendRef = ref(db, 'recommendations');
        onValue(recommendRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                recommendListElement.innerHTML = '<p class="no-data">아직 추천된 식당이 없습니다.</p>';
                return;
            }

            const recommendations = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
            recommendListElement.innerHTML = '';
            recommendations.forEach(item => {
                const itemElement = document.createElement('a');
                itemElement.className = 'recommend-item';
                itemElement.href = item.url;
                itemElement.target = '_blank';
                itemElement.innerHTML = `
                    <span class="recommend-name">${item.restaurant}</span>
                    <span class="recommend-link">지도 보기 🔗</span>
                `;
                recommendListElement.appendChild(itemElement);
            });
        });
    }
});
