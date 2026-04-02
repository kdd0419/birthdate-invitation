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

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces = pieces.filter(p => p.opacity > 0);
        pieces.forEach(p => {
            p.update();
            p.draw();
        });
        if (pieces.length > 0) {
            requestAnimationFrame(animate);
        }
    }

    window.addEventListener('resize', setupCanvas);
    setupCanvas();
    initConfetti();
    animate();

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
});
