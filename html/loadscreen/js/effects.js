/* ═══════════════════════════════════════════════════════════
   effects.js – Visual Effects Engine
   Particles, snow, rain, fog, etc.
   ═══════════════════════════════════════════════════════════ */

const Effects = (() => {
    const _intervals = {};

    function render(container, el) {
        const type = el.type;
        switch (type) {
            case 'particles':  return _renderParticles(container, el);
            case 'snowfall':   return _renderSnowfall(container, el);
            case 'rainfall':   return _renderRainfall(container, el);
            case 'fog':        return _renderFog(container, el);
            case 'scanlines':  return _renderScanlines(container, el);
            default: return null;
        }
    }

    function _renderParticles(container, el) {
        const props = el.props || {};
        const canvas = document.createElement('canvas');
        canvas.width = props.width || 1920;
        canvas.height = props.height || 1080;
        canvas.className = 'ls-effect-canvas';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const particles = [];
        const count = props.particleCount || 50;
        const color = props.particleColor || '#ffffff';
        const size = props.particleSize || 3;
        const speed = props.speed || 1;

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                size: Math.random() * size + 1,
                opacity: Math.random() * 0.5 + 0.3,
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            _intervals[el.id] = requestAnimationFrame(animate);
        }
        animate();
    }

    function _renderSnowfall(container, el) {
        const props = el.props || {};
        const canvas = document.createElement('canvas');
        canvas.width = props.width || 1920;
        canvas.height = props.height || 1080;
        canvas.className = 'ls-effect-canvas';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const flakes = [];
        const count = props.flakeCount || 100;
        const color = props.flakeColor || '#ffffff';
        const speed = props.speed || 1;
        const wind = props.wind || 0;

        for (let i = 0; i < count; i++) {
            flakes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 4 + 1,
                speed: Math.random() * speed + 0.5,
                drift: Math.random() * wind,
                opacity: Math.random() * 0.5 + 0.5,
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const f of flakes) {
                f.y += f.speed;
                f.x += f.drift + Math.sin(f.y * 0.01) * 0.5;
                if (f.y > canvas.height) {
                    f.y = -5;
                    f.x = Math.random() * canvas.width;
                }

                ctx.beginPath();
                ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.globalAlpha = f.opacity;
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            _intervals[el.id] = requestAnimationFrame(animate);
        }
        animate();
    }

    function _renderRainfall(container, el) {
        const props = el.props || {};
        const canvas = document.createElement('canvas');
        canvas.width = props.width || 1920;
        canvas.height = props.height || 1080;
        canvas.className = 'ls-effect-canvas';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const drops = [];
        const count = props.dropCount || 200;
        const color = props.dropColor || 'rgba(200,200,255,0.5)';
        const speed = props.speed || 2;
        const angle = (props.angle || 0) * Math.PI / 180;

        for (let i = 0; i < count; i++) {
            drops.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                length: Math.random() * 15 + 5,
                speed: Math.random() * speed * 5 + 5,
                opacity: Math.random() * 0.3 + 0.3,
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const d of drops) {
                d.y += d.speed;
                d.x += Math.sin(angle) * d.speed;
                if (d.y > canvas.height) {
                    d.y = -d.length;
                    d.x = Math.random() * canvas.width;
                }

                ctx.beginPath();
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x + Math.sin(angle) * d.length, d.y + d.length);
                ctx.strokeStyle = color;
                ctx.globalAlpha = d.opacity;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            _intervals[el.id] = requestAnimationFrame(animate);
        }
        animate();
    }

    function _renderFog(container, el) {
        const props = el.props || {};
        const div = document.createElement('div');
        div.className = 'ls-effect-canvas';
        div.style.background = `radial-gradient(ellipse at center, transparent 0%, ${props.fogColor || 'rgba(255,255,255,0.1)'} 100%)`;
        div.style.opacity = props.density || 0.5;
        div.style.animation = `fogDrift ${10 / (props.speed || 0.5)}s ease-in-out infinite alternate`;
        container.appendChild(div);

        // Inject fog keyframes if needed
        if (!document.getElementById('fog-keyframes')) {
            const style = document.createElement('style');
            style.id = 'fog-keyframes';
            style.textContent = `
                @keyframes fogDrift {
                    0%   { transform: translateX(-3%) scale(1.05); }
                    100% { transform: translateX(3%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function _renderScanlines(container, el) {
        const props = el.props || {};
        const div = document.createElement('div');
        div.className = 'ls-scanlines ls-effect-canvas';
        div.style.setProperty('--line-spacing', (props.lineSpacing || 4) + 'px');
        div.style.setProperty('--line-color', props.lineColor || 'rgba(0,0,0,0.15)');
        div.style.setProperty('--line-width', (props.lineWidth || 1) + 'px');
        container.appendChild(div);
    }

    function destroy(elId) {
        if (_intervals[elId]) {
            cancelAnimationFrame(_intervals[elId]);
            delete _intervals[elId];
        }
    }

    function destroyAll() {
        for (const id in _intervals) {
            cancelAnimationFrame(_intervals[id]);
        }
    }

    return { render, destroy, destroyAll };
})();
