const TOTAL = 8;
    let cur = 0, animating = false;
    const track   = document.getElementById('modalSlides');
    const dotsEl  = document.getElementById('modalDots');
    const counter = document.getElementById('modalCounter');
    const overlay = document.getElementById('modalOverlay');

    for (let i = 0; i < TOTAL; i++) {
      const d = document.createElement('div');
      d.className = 'mdot' + (i === 0 ? ' on' : '');
      d.onclick = () => goTo(i);
      dotsEl.appendChild(d);
    }

    function fw() { return track.parentElement.offsetWidth; }

    function snap(n) {
      track.style.transition = 'none';
      track.style.transform  = `translateX(-${n * fw()}px)`;
    }

    function goTo(n) {
      if (animating) return;
      animating = true;
      cur = (n + TOTAL) % TOTAL;
      track.style.transition = 'transform 0.38s cubic-bezier(.4,0,.2,1)';
      track.style.transform  = `translateX(-${cur * fw()}px)`;
      counter.textContent    = `${cur + 1} / ${TOTAL}`;
      document.querySelectorAll('.mdot').forEach((d, i) => d.classList.toggle('on', i === cur));
      track.addEventListener('transitionend', () => { animating = false; }, { once: true });
    }

    function openModal() {
      overlay.classList.add('open');
      requestAnimationFrame(() => snap(cur));
    }

    function closeModal() {
      overlay.classList.remove('open');
      cur = 0;
      snap(0);
      counter.textContent = '1 / 8';
      document.querySelectorAll('.mdot').forEach((d, i) => d.classList.toggle('on', i === 0));
    }

    document.getElementById('openModal').onclick  = openModal;
    document.getElementById('closeModal').onclick = closeModal;
    document.getElementById('maNext').onclick     = () => goTo(cur + 1);
    document.getElementById('maPrev').onclick     = () => goTo(cur - 1);

    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'ArrowRight') goTo(cur + 1);
      if (e.key === 'ArrowLeft')  goTo(cur - 1);
      if (e.key === 'Escape')     closeModal();
    });

    window.addEventListener('resize', () => snap(cur));
    snap(0);