'use strict';
(() => {
  const q = (s, root = document) => root.querySelector(s);
  const qq = (s, root = document) => [...root.querySelectorAll(s)];

  // Mobile menu and in-page navigation.
  const menu = q('#menu-button');
  const nav = q('#mobile-nav');
  function closeMenu() {
    if (!nav || !menu) return;
    nav.hidden = true;
    menu.setAttribute('aria-expanded', 'false');
  }
  menu?.addEventListener('click', () => {
    if (!nav) return;
    const open = nav.hidden;
    nav.hidden = !open;
    menu.setAttribute('aria-expanded', String(open));
  });
  qq('.mobile-nav a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  // FIX: Attach lazy images to the DOM BEFORE setting src.
  // Previously, onload appended the image, but off-DOM lazy images may never load.
  qq('[data-image]').forEach(slot => {
    const src = slot.dataset.image;
    if (!src) return;

    const img = document.createElement('img');
    img.alt = slot.getAttribute('aria-label') || 'ภาพประกอบโครงงาน EIRLYS';
    img.loading = 'eager';
    img.decoding = 'async';

    img.addEventListener('load', () => {
      slot.classList.add('has-media');
      q('.empty-media', slot)?.remove();
    }, { once: true });

    const candidates = slot.classList.contains('wide-media')
      ? [src, src.replace(/\.png$/i, '.jpg'), src.replace(/\.png$/i, '.jpeg'), src.replace(/\.png$/i, '.webp')]
      : [src];
    let candidate = 0;
    img.addEventListener('error', () => {
      candidate += 1;
      if (candidate < candidates.length) {
        img.src = candidates[candidate];
      } else {
        console.warn('[EIRLYS media] Image not found. Check filename/path:', candidates.join(', '));
        img.remove();
      }
    });

    // Keep the image inside the intended frame, independent of site CSS.
    slot.style.position = 'relative';
    slot.style.overflow = 'hidden';
    img.style.display = 'block';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';

    slot.appendChild(img);
    img.src = candidates[0];
  });

  // FIX: Attach video elements before starting metadata loading as well.
  qq('[data-video]').forEach(slot => {
    const src = slot.dataset.video;
    if (!src) return;

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.playsInline = true;
    video.controls = slot.dataset.mode === 'controls';
    video.muted = false;

    video.addEventListener('loadedmetadata', () => {
      slot.classList.add('has-media');
      q('.empty-media', slot)?.remove();
    }, { once: true });

    video.addEventListener('error', () => {
      console.warn('[EIRLYS media] Video not found, unreadable, or unsupported:', src);
      video.remove();
    }, { once: true });

    slot.style.position = 'relative';
    slot.style.overflow = 'hidden';
    video.style.display = 'block';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'contain';

    slot.appendChild(video);
    video.src = src;
    video.load();
  });

  // Interactive architecture data (unchanged functionality).
  const details = {
    chat: ['01 / INPUT', 'YouTube Live Chat', 'รับข้อความสาธารณะจากผู้ชมพร้อมข้อมูลที่จำเป็นสำหรับจัดการบทสนทนา และคัดเลือกข้อความเข้าสู่ระบบ'],
    queue: ['02 / MESSAGE FLOW', 'Smart Queue / Audience Rhythm', 'จัดลำดับข้อความ ลดการตอบซ้ำและกำหนดจังหวะ ไม่ให้การพูดอัตโนมัติขัดกับข้อความผู้ชม'],
    llm: ['03 / LOCAL INFERENCE', 'Qwen + LM Studio', 'ส่งข้อความและบริบทที่อนุญาตไปยัง Local Language Model เพื่อสร้างคำตอบ โดยความเร็วขึ้นอยู่กับฮาร์ดแวร์และความยาวคำตอบ'],
    guard: ['04 / RESPONSE CHECK', 'Response & Emotion Guard', 'ตรวจรูปแบบผลลัพธ์และข้อมูลอารมณ์ก่อนเข้าสู่เสียงสังเคราะห์ เพื่อช่วยลดคำตอบผิดรูปแบบ'],
    tts: ['05 / AUDIO', 'ElevenLabs Text-to-Speech', 'แปลงข้อความเป็นเสียงสังเคราะห์ จากนั้นส่งผ่าน Audio Routing เพื่อใช้งานร่วมกับ VNyan'],
    vnyan: ['06 / AVATAR & STREAM', 'VNyan → OBS → YouTube', 'ควบคุม Lip Sync, สีหน้า, ดวงตา และท่าทาง พร้อมส่งภาพ/เสียงไปยัง OBS เพื่อออกอากาศ']
  };
  qq('[data-arch]').forEach(b => b.addEventListener('click', () => {
    qq('[data-arch]').forEach(x => x.classList.toggle('active', x === b));
    const d = details[b.dataset.arch];
    if (!d) return;
    const type = q('#arch-type'), title = q('#arch-title'), desc = q('#arch-desc');
    if (type) type.textContent = d[0];
    if (title) title.textContent = d[1];
    if (desc) desc.textContent = d[2];
  }));

  // Scroll animations, as in the original site.
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-revealed');
        observer.unobserve(e.target);
      }
    }), { threshold: .07 });
    qq('[data-reveal]').forEach(el => {
      el.classList.add('will-reveal');
      observer.observe(el);
    });
  }
 // Switch only the Project Overview video between fill and full-frame view.
 const featuredPanel=q('.about-layout .video-panel');
 const fitSwitch=featuredPanel?.querySelector('.media-fit-toggle');
 fitSwitch?.addEventListener('click',()=>{
   const full=featuredPanel.classList.toggle('show-full-video');
   fitSwitch.textContent=full?'FILL FRAME':'SHOW FULL VIDEO';
   fitSwitch.setAttribute('aria-pressed',String(full));
 });
})();
