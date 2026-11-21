/* Global custom cursor. Loaded once per page by <script src="./cursor.js">. Mouse devices only. */
(function () {
  if (window.__bsCursor) return;
  window.__bsCursor = true;
  var mq = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!mq || !mq.matches) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLOR = '#4F6CFF';

  var css = [
    '@media (hover: hover) and (pointer: fine){html,body,a,button,input,textarea,select,label,summary,[role=button]{cursor:none !important}}',
    '#bs-cursor{position:fixed;top:0;left:0;z-index:9999;pointer-events:none;will-change:transform;opacity:0}',
    '#bs-cursor i{display:block;background:' + COLOR + ';border:0;outline:0;box-shadow:none;border-radius:0;',
    'width:clamp(14px,.95vw,22px);height:clamp(14px,.95vw,22px);',
    'transform:translate(-50%,-50%) scale(var(--sx,1),var(--sy,1));',
    'transition:' + (reduce ? 'none' : 'width .2s ease,height .2s ease,border-radius .2s ease,transform .15s ease-out') + '}',
    '#bs-cursor.is-text i{border-radius:2px;width:clamp(3px,.2vw,5px);height:clamp(18px,1.27vw,28px)}',
    '#bs-cursor.is-down i{--sx:.8;--sy:.8}',
    '#bs-cursor.is-text.is-down i{--sx:.8;--sy:.85}'
  ].join('');

  function boot() {
    var st = document.createElement('style');
    st.id = 'bs-cursor-style';
    st.textContent = css;
    document.head.appendChild(st);
    var el = document.createElement('div');
    el.id = 'bs-cursor';
    el.setAttribute('aria-hidden', 'true');
    el.appendChild(document.createElement('i'));
    document.body.appendChild(el);

    var tx = 0, ty = 0, x = 0, y = 0, seen = false, lastX = 0, lastY = 0, raf = 0, isText = false;
    var ease = reduce ? 1 : 0.15;

    function overText(px, py) {
      var hit = document.elementFromPoint(px, py);
      if (!hit || hit === el || el.contains(hit)) return false;
      if (hit.closest && hit.closest('[data-cursor="text"]')) return true;
      var tag = hit.tagName;
      if (tag === 'IMG' || tag === 'SVG' || tag === 'svg' || tag === 'VIDEO' || tag === 'CANVAS') return false;
      var walker = document.createTreeWalker(hit, NodeFilter.SHOW_TEXT, null);
      var n, count = 0, range = document.createRange();
      while ((n = walker.nextNode()) && count < 300) {
        count++;
        if (!n.nodeValue || !n.nodeValue.trim()) continue;
        range.selectNodeContents(n);
        var rects = range.getClientRects();
        for (var i = 0; i < rects.length; i++) {
          var r = rects[i];
          if (px >= r.left - 1 && px <= r.right + 1 && py >= r.top - 1 && py <= r.bottom + 1) return true;
        }
      }
      return false;
    }
    function test() {
      var t = overText(lastX, lastY);
      if (t !== isText) { isText = t; el.classList.toggle('is-text', t); }
    }
    function frame() {
      raf = 0;
      x += (tx - x) * ease; y += (ty - y) * ease;
      if (Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1) { x = tx; y = ty; }
      el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      if (x !== tx || y !== ty) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }

    document.addEventListener('mousemove', function (e) {
      lastX = tx = e.clientX; lastY = ty = e.clientY;
      if (!seen) { seen = true; x = tx; y = ty; }
      el.style.opacity = '1';
      test(); kick();
    }, { passive: true });
    document.addEventListener('scroll', function () { if (seen) test(); }, { capture: true, passive: true });
    document.addEventListener('mousedown', function () { el.classList.add('is-down'); });
    document.addEventListener('mouseup', function () { el.classList.remove('is-down'); });
    document.documentElement.addEventListener('mouseleave', function () { el.style.opacity = '0'; });
    document.documentElement.addEventListener('mouseenter', function () { if (seen) el.style.opacity = '1'; });
    window.addEventListener('blur', function () { el.classList.remove('is-down'); });
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
