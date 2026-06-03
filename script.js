document.addEventListener('DOMContentLoaded', () => {
    
    // --- INTRO SCROLL LOGIC ---
    const introContainer = document.getElementById('introContainer');
    const scrollCanvas = document.getElementById('scrollCanvas');
    const introContext = scrollCanvas.getContext('2d');
    const aniverseContent = document.getElementById('aniverse-content');
    const introFade = document.getElementById('introFade');
    const introIndicator = document.getElementById('introIndicator');

    scrollCanvas.width = window.innerWidth;
    scrollCanvas.height = window.innerHeight;

    const frameCount = 137;
    const currentFrame = index => `./naruto/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`;

    const images = [];
    let imagesLoaded = 0;
    
    const drawCover = (img) => {
        const canvasRatio = scrollCanvas.width / scrollCanvas.height;
        const imgRatio = img.width / img.height;
        let renderWidth, renderHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            renderWidth = scrollCanvas.width;
            renderHeight = scrollCanvas.width / imgRatio;
            offsetX = 0;
            offsetY = (scrollCanvas.height - renderHeight) / 2;
        } else {
            renderWidth = scrollCanvas.height * imgRatio;
            renderHeight = scrollCanvas.height;
            offsetX = (scrollCanvas.width - renderWidth) / 2;
            offsetY = 0;
        }
        
        introContext.fillStyle = '#050505';
        introContext.fillRect(0, 0, scrollCanvas.width, scrollCanvas.height);
        introContext.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    };

    const preloadImages = () => {
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            images.push(img);
        }
    };

    const img = new Image();
    img.src = currentFrame(0);
    img.onload = function() {
        drawCover(img);
    };

    preloadImages();

    const updateImage = index => {
        if(images[index] && images[index].complete) {
            drawCover(images[index]);
        }
    };

    let aniverseRevealed = false;

    window.addEventListener('scroll', () => {  
        // Only do scroll logic if intro is not fully bypassed
        const scrollTop = document.documentElement.scrollTop;
        const introHeight = introContainer.offsetHeight - window.innerHeight;
        
        if (scrollTop < introHeight) {
            // We are in the intro phase
            const scrollFraction = scrollTop / introHeight;
            const frameIndex = Math.min(
                frameCount - 1,
                Math.max(0, Math.ceil(scrollFraction * frameCount))
            );
            
            requestAnimationFrame(() => updateImage(frameIndex));
            
            // Handle fade overlay to transition smoothly
            if (scrollFraction > 0.8) {
                const fadeOpacity = (scrollFraction - 0.8) * 5; // 0 to 1
                introFade.style.opacity = fadeOpacity;
                introIndicator.style.opacity = 1 - fadeOpacity;
            } else {
                introFade.style.opacity = 0;
                introIndicator.style.opacity = 1;
            }
        } else if (!aniverseRevealed && scrollTop >= introHeight) {
            // Transition from intro to AniVerse
            aniverseRevealed = true;
            aniverseContent.classList.remove('hidden');
            
            // Scroll to the top of the AniVerse content smoothly
            // or just snap to the top of it
            setTimeout(() => {
                aniverseContent.style.opacity = '1';
                initAniVerse();
                // Ensure particles are scaled properly after display:none is removed
                const particleCanvas = document.getElementById('particleCanvas');
                particleCanvas.width = window.innerWidth;
                particleCanvas.height = window.innerHeight;
            }, 100);
        }
    });

    window.addEventListener('resize', () => {
        if (!aniverseRevealed) {
            scrollCanvas.width = window.innerWidth;
            scrollCanvas.height = window.innerHeight;
            drawCover(images[0] || img);
        } else {
            const particleCanvas = document.getElementById('particleCanvas');
            if(particleCanvas) {
                particleCanvas.width = window.innerWidth;
                particleCanvas.height = window.innerHeight;
            }
        }
    });

    // --- ANIVERSE LOGIC ---
    function initAniVerse() {
        // Parallax Effect for Hero Graphics
        const parallaxElements = document.querySelectorAll('.parallax');
        
        window.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;

            parallaxElements.forEach(el => {
                const speed = el.getAttribute('data-speed');
                el.style.transform = `translateX(${x * speed * 100}px) translateY(${y * speed * 100}px) rotate(${el.classList.contains('character-center') ? 5 : (el.classList.contains('character-left') ? -10 : 15)}deg)`;
            });
        });

        // Intersection Observer for scroll animations
        const modules = document.querySelectorAll('.module, .glass-panel');
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        modules.forEach(module => {
            module.style.opacity = '0';
            module.style.transform = 'translateY(30px)';
            module.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out, border-color 0.3s ease';
            observer.observe(module);
        });

        // Particle Background System (Canvas)
        const canvas = document.getElementById('particleCanvas');
        const ctx = canvas.getContext('2d');
        
        let particlesArray = [];

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                const colors = ['#FFF9F6', '#F7C59F', '#F28C9D', '#9B5DE5'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.size > 0.2) this.size -= 0.01;
                
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particlesArray = [];
            for (let i = 0; i < 100; i++) {
                particlesArray.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
                if (particlesArray[i].size <= 0.2) {
                    particlesArray[i] = new Particle();
                }
            }
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();
    }
});
