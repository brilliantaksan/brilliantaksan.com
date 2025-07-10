// Enhanced Modal functionality and vibrant interactions
document.addEventListener('DOMContentLoaded', function() {
        // Simple Custom Cursor
    console.log('🌞 Creating simple cursor...');
    
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;

    // Update cursor position immediately
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    // Cursor grow effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .magnetic-button, .tilt-card, .close, .dot');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('grow');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('grow');
        });
    });

    console.log('✅ Cursor created and events added');

        // Morphing Background Text Rotation Component
    class MorphingTextRotate {
        constructor(container, options = {}) {
            this.container = container;
            this.rotationInterval = options.rotationInterval || 2200;
            this.currentIndex = 0;
            this.intervalId = null;
            this.auto = options.auto !== false;
            this.isTransitioning = false;
            
            this.words = Array.from(container.querySelectorAll('.shape-word'));
            this.background = container.querySelector('.morphing-background');
            this.wordContent = container.querySelector('.word-content');
            
            // Create temporary element to measure text widths accurately
            this.measureElement = document.createElement('div');
            this.measureElement.style.cssText = `
                position: absolute;
                visibility: hidden;
                white-space: nowrap;
                font-family: 'Inter', sans-serif;
                font-weight: 800;
                font-size: ${window.getComputedStyle(this.words[0]).fontSize};
                letter-spacing: -0.02em;
                text-transform: uppercase;
            `;
            document.body.appendChild(this.measureElement);
            
            // Calculate dynamic widths for each word
            this.wordStyles = this.words.map(word => {
                this.measureElement.textContent = word.textContent;
                const measuredWidth = this.measureElement.offsetWidth;
                // Convert to em and add padding (1.6em base padding + responsive adjustment)
                const fontSize = parseFloat(window.getComputedStyle(this.words[0]).fontSize);
                let paddingFactor = 1.6;
                
                // Adjust padding based on screen size
                if (window.innerWidth <= 480) {
                    paddingFactor = 1.4;
                } else if (window.innerWidth <= 768) {
                    paddingFactor = 1.5;
                }
                
                const widthInEm = (measuredWidth / fontSize) + paddingFactor;
                
                return {
                    width: `${widthInEm.toFixed(1)}em`,
                    borderRadius: '8px',
                    bgTransform: 'rotate(0deg)',
                    textTransform: 'rotate(0deg)'
                };
            });
            
            // Clean up measurement element
            document.body.removeChild(this.measureElement);
            
            this.init();
        }

        init() {
            // Split each word into letters and wrap them
            this.words.forEach(word => {
                const text = word.textContent;
                word.innerHTML = '';
                
                [...text].forEach(char => {
                    const span = document.createElement('span');
                    span.className = 'word-letter';
                    span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space
                    word.appendChild(span);
                });
            });
            
            // Ensure background is properly positioned and sized from the start
            const initialStyle = this.wordStyles[0];
            this.background.style.width = initialStyle.width;
            this.background.style.borderRadius = initialStyle.borderRadius;
            this.background.style.transform = `translate(-50%, -50%) ${initialStyle.bgTransform}`;
            
            // Set initial state
            this.words.forEach((word, index) => {
                if (index === 0) {
                    word.classList.add('active');
                    // Apply initial text rotation
                    word.style.transform = `translate(-50%, -50%) ${this.wordStyles[0].textTransform}`;
                    // Ensure immediate visibility and centering
                    word.style.opacity = '1';
                    
                    // Start letter animation after a minimal delay to ensure DOM is ready
                    requestAnimationFrame(() => {
                        this.animateLettersIn(word, 0);
                    });
                } else {
                    word.classList.remove('active', 'exiting');
                    word.style.opacity = '0';
                }
            });
            
            // Update spacing for the initial word
            this.updateSpacing(0);
            
            if (this.auto) {
                this.start();
            }
        }

        animateLettersIn(word, delay = 0) {
            // No rollIn animation to prevent positioning conflicts - just do letter animations
            word.style.animation = 'none';
            
            const letters = word.querySelectorAll('.word-letter');
            letters.forEach((letter, index) => {
                setTimeout(() => {
                    letter.classList.add('fade-up');
                }, delay + index * 60); // 60ms stagger between letters for good pace
            });
        }

        animateLettersOut(word) {
            // Clear any existing animation
            word.style.animation = 'none';
            
            const letters = word.querySelectorAll('.word-letter');
            letters.forEach((letter, index) => {
                setTimeout(() => {
                    letter.classList.remove('fade-up');
                }, index * 45); // Staggered fade out - 45ms between each letter
            });
        }

        morphBackground(index) {
            const style = this.wordStyles[index];
            // Change background width and keep centered
            this.background.style.width = style.width;
            this.background.style.borderRadius = style.borderRadius;
            this.background.style.transform = `translate(-50%, -50%) ${style.bgTransform}`;
            
            // Update spacing
            this.updateSpacing(index);
        }

        updateSpacing(index) {
            const style = this.wordStyles[index];
            
            // Only adjust spacing on mobile (≤768px), keep desktop fixed
            if (window.innerWidth <= 768) {
                const toFeelElement = document.querySelector('.to-feel');
                const rotatingContainer = document.querySelector('.rotating-container');
                
                if (toFeelElement && rotatingContainer) {
                    const baseWidth = parseFloat(style.width);
                    
                    // Mobile-only adaptive spacing with better calculation
                    if (baseWidth >= 9.0) {
                        rotatingContainer.style.minWidth = `${baseWidth + 1.5}em`;
                        toFeelElement.style.marginRight = '0.12em';
                    } else if (baseWidth >= 7.0) {
                        rotatingContainer.style.minWidth = `${baseWidth + 1.3}em`;
                        toFeelElement.style.marginRight = '0.1em';
                    } else if (baseWidth >= 5.0) {
                        rotatingContainer.style.minWidth = `${baseWidth + 1.2}em`;
                        toFeelElement.style.marginRight = '0.08em';
                    } else {
                        rotatingContainer.style.minWidth = `${baseWidth + 1.0}em`;
                        toFeelElement.style.marginRight = '0.06em';
                    }
                }
            }
        }

        async animateWordTransition(currentWord, nextWord, nextIndex) {
            return new Promise((resolve) => {
                // Start fading out current word letters one by one
                this.animateLettersOut(currentWord);
                
                // Start exit animation for current word
                setTimeout(() => {
                    currentWord.classList.remove('active');
                    currentWord.classList.add('exiting');
                }, 100);
                
                // Set up next word positioning and morphing BEFORE starting letter animations
                setTimeout(() => {
                    // First: Set up all positioning and background
                    this.morphBackground(nextIndex);
                    nextWord.classList.add('active');
                    
                    // Apply positioning immediately to prevent jitter
                    const style = this.wordStyles[nextIndex];
                    nextWord.style.transform = `translate(-50%, -50%) ${style.textTransform}`;
                    nextWord.style.opacity = '1';
                    
                    // Then: Start letter animations after positioning is set
                    requestAnimationFrame(() => {
                        this.animateLettersIn(nextWord, 0);
                    });
                }, 150);
                
                // Clean up after animations complete
                setTimeout(() => {
                    currentWord.classList.remove('exiting');
                    currentWord.style.opacity = '0';
                    resolve();
                }, 600);
            });
        }

        async next() {
            if (this.isTransitioning) return;
            
            this.isTransitioning = true;
            const currentWord = this.words[this.currentIndex];
            
            // Calculate next index
            this.currentIndex = (this.currentIndex + 1) % this.words.length;
            const nextWord = this.words[this.currentIndex];
            
            // Animate transition
            await this.animateWordTransition(currentWord, nextWord, this.currentIndex);
            
            this.isTransitioning = false;
        }

        start() {
            this.intervalId = setInterval(() => this.next(), this.rotationInterval);
        }

        stop() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }
    }

    // Sparkles Component (vanilla JS version)
    class SparklesText {
        constructor(element, options = {}) {
            this.element = element;
            this.sparklesCount = options.sparklesCount || 8;
            this.colors = options.colors || ['#FFE55C', '#6B73FF', '#FF9500'];
            this.sparkles = [];
            this.intervalId = null;
            
            this.init();
        }

        init() {
            this.element.style.position = 'relative';
            this.element.style.display = 'inline-block';
            
            // Generate initial sparkles
            this.generateSparkles();
            this.animate();
        }

        generateSparkle() {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const delay = Math.random() * 2;
            const scale = 0.3 + Math.random() * 0.7;
            const duration = 1 + Math.random() * 2;
            
            sparkle.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 21 21">
                    <path d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z" fill="${color}"/>
                </svg>
            `;
            
            sparkle.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                pointer-events: none;
                z-index: 1;
                opacity: 0;
                transform: scale(0) rotate(0deg);
                animation: sparkle-animation ${duration}s ease-in-out infinite;
                animation-delay: ${delay}s;
            `;
            
            return sparkle;
        }

        generateSparkles() {
            for (let i = 0; i < this.sparklesCount; i++) {
                const sparkle = this.generateSparkle();
                this.element.appendChild(sparkle);
                this.sparkles.push(sparkle);
            }
        }

        animate() {
            // Regenerate sparkles periodically
            this.intervalId = setInterval(() => {
                // Remove old sparkles
                this.sparkles.forEach(sparkle => sparkle.remove());
                this.sparkles = [];
                
                // Generate new sparkles
                this.generateSparkles();
            }, 5000);
        }

        destroy() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }
            this.sparkles.forEach(sparkle => sparkle.remove());
        }
    }

    // Emergency Simple Carousel - Just Make It Work
    class EmergencyCarousel {
        constructor(container) {
            this.container = container;
            this.currentIndex = 0;
            this.intervalId = null;
            
            this.entries = Array.from(container.querySelectorAll('.journal-entry'));
            this.dots = Array.from(container.querySelectorAll('.dot'));
            
            console.log('🚨 EMERGENCY: Found', this.entries.length, 'entries');
            
            if (this.entries.length === 0) {
                console.error('❌ No entries found!');
                return;
            }
            
            this.forceVisible();
            this.addNavigationArrows();
            this.setupDotClicks();
            this.startRotation();
        }

        forceVisible() {
            console.log('🔧 FORCING CARDS VISIBLE...');
            
            // Hide all cards first
            this.entries.forEach((entry, index) => {
                entry.style.cssText = `
                    position: absolute !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    display: none !important;
                    opacity: 0 !important;
                    z-index: 1 !important;
                `;
            });
            
            // Show only the first card
            if (this.entries[0]) {
                this.entries[0].style.cssText = `
                    position: absolute !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    display: block !important;
                    opacity: 1 !important;
                    z-index: 10 !important;
                `;
                
                console.log('✅ First card forced visible');
            }
            
            this.updateDots();
        }

        showCard(index) {
            console.log(`🎯 Showing card ${index}`);
            
            // Hide all cards
            this.entries.forEach(entry => {
                entry.style.display = 'none';
                entry.style.opacity = '0';
                entry.style.zIndex = '1';
            });
            
            // Show target card
            if (this.entries[index]) {
                this.entries[index].style.display = 'block';
                this.entries[index].style.opacity = '1';
                this.entries[index].style.zIndex = '10';
            }
            
            this.currentIndex = index;
            this.updateDots();
        }

        updateDots() {
            this.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
            });
        }

        next() {
            const nextIndex = (this.currentIndex + 1) % this.entries.length;
            this.showCard(nextIndex);
        }

        previous() {
            const prevIndex = (this.currentIndex - 1 + this.entries.length) % this.entries.length;
            this.showCard(prevIndex);
        }

        goToCard(index) {
            if (index !== this.currentIndex) {
                this.showCard(index);
                this.restartRotation();
            }
        }

        addNavigationArrows() {
            // Create navigation container
            const navContainer = document.createElement('div');
            navContainer.className = 'carousel-navigation';
            
            // Previous button
            const prevBtn = document.createElement('button');
            prevBtn.className = 'carousel-btn carousel-prev';
            prevBtn.innerHTML = '←';
            prevBtn.setAttribute('aria-label', 'Previous card');
            prevBtn.onclick = () => {
                console.log('⬅️ Previous button clicked');
                this.previous();
                this.restartRotation();
            };
            
            // Next button
            const nextBtn = document.createElement('button');
            nextBtn.className = 'carousel-btn carousel-next';
            nextBtn.innerHTML = '→';
            nextBtn.setAttribute('aria-label', 'Next card');
            nextBtn.onclick = () => {
                console.log('➡️ Next button clicked');
                this.next();
                this.restartRotation();
            };
            
            navContainer.appendChild(prevBtn);
            navContainer.appendChild(nextBtn);
            this.container.appendChild(navContainer);
            
            // Add hover pause to prevent timing conflicts
            this.container.addEventListener('mouseenter', () => {
                this.stopRotation();
            });
            
            this.container.addEventListener('mouseleave', () => {
                this.startRotation();
            });
            
            console.log('🎯 Navigation arrows added with hover pause');
        }

        setupDotClicks() {
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    console.log(`🔘 Dot ${index} clicked`);
                    this.goToCard(index);
                });
            });
        }

        startRotation() {
            // Always clear any existing interval first
            this.stopRotation();
            
            this.intervalId = setInterval(() => {
                this.next();
            }, 6000); // Consistent 6 seconds
            console.log('🔄 Auto-rotation started (6 seconds)');
        }

        stopRotation() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
                console.log('⏹️ Auto-rotation stopped');
            }
        }

        restartRotation() {
            // Simplified: just stop and start again
            this.stopRotation();
            // Immediate restart instead of delay to avoid timing issues
            this.startRotation();
        }
    }

    // Simple Stacked Journal Carousel - Clean & Functional
    class SimpleStackedCarousel {
        constructor(container) {
            this.container = container;
            this.currentIndex = 0;
            this.intervalId = null;
            this.isTransitioning = false;
            
            console.log('🔍 Container found:', container);
            
            this.entries = Array.from(container.querySelectorAll('.journal-entry'));
            this.dots = Array.from(container.querySelectorAll('.dot'));
            
            console.log('✅ Found', this.entries.length, 'journal entries');
            console.log('✅ Found', this.dots.length, 'dots');
            
            // Debug: log each entry
            this.entries.forEach((entry, index) => {
                console.log(`📝 Entry ${index}:`, entry.textContent.substring(0, 50) + '...');
                console.log(`📏 Entry ${index} current styles:`, {
                    display: window.getComputedStyle(entry).display,
                    opacity: window.getComputedStyle(entry).opacity,
                    visibility: window.getComputedStyle(entry).visibility
                });
            });
            
            if (this.entries.length === 0) {
                console.error('❌ No journal entries found!');
                return;
            }
            
            this.init();
            this.setupEventListeners();
        }

        init() {
            console.log('🔄 Initializing simple stacked carousel...');
            console.log('📊 Found entries:', this.entries.length);
            
            // Force all cards to be visible first
            this.entries.forEach((entry, index) => {
                // Clear any existing styles and classes
                entry.style.cssText = '';
                entry.classList.remove('current', 'behind-1', 'behind-2', 'hidden');
                
                // Force display and basic positioning
                entry.style.display = 'block';
                entry.style.opacity = '1';
                entry.style.position = 'absolute';
                entry.style.top = '50%';
                entry.style.left = '50%';
                entry.style.transform = 'translate(-50%, -50%)';
                entry.style.zIndex = '10';
                
                console.log(`📱 Card ${index} forced visible:`, entry.style.display, entry.style.opacity);
            });
            
            // Small delay to ensure DOM updates
            setTimeout(() => {
                this.updateCardStacking();
                this.updateDots();
                this.createNavigationButtons();
                this.startAutoRotation();
                console.log('✅ Simple stacked carousel initialized with', this.entries.length, 'cards');
            }, 100);
        }

        updateCardStacking() {
            this.entries.forEach((entry, index) => {
                // Clear all position classes
                entry.classList.remove('current', 'behind-1', 'behind-2', 'hidden');
                
                const relativePosition = (index - this.currentIndex + this.entries.length) % this.entries.length;
                
                if (relativePosition === 0) {
                    // Current card (front)
                    entry.classList.add('current');
                } else if (relativePosition === 1) {
                    // First card behind
                    entry.classList.add('behind-1');
                } else if (relativePosition === 2) {
                    // Second card behind
                    entry.classList.add('behind-2');
                } else {
                    // Hidden cards
                    entry.classList.add('hidden');
                }
            });
        }

        updateDots() {
            this.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
            });
        }

        moveToNext() {
            if (this.isTransitioning) return;
            
            this.isTransitioning = true;
            console.log(`➡️ Moving to next card from ${this.currentIndex}`);
            
            // Update current index
            this.currentIndex = (this.currentIndex + 1) % this.entries.length;
            
            // Update stacking
            this.updateCardStacking();
            this.updateDots();
            
            // Wait for transition to complete
            setTimeout(() => {
                this.isTransitioning = false;
            }, 400);
        }

        moveToPrevious() {
            if (this.isTransitioning) return;
            
            this.isTransitioning = true;
            console.log(`⬅️ Moving to previous card from ${this.currentIndex}`);
            
            // Update current index
            this.currentIndex = (this.currentIndex - 1 + this.entries.length) % this.entries.length;
            
            // Update stacking
            this.updateCardStacking();
            this.updateDots();
            
            // Wait for transition to complete
            setTimeout(() => {
                this.isTransitioning = false;
            }, 400);
        }

        goToIndex(targetIndex) {
            if (this.isTransitioning || targetIndex === this.currentIndex) return;
            
            console.log(`🎯 Jumping to card ${targetIndex}`);
            
            this.isTransitioning = true;
            this.currentIndex = targetIndex;
            
            // Update stacking
            this.updateCardStacking();
            this.updateDots();
            
            // Restart auto rotation
            this.stopAutoRotation();
            setTimeout(() => {
                this.startAutoRotation();
                this.isTransitioning = false;
            }, 2000);
        }

        createNavigationButtons() {
            // Create navigation container
            const navContainer = document.createElement('div');
            navContainer.className = 'carousel-navigation';
            
            // Previous button
            const prevBtn = document.createElement('button');
            prevBtn.className = 'carousel-btn carousel-prev';
            prevBtn.innerHTML = '←';
            prevBtn.onclick = () => {
                this.stopAutoRotation();
                this.moveToPrevious();
                setTimeout(() => this.startAutoRotation(), 3000);
            };
            
            // Next button
            const nextBtn = document.createElement('button');
            nextBtn.className = 'carousel-btn carousel-next';
            nextBtn.innerHTML = '→';
            nextBtn.onclick = () => {
                this.stopAutoRotation();
                this.moveToNext();
                setTimeout(() => this.startAutoRotation(), 3000);
            };
            
            navContainer.appendChild(prevBtn);
            navContainer.appendChild(nextBtn);
            this.container.appendChild(navContainer);
        }

        setupEventListeners() {
            // Dot clicks
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    console.log(`🔘 Dot ${index} clicked`);
                    this.goToIndex(index);
                });
            });

            // Pause on hover
            this.container.addEventListener('mouseenter', () => {
                this.stopAutoRotation();
            });

            this.container.addEventListener('mouseleave', () => {
                setTimeout(() => this.startAutoRotation(), 1000);
            });
        }

        startAutoRotation() {
            if (this.intervalId || this.entries.length <= 1) return;
            
            console.log('🚀 Starting auto rotation (4 seconds)');
            this.intervalId = setInterval(() => {
                if (!this.isTransitioning) {
                    this.moveToNext();
                }
            }, 4000);
        }

        stopAutoRotation() {
            if (this.intervalId) {
                console.log('⏹️ Stopping auto rotation');
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }
    }

    // Initialize components when DOM is ready
    // Initialize Morphing Text Rotation
    const rotatingContainer = document.querySelector('.rotating-container');
    if (rotatingContainer) {
        const morphingText = new MorphingTextRotate(rotatingContainer, {
            rotationInterval: 2400,
            auto: true
        });
    }

    // Initialize EMERGENCY Journal Carousel
    const journalCarousel = document.querySelector('.journal-carousel');
    if (journalCarousel) {
        console.log('🚨 EMERGENCY: Initializing basic carousel...');
        
        const carousel = new EmergencyCarousel(journalCarousel);

        console.log('✅ Emergency carousel initialized');
    } else {
        console.error('❌ Journal carousel container not found!');
    }

    // Initialize Sparkles for section titles
    const sparkleTargets = document.querySelectorAll('.section-title');
    sparkleTargets.forEach(target => {
        new SparklesText(target, {
            sparklesCount: 6,
            colors: ['#FFE55C', '#6B73FF', '#FF9500']
        });
    });

    // Magnetic Button Effects (toned down)
    const magneticButtons = document.querySelectorAll('.magnetic-button');
    magneticButtons.forEach(button => {
        button.addEventListener('mouseenter', function(e) {
            this.style.transition = 'transform 0.2s ease-out';
        });

        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Much subtler magnetic pull effect
            const moveX = x * 0.03;
            const moveY = y * 0.03;
            
            this.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.01)`;
        });

        button.addEventListener('mouseleave', function() {
            this.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.320, 1)';
            this.style.transform = 'translate(0px, 0px) scale(1)';
        });

        // Ripple effect on click
        button.addEventListener('click', function(e) {
            createRipple(e, this);
        });
    });

    // Tilt Card Effects (more subtle) - exclude journal entries
    const tiltCards = document.querySelectorAll('.tilt-card:not(.journal-entry)');
    tiltCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.2s ease-out';
        });

        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Much subtler tilt
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px) scale(1.01)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.320, 1)';
            this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
        });
    });

    // Enhanced Leaves Animation with Mouse Interaction (more subtle)
    const leaves = document.querySelectorAll('.leaf');
    leaves.forEach((leaf, index) => {
        // Much subtler mouse interaction for leaves
        document.addEventListener('mousemove', (e) => {
            const rect = leaf.getBoundingClientRect();
            const leafCenterX = rect.left + rect.width / 2;
            const leafCenterY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(e.clientX - leafCenterX, 2) + 
                Math.pow(e.clientY - leafCenterY, 2)
            );
            
            if (distance < 60) {
                const pushX = (leafCenterX - e.clientX) * 0.02;
                const pushY = (leafCenterY - e.clientY) * 0.02;
                
                leaf.style.transform = `translate(${pushX}px, ${pushY}px)`;
            } else {
                leaf.style.transform = '';
            }
        });

        // Dynamic color changes based on time
        const updateLeafColor = () => {
            const hour = new Date().getHours();
            let hue = 45; // Base autumn orange
            
            if (hour >= 18 || hour <= 6) {
                hue = 280; // Purple for evening/night
            } else if (hour >= 6 && hour <= 12) {
                hue = 60; // Yellow for morning
            }
            
            leaf.style.filter = `hue-rotate(${hue - 45}deg) brightness(1.1)`;
        };
        
        updateLeafColor();
        setInterval(updateLeafColor, 60000);
    });

    // Enhanced Scroll-based Animations with Intersection Observer
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Staggered animation for child elements
                const children = entry.target.querySelectorAll('.step, .testimonial, .booking-option');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('animate-in');
                    }, index * 120);
                });

                // Special handling for story content paragraphs
                const paragraphs = entry.target.querySelectorAll('.story-content p');
                paragraphs.forEach((p, index) => {
                    setTimeout(() => {
                        p.classList.add('animate-in');
                    }, index * 80);
                });
            }
        });
    }, observerOptions);

    // Observe sections for scroll animations
    const animatedSections = document.querySelectorAll('.how-it-works, .why-section, .testimonials, .final-cta');
    animatedSections.forEach(section => {
        section.classList.add('scroll-animate');
        observer.observe(section);
    });

    // Observe individual elements for more granular control
    const animatedElements = document.querySelectorAll('.step, .testimonial, .story-content p, .section-title');
    animatedElements.forEach(element => {
        element.classList.add('scroll-animate');
        observer.observe(element);
    });

    // Simple Parallax Effect for Hero Section (very subtle)
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        
        if (hero && scrolled < window.innerHeight) {
            const rate = scrolled * -0.05;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

    // Enhanced Modal with Smooth Animation
    const modal = document.getElementById('booking');
    const modalContent = document.querySelector('.modal-content');
    const modalTriggers = document.querySelectorAll('a[href="#booking"]');
    const closeBtn = document.querySelector('.close');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            // Direct redirect to Cal.com link
            window.open('https://cal.com/brilliantaksan/listen', '_blank');
        });
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });

    function openModal() {
        modal.style.display = 'block';
        modal.style.opacity = '0';
        
        // Animate in
        requestAnimationFrame(() => {
            modal.style.transition = 'opacity 0.3s ease';
            modal.style.opacity = '1';
            
            modalContent.style.transform = 'scale(0.9) translateY(-20px)';
            modalContent.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            
            requestAnimationFrame(() => {
                modalContent.style.transform = 'scale(1) translateY(0px)';
            });
        });

        // Animate booking options with stagger
        const bookingOptions = modal.querySelectorAll('.booking-option');
        bookingOptions.forEach((option, index) => {
            option.style.opacity = '0';
            option.style.transform = 'translateY(20px)';
            option.style.transition = 'all 0.4s cubic-bezier(0.23, 1, 0.320, 1)';
            
            setTimeout(() => {
                option.style.opacity = '1';
                option.style.transform = 'translateY(0px)';
            }, 150 + index * 80);
        });
    }

    function closeModal() {
        modalContent.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.320, 1)';
        modalContent.style.transform = 'scale(0.95) translateY(10px)';
        modal.style.transition = 'opacity 0.3s ease';
        modal.style.opacity = '0';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Ripple Effect Function
    function createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        // Randomly colored ripples based on design system
        const colors = ['rgba(107, 115, 255, 0.3)', 'rgba(255, 229, 92, 0.3)', 'rgba(255, 149, 0, 0.3)'];
        ripple.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Enhanced Keyboard Navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
        
        // Regular smooth scroll with arrow keys
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            window.scrollBy({ top: 100, behavior: 'smooth' });
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            window.scrollBy({ top: -100, behavior: 'smooth' });
        }
    });

    // Performance optimization: Throttle scroll events
    let ticking = false;
    function throttleScroll(callback) {
        if (!ticking) {
            requestAnimationFrame(callback);
            ticking = true;
        }
    }

    // Dynamic Background Color Based on Scroll (more subtle)
    window.addEventListener('scroll', () => {
        throttleScroll(() => {
            const scrollPercent = window.pageYOffset / (document.body.scrollHeight - window.innerHeight);
            const hue = 240 + (scrollPercent * 20); // Even less dramatic color change
            
            document.body.style.background = `linear-gradient(135deg, 
                hsl(${hue}, 50%, 98%) 0%, 
                hsl(${hue + 10}, 40%, 96%) 50%, 
                hsl(${hue + 20}, 30%, 94%) 100%)`;
            
            ticking = false;
        });
    });

    console.log('✨ Listening Table: Smooth interactions with rotating text and sparkles loaded!');
}); 