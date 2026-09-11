// Prevent 'Confirm Form Resubmission' dialog on page reload
if (window.history && window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('%c[astrong.xyz]%c Homepage initialized', 'color: #8859ff; font-weight: bold;', 'color: inherit;');

    // Dynamic Autonomous Random Floating Accent Bubble with Edge-Distance Brightness
    const ambientBubble = document.querySelector('.ambient-bubble');
    if (ambientBubble) {
        console.log('[Ambient Bubble] Autonomous accent bubble animation initialized');
        const getRandomWaypoint = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            return {
                x: (Math.random() * 1.3 - 0.15) * w,
                y: (Math.random() * 1.3 - 0.15) * h
            };
        };

        let startPos = getRandomWaypoint();
        let currX = startPos.x;
        let currY = startPos.y;
        let targetPos = getRandomWaypoint();
        let startTime = performance.now();
        let duration = 6000 + Math.random() * 6000;

        const updateBubble = (now) => {
            let elapsed = now - startTime;
            let progress = Math.min(1, elapsed / duration);

            // Smooth cubic ease-in-out curve
            let ease = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            currX = startPos.x + (targetPos.x - startPos.x) * ease;
            currY = startPos.y + (targetPos.y - startPos.y) * ease;

            if (progress >= 1) {
                startPos = { x: currX, y: currY };
                targetPos = getRandomWaypoint();
                startTime = now;
                duration = 6000 + Math.random() * 6000;
            }

            // Calculate distance to nearest screen edge
            const w = window.innerWidth;
            const h = window.innerHeight;
            const distLeft = currX;
            const distRight = w - currX;
            const distTop = currY;
            const distBottom = h - currY;

            const minEdgeDist = Math.min(distLeft, distRight, distTop, distBottom);
            const maxEdgeDist = Math.min(w, h) / 2;

            // Closeness factor: 1 at/beyond edge, 0 at exact screen center
            const edgeCloseness = Math.max(0, Math.min(1, 1 - (minEdgeDist / maxEdgeDist)));

            // Calculate brightness strictly from edge distance (0.35 at center -> 1.0 at edge)
            const opacity = 0.35 + 0.65 * Math.pow(edgeCloseness, 0.85);

            ambientBubble.style.transform = `translate3d(${currX.toFixed(1)}px, ${currY.toFixed(1)}px, 0)`;
            ambientBubble.style.opacity = opacity.toFixed(3);

            requestAnimationFrame(updateBubble);
        };

        requestAnimationFrame(updateBubble);
    }

    // 1. Handle shape cycling and reversing the rotation of the cookie
    const wrapper = document.querySelector('.pfp-wrapper');
    const img = document.querySelector('.pfp-wrapper img');

    const shapes = [
        'four-sided-cookie',
        'six-sided-cookie',
        'nine-sided-cookie',
        'sunny',
        'twelve-sided-cookie'
    ];

    if (false && wrapper && img) {
        // Pre-sample and align points for all shapes
        const numPoints = 120;
        const shapePoints = {};
        let currentShapeIndex = 2; // Default to 'nine-sided-cookie'

        const alignPoints = (points) => {
            let minD = Infinity;
            let startIdx = 0;
            points.forEach((p, idx) => {
                const dx = p.x - 0.5;
                const dy = p.y - 0.0;
                const d = dx * dx + dy * dy;
                if (d < minD) {
                    minD = d;
                    startIdx = idx;
                }
            });
            return [...points.slice(startIdx), ...points.slice(0, startIdx)];
        };

        // Create a temporary SVG element in document body to measure path lengths
        const svgNS = "http://www.w3.org/2000/svg";
        const tempSvg = document.createElementNS(svgNS, "svg");
        const tempPath = document.createElementNS(svgNS, "path");
        tempSvg.appendChild(tempPath);
        document.body.appendChild(tempSvg);

        shapes.forEach(id => {
            const clipEl = document.getElementById(id);
            if (clipEl) {
                const pathEl = clipEl.querySelector('path');
                if (pathEl) {
                    const dAttr = pathEl.getAttribute('d');
                    tempPath.setAttribute('d', dAttr);
                    const length = tempPath.getTotalLength();
                    const points = [];
                    for (let i = 0; i < numPoints; i++) {
                        const dist = (i / numPoints) * length;
                        const p = tempPath.getPointAtLength(dist);
                        points.push({ x: p.x, y: p.y });
                    }
                    shapePoints[id] = alignPoints(points);
                }
            }
        });

        document.body.removeChild(tempSvg);

        // Active clip path element
        const activePathEl = document.getElementById('active-clip-path');
        let currentPoints = [];

        // Initialize current points to the default shape (nine-sided-cookie)
        const initialShape = shapes[currentShapeIndex];
        if (shapePoints[initialShape]) {
            currentPoints = [...shapePoints[initialShape]];
            // Set initial path string
            const d = 'M' + currentPoints.map(p => `${p.x.toFixed(4)} ${p.y.toFixed(4)}`).join(' L') + 'Z';
            activePathEl.setAttribute('d', d);
        }

        let longPressTimer = null;
        let isLongPress = false;
        let hasReversedThisPress = false;
        let startX = 0;
        let startY = 0;
        let lastCycleTime = 0;
        let animationFrameId = null;

        const animatePath = (targetPoints, duration = 300) => {
            const startPoints = [...currentPoints];
            const startTime = performance.now();

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }

            const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

            const tick = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOutCubic(progress);

                // Interpolate
                currentPoints = startPoints.map((start, idx) => {
                    const target = targetPoints[idx];
                    return {
                        x: start.x + (target.x - start.x) * eased,
                        y: start.y + (target.y - start.y) * eased
                    };
                });

                // Generate path string
                const d = 'M' + currentPoints.map(p => `${p.x.toFixed(4)} ${p.y.toFixed(4)}`).join(' L') + 'Z';
                activePathEl.setAttribute('d', d);

                if (progress < 1) {
                    animationFrameId = requestAnimationFrame(tick);
                }
            };

            animationFrameId = requestAnimationFrame(tick);
        };

        let rotationAngle = 0;
        let rotationDirection = 1; // 1 = clockwise, -1 = counter-clockwise
        let speedMultiplier = 1;
        let lastTime = performance.now();

        const rotateLoop = (time) => {
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            // 36 degrees per second is 360deg over 10 seconds
            rotationAngle += rotationDirection * 36 * speedMultiplier * dt;
            rotationAngle = rotationAngle % 360;

            wrapper.style.transform = `rotate(${rotationAngle}deg)`;
            img.style.transform = `rotate(${-rotationAngle}deg)`;

            requestAnimationFrame(rotateLoop);
        };
        requestAnimationFrame(rotateLoop);

        let speedTimeoutId = null;
        let decelerateFrameId = null;
        const fastMultiplier = 6;

        const temporarySpeedUp = () => {
            if (speedTimeoutId) clearTimeout(speedTimeoutId);
            if (decelerateFrameId) cancelAnimationFrame(decelerateFrameId);

            speedMultiplier = fastMultiplier;

            speedTimeoutId = setTimeout(() => {
                const startTime = performance.now();
                const duration = 100; // 100ms deceleration

                const decelerate = (now) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    speedMultiplier = fastMultiplier + (1 - fastMultiplier) * progress;

                    if (progress < 1) {
                        decelerateFrameId = requestAnimationFrame(decelerate);
                    } else {
                        decelerateFrameId = null;
                    }
                };

                decelerateFrameId = requestAnimationFrame(decelerate);
            }, 300);
        };

        const cycleShape = (e) => {
            const now = Date.now();
            if (now - lastCycleTime < 250) {
                if (e) e.preventDefault();
                return;
            }
            lastCycleTime = now;

            if (e) e.preventDefault();
            currentShapeIndex = (currentShapeIndex + 1) % shapes.length;
            const targetShape = shapes[currentShapeIndex];

            if (shapePoints[targetShape]) {
                animatePath(shapePoints[targetShape], 300);
                temporarySpeedUp();
            }

            // Reset the auto-cycle timer whenever the shape is cycled (either manually or automatically)
            startAutoCycle();
        };

        let autoCycleInterval = null;
        const startAutoCycle = () => {
            stopAutoCycle();
            // Only auto-cycle shape on the root homepage index.html
            const isRootHome = document.title === 'Austin Strong';
            if (!isRootHome) return;

            autoCycleInterval = setInterval(() => {
                cycleShape();
            }, 5000);
        };
        const stopAutoCycle = () => {
            if (autoCycleInterval) {
                clearInterval(autoCycleInterval);
                autoCycleInterval = null;
            }
        };

        // Start the auto shape cycling initially
        startAutoCycle();

        const reverseRotation = () => {
            rotationDirection *= -1;
        };
        // Click handler (cycles shape, ignores long-presses and non-left-clicks)
        wrapper.addEventListener('click', (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) {
                return;
            }
            if (isLongPress) {
                isLongPress = false;
                return;
            }

            cycleShape(e);
        });

        // Desktop Right-Click (contextmenu)
        wrapper.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isTouch = e.pointerType === 'touch' || ('ontouchstart' in window && !window.matchMedia('(pointer: fine)').matches);
            if (isTouch) {
                if (!hasReversedThisPress) {
                    hasReversedThisPress = true;
                    reverseRotation();
                }
            } else {
                reverseRotation();
            }
        });

        // Mobile Long Press & PointerEvents
        wrapper.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse' && e.button === 2) {
                return;
            }
            if (e.pointerType === 'mouse' && e.button !== 0) {
                return;
            }
            isLongPress = false;
            hasReversedThisPress = false;
            startX = e.clientX;
            startY = e.clientY;

            if (e.pointerType !== 'mouse') {
                longPressTimer = setTimeout(() => {
                    isLongPress = true;
                    if (!hasReversedThisPress) {
                        hasReversedThisPress = true;
                        reverseRotation();
                    }
                }, 250);
            }
        });

        const cancelPress = () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        };

        wrapper.addEventListener('pointerup', cancelPress);
        wrapper.addEventListener('pointercancel', cancelPress);
        wrapper.addEventListener('pointermove', (e) => {
            if (longPressTimer) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                if (Math.sqrt(dx * dx + dy * dy) > 10) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            }
        });
    }



    // 3. Initialize Live Status Bar and Card Pill Scrolling
    initLiveStatusBar();
    initCardPillScroll();

    function initCardPillScroll() {
        const pillContainers = document.querySelectorAll('.card-quick-links');
        if (!pillContainers.length) return;
        console.log(`[Quick Links] Drag-and-scroll initialized for ${pillContainers.length} chip carousel(s)`);

        pillContainers.forEach(container => {
            let targetScroll = container.scrollLeft;
            let currentScroll = container.scrollLeft;
            let isAnimating = false;
            let isDown = false;
            let startX = 0;
            let scrollStart = 0;
            let hasDragged = false;
            let lastX = 0;
            let lastTime = 0;
            let velocityX = 0;
            let rafId = null;

            const updateOverflowMask = () => {
                const scrollLeft = container.scrollLeft;
                const scrollWidth = container.scrollWidth;
                const clientWidth = container.clientWidth;

                if (scrollWidth <= clientWidth + 2) {
                    container.removeAttribute('data-overflow');
                    return;
                }

                const atStart = scrollLeft <= 2;
                const atEnd = scrollLeft + clientWidth >= scrollWidth - 2;

                if (atStart && !atEnd) {
                    container.setAttribute('data-overflow', 'right');
                } else if (!atStart && atEnd) {
                    container.setAttribute('data-overflow', 'left');
                } else if (!atStart && !atEnd) {
                    container.setAttribute('data-overflow', 'both');
                } else {
                    container.removeAttribute('data-overflow');
                }
            };

            const animateScroll = () => {
                if (isDown) {
                    isAnimating = false;
                    return;
                }

                const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
                targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
                
                const diff = targetScroll - currentScroll;
                if (Math.abs(diff) > 0.4) {
                    currentScroll += diff * 0.16;
                    container.scrollLeft = currentScroll;
                    updateOverflowMask();
                    rafId = requestAnimationFrame(animateScroll);
                    isAnimating = true;
                } else {
                    currentScroll = targetScroll;
                    container.scrollLeft = targetScroll;
                    updateOverflowMask();
                    isAnimating = false;
                }
            };

            const startSmoothScroll = (newTarget) => {
                const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
                targetScroll = Math.max(0, Math.min(newTarget, maxScroll));
                currentScroll = container.scrollLeft;
                if (!isAnimating) {
                    rafId = requestAnimationFrame(animateScroll);
                    isAnimating = true;
                }
            };

            // Smart Wheel Scrolling with smooth interpolation & boundary pass-through
            container.addEventListener('wheel', (e) => {
                const rawDelta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
                if (rawDelta === 0) return;

                const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
                if (maxScroll <= 0) return;

                const current = isAnimating ? targetScroll : container.scrollLeft;
                const atStart = current <= 0;
                const atEnd = current >= maxScroll;

                if ((rawDelta > 0 && !atEnd) || (rawDelta < 0 && !atStart)) {
                    e.preventDefault();
                    const step = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 140);
                    startSmoothScroll((isAnimating ? targetScroll : container.scrollLeft) + step);
                }
            }, { passive: false });

            // Smooth Native Scrolling for Touch & Desktop Click-and-Drag Support
            container.addEventListener('scroll', () => {
                if (!isAnimating && !isDown) {
                    currentScroll = container.scrollLeft;
                    targetScroll = container.scrollLeft;
                    updateOverflowMask();
                }
            }, { passive: true });

            container.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'touch') return; // Let mobile devices use smooth native composited scrolling
                if (e.button !== 0) return;
                isDown = true;
                if (isAnimating) {
                    cancelAnimationFrame(rafId);
                    isAnimating = false;
                }
                startX = e.pageX;
                lastX = e.pageX;
                lastTime = performance.now();
                velocityX = 0;
                scrollStart = container.scrollLeft;
                currentScroll = container.scrollLeft;
                targetScroll = container.scrollLeft;
                hasDragged = false;
            });

            window.addEventListener('pointermove', (e) => {
                if (!isDown) return;
                const now = performance.now();
                const dt = Math.max(now - lastTime, 1);
                const moveDx = e.pageX - lastX;
                velocityX = moveDx / dt;
                lastX = e.pageX;
                lastTime = now;

                const dx = e.pageX - startX;
                if (Math.abs(dx) > 4) {
                    hasDragged = true;
                    container.classList.add('is-dragging');
                }
                container.scrollLeft = scrollStart - dx;
                currentScroll = container.scrollLeft;
                targetScroll = container.scrollLeft;
                updateOverflowMask();
            });

            const endDrag = () => {
                if (!isDown) return;
                isDown = false;
                container.classList.remove('is-dragging');

                if (hasDragged) {
                    setTimeout(() => {
                        hasDragged = false;
                    }, 50);

                    // Apply momentum on release if flicked
                    if (Math.abs(velocityX) > 0.12) {
                        const momentum = -velocityX * 160;
                        startSmoothScroll(container.scrollLeft + momentum);
                    }
                }
            };

            window.addEventListener('pointerup', endDrag);
            window.addEventListener('pointercancel', endDrag);

            // Prevent link trigger on drag & disable native drag
            container.querySelectorAll('.quick-chip').forEach(chip => {
                chip.addEventListener('dragstart', (e) => e.preventDefault());
                chip.addEventListener('click', (e) => {
                    if (hasDragged) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
            });

            container.addEventListener('scroll', () => {
                if (!isAnimating && !isDown) {
                    currentScroll = container.scrollLeft;
                    targetScroll = container.scrollLeft;
                }
                updateOverflowMask();
            }, { passive: true });

            window.addEventListener('resize', updateOverflowMask);
            updateOverflowMask();
        });
    }

    function initLiveStatusBar() {
        const statusBar = document.getElementById('live-status-bar');
        const statusText = document.getElementById('live-status-text');
        const statusIcon = document.getElementById('live-status-icon') || statusBar?.querySelector('.live-dot, .live-icon');

        if (!statusBar || !statusText) return;
        console.log('[Live Status] Live status pill component initialized');

        // Clicking the status pill navigates to the Availability calendar
        statusBar.addEventListener('click', () => {
            window.location.href = 'https://schedule.astrong.xyz/availability/';
        });
        statusBar.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = 'https://schedule.astrong.xyz/availability/';
            }
        });

        const apiKey = 'AIzaSyBIwrZ7LnEPCEGs5CM_Pq61YtGZ3jHVQHY';
        const calendarId = 'dolphin.kden@gmail.com';
        const schoolCalendarId = 'f6c70c75c77b7dbe2af2320f595ceb5c787024238c5be9db11476e9bc8f6f223@group.calendar.google.com';

        // Fallback schedule data object
        const FALLBACK_STARBUCKS_SCHEDULE = {};

        let apiDisabled = false;
        let apiWarned = false;

        const statusIcons = {
            'at-school': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
            'at-work': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 12h1a3 3 0 0 1 0 6h-1"/></svg>`,
            'listening': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
            'available': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
            'busy': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
            'unavailable': `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`
        };

        function updateUI(status, label) {
            statusBar.setAttribute('data-status', status);
            statusText.textContent = label;
            if (statusIcon) {
                statusIcon.innerHTML = statusIcons[status] || statusIcons['available'];
            }
        }

        function parseCalendarEvents(items) {
            const events = [];
            if (!items || !Array.isArray(items)) return events;

            for (const event of items) {
                if (event.status === 'cancelled') continue;

                let start, end;
                if (event.start && event.start.dateTime) {
                    start = new Date(event.start.dateTime);
                    end = new Date(event.end.dateTime);
                } else if (event.start && event.start.date) {
                    const [sy, sm, sd] = event.start.date.split('-').map(Number);
                    const [ey, em, ed] = event.end.date.split('-').map(Number);
                    start = new Date(sy, sm - 1, sd, 0, 0, 0);
                    end = new Date(ey, em - 1, ed, 0, 0, 0);
                } else {
                    continue;
                }

                const isFree = event.transparency === 'transparent';
                if (isFree) continue;

                const summary = (event.summary || '').trim().toLowerCase();
                const isStarbucks = summary.includes('starbucks shift') || summary.includes('starbucks') || summary.includes('work');
                const isSchool = event.__isFromSchoolCalendar || summary.includes('school') || (event.organizer && event.organizer.email && event.organizer.email.includes('school'));
                const isCalendarBlock = summary.includes('calendar block');
                const isUnavailable = isCalendarBlock || summary.includes('unavailable');

                if (isStarbucks) {
                    events.push({ type: 'at-work', start, end });
                } else if (isSchool) {
                    events.push({ type: 'at-school', start, end });
                } else if (isUnavailable) {
                    events.push({ type: 'unavailable', start, end });
                } else {
                    events.push({ type: 'busy', start, end });
                }
            }
            return events;
        }

        function parseFallbackEvents(now) {
            const schedule = window.STARBUCKS_SCHEDULE || FALLBACK_STARBUCKS_SCHEDULE;
            const pad = (n) => String(n).padStart(2, '0');
            const events = [];

            for (let dayOffset = -1; dayOffset <= 1; dayOffset++) {
                const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
                const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
                const dayData = schedule[dateStr];
                if (!dayData) continue;

                const dayItems = Array.isArray(dayData) ? dayData : [dayData];
                for (const item of dayItems) {
                    if (!item.start || !item.end) continue;
                    const [sh, sm] = item.start.split(':').map(Number);
                    const [eh, em] = item.end.split(':').map(Number);

                    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), sh, sm, 0);
                    let end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), eh, em, 0);
                    if (end <= start) {
                        end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, eh, em, 0);
                    }

                    const notes = (item.notes || '').toLowerCase();
                    const title = (item.title || '').toLowerCase();
                    const isCalendarBlock = title.includes('calendar block') || notes.includes('calendar block');
                    const isBusyFlag = item.type === 'busy' || item.busy === true || item.isStarbucks === false || item.status === 'busy' || notes.includes('busy') || title.includes('busy');
                    const isUnavailableFlag = item.type === 'unavailable' || item.status === 'unavailable' || (isCalendarBlock && isBusyFlag);

                    let type = 'at-work';
                    if (isUnavailableFlag) {
                        type = 'unavailable';
                    } else if (isBusyFlag) {
                        type = 'busy';
                    }

                    events.push({ type, start, end });
                }
            }
            return events;
        }

        function formatDurationText(totalSeconds) {
            const secs = Math.max(1, Math.floor(totalSeconds));
            const d = Math.floor(secs / 86400);
            const h = Math.floor((secs % 86400) / 3600);
            const m = Math.floor((secs % 3600) / 60);
            const s = secs % 60;

            const showSeconds = secs < 300;

            const parts = [];
            if (d > 0) parts.push(`${d}d`);
            if (h > 0) parts.push(`${h}h`);
            if (m > 0) parts.push(`${m}m`);
            if (showSeconds && s > 0) parts.push(`${s}s`);

            if (parts.length === 0) {
                if (showSeconds) parts.push(`${s}s`);
                else parts.push('1m');
            }

            return parts.join(' ');
        }

        function evaluateStatusFromEvents(events, now) {
            let activeAtWork = null;
            let activeAtSchool = null;
            let activeUnavailable = null;
            let activeBusy = null;
            let upcomingEvent = null;

            for (const evt of events) {
                if (evt.start <= now && now < evt.end) {
                    if (evt.type === 'at-work') {
                        if (!activeAtWork || evt.end > activeAtWork.end) activeAtWork = evt;
                    } else if (evt.type === 'at-school') {
                        if (!activeAtSchool || evt.end > activeAtSchool.end) activeAtSchool = evt;
                    } else if (evt.type === 'unavailable') {
                        if (!activeUnavailable || evt.end > activeUnavailable.end) activeUnavailable = evt;
                    } else if (evt.type === 'busy') {
                        if (!activeBusy || evt.end > activeBusy.end) activeBusy = evt;
                    }
                } else if (evt.start > now) {
                    if (!upcomingEvent || evt.start < upcomingEvent.start) {
                        upcomingEvent = evt;
                    }
                }
            }

            const activeEvent = activeAtWork || activeAtSchool || activeUnavailable || activeBusy;

            if (activeEvent) {
                const totalSeconds = Math.max(1, (activeEvent.end.getTime() - now.getTime()) / 1000);
                const statusType = activeEvent.type;
                let prefix = 'Busy';
                if (statusType === 'at-work') prefix = 'At work';
                else if (statusType === 'at-school') prefix = 'At school';
                else if (statusType === 'unavailable') prefix = 'Unavailable';
                const durationStr = formatDurationText(totalSeconds);

                return {
                    status: statusType,
                    label: `${prefix} for another ${durationStr}`
                };
            } else {
                const baseStatus = 'available';
                const baseLabel = 'Available';

                if (upcomingEvent) {
                    const totalSecondsUntilStart = Math.max(1, (upcomingEvent.start.getTime() - now.getTime()) / 1000);
                    if (totalSecondsUntilStart <= 3600) {
                        const durationStr = formatDurationText(totalSecondsUntilStart);
                        return {
                            status: baseStatus,
                            label: `Available for another ${durationStr}`
                        };
                    }
                }

                return {
                    status: baseStatus,
                    label: baseLabel
                };
            }
        }

        let cachedEvents = null;
        let lastFetchTime = 0;

        async function fetchCalendarEvents(now) {
            if (cachedEvents && (Date.now() - lastFetchTime < 30000)) {
                return cachedEvents;
            }

            let events = [];
            let apiSuccess = false;

            if (!apiDisabled) {
                const timeMin = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
                const timeMax = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
                
                const url1 = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&singleEvents=true&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&orderBy=startTime`;
                const url2 = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(schoolCalendarId)}/events?key=${apiKey}&singleEvents=true&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&orderBy=startTime`;

                try {
                    const [res1, res2] = await Promise.allSettled([fetch(url1), fetch(url2)]);
                    let combinedItems = [];

                    if (res1.status === 'fulfilled' && res1.value.ok) {
                        const data1 = await res1.value.json();
                        if (data1.items) combinedItems.push(...data1.items);
                    }
                    if (res2.status === 'fulfilled' && res2.value.ok) {
                        const data2 = await res2.value.json();
                        if (data2.items) {
                            data2.items.forEach(it => { it.__isFromSchoolCalendar = true; });
                            combinedItems.push(...data2.items);
                        }
                    }

                    if (combinedItems.length > 0) {
                        events = parseCalendarEvents(combinedItems);
                        apiSuccess = true;
                        console.log(`[Live Status] Google Calendar API: ${combinedItems.length} raw events loaded (${events.length} parsed)`);
                    }
                } catch (err) {
                    console.warn('[Live Status] Google Calendar API direct fetch failed, falling back to proxy:', err);
                    try {
                        const proxyUrl = `/api/calendar?calendarId=${encodeURIComponent(calendarId)}`;
                        const proxyRes = await fetch(proxyUrl);
                        if (proxyRes.ok) {
                            const proxyData = await proxyRes.json();
                            if (proxyData.items) {
                                events = parseCalendarEvents(proxyData.items);
                                apiSuccess = true;
                                console.log(`[Live Status] Serverless Calendar Proxy: ${events.length} events loaded`);
                            }
                        }
                    } catch (proxyErr) {
                        console.warn('[Live Status] Serverless Calendar Proxy fetch failed:', proxyErr);
                    }
                }
            }

            if (!apiSuccess) {
                events = parseFallbackEvents(now);
                console.log(`[Live Status] Loaded local fallback Starbucks schedule (${events.length} event(s))`);
            }

            cachedEvents = events;
            lastFetchTime = Date.now();
            return cachedEvents;
        }

        let lastLoggedStatusKey = null;
        async function fetchCalendarStatus(force = false) {
            if (force) lastFetchTime = 0;
            const now = new Date();
            const events = await fetchCalendarEvents(now);
            const result = evaluateStatusFromEvents(events, now);
            updateUI(result.status, result.label);
            const statusKey = `${result.status}:${result.label.split(' for another ')[0]}`;
            if (lastLoggedStatusKey !== statusKey) {
                lastLoggedStatusKey = statusKey;
                console.log(`[Live Status] Current status: "${result.label}" (state: ${result.status})`);
            }
        }

        window.updateLiveStatus = () => fetchCalendarStatus(true);

        function scheduleNextAlignedUpdate() {
            fetchCalendarStatus();
            const now = new Date();
            const delay = 1000 - now.getMilliseconds();
            setTimeout(scheduleNextAlignedUpdate, delay);
        }

        fetchCalendarStatus();
        const initialNow = new Date();
        const initialDelay = 1000 - initialNow.getMilliseconds();
        setTimeout(scheduleNextAlignedUpdate, initialDelay);
    }
});
