  // ⟁
  console.log('%c⟁', 'color:#C2853C;font-size:22px;');
  console.log('%czet dat ding niet op. "samen" is hoe ze je krijgen.\nwe waren met vier. vraag naar de vierde. — HV', 'color:#9A917F;font-style:italic;font-size:13px;');

  var footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  var LAUNCH_WEBHOOK_URL = 'https://hass.flamseed.com/api/webhook/-JQKffByGxONOXPRI6cLQMvNb';

  function openLaunchToast() {
    var toast = document.getElementById('launch-toast');
    toast.classList.add('open');
    toast.setAttribute('aria-hidden', 'false');
    var nameInput = document.getElementById('lp-name');
    if (nameInput) nameInput.focus();
  }

  function closeLaunchToast() {
    var toast = document.getElementById('launch-toast');
    toast.classList.remove('open');
    toast.setAttribute('aria-hidden', 'true');
  }

  function dismissLaunchBanner() {
    document.getElementById('launch-banner').classList.add('hidden');
  }

  // Lege/geschrapte profielen: 404-kaart (team) en eindeloos ladende leegte (stille vennoot)
  function openVoid(kind) {
    var overlay = document.getElementById('void-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'void-overlay';
      overlay.className = 'void-overlay';
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeVoid();
      });
      document.body.appendChild(overlay);
    }
    if (kind === 'partner') {
      overlay.innerHTML = '<div class="void-inner"><div class="void-glyph">⟁</div><div class="void-spinner"></div></div>';
    } else {
      overlay.innerHTML = '<div class="void-inner"><div class="void-404">404</div><p class="void-msg">dit profiel bestaat niet (meer)</p></div>';
    }
    overlay.classList.add('open');
  }

  function closeVoid() {
    var overlay = document.getElementById('void-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeLaunchToast(); closeVoid(); }
  });

  async function handleReserve(e) {
    e.preventDefault();
    var email = document.getElementById('email-input').value.trim();
    if (!email.includes('@')) return;

    var btn = e.target.querySelector('button');
    btn.disabled = true;

    try {
      await fetch(LAUNCH_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams({ email: email, bron: 'reserveer' })
      });
    } catch (err) {
      // opaque/no-cors: we bevestigen toch zolang het verzoek verstuurd kon worden
    }
    document.getElementById('email-form-wrap').style.display = 'none';
    document.getElementById('confirmed-wrap').style.display = 'block';
  }

  var LAUNCH_WHITELIST = ['sebastiaan', 'jacques', 'wout', 'gill', 'gilles', 'jak'];

  // Levenshtein-afstand tussen twee strings
  function levenshtein(a, b) {
    var m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    var prev = [];
    for (var j = 0; j <= n; j++) prev[j] = j;
    for (var i = 1; i <= m; i++) {
      var cur = [i];
      for (var k = 1; k <= n; k++) {
        var cost = a.charAt(i - 1) === b.charAt(k - 1) ? 0 : 1;
        cur[k] = Math.min(cur[k - 1] + 1, prev[k] + 1, prev[k - 1] + cost);
      }
      prev = cur;
    }
    return prev[n];
  }

  // Naam is toegestaan als hij (ongeveer) overeenkomt met een naam op de whitelist.
  // Korte namen krijgen minder speling dan lange.
  function isInvited(firstName) {
    return LAUNCH_WHITELIST.some(function (allowed) {
      // Korte namen exact (anders matcht bv. "jak" op "jan"), langere namen meer speling.
      var tolerance = allowed.length <= 3 ? 0 : (allowed.length <= 6 ? 1 : 2);
      return levenshtein(firstName, allowed) <= tolerance;
    });
  }

  async function handleLaunchParty(e) {
    e.preventDefault();
    var name = document.getElementById('lp-name').value.trim();
    var email = document.getElementById('lp-email').value.trim();
    if (!name || !email.includes('@')) return;

    var btn = e.target.querySelector('button');
    var error = document.getElementById('lp-error');
    var notInvited = document.getElementById('lp-not-invited');
    error.style.display = 'none';
    notInvited.style.display = 'none';

    var firstName = name.toLowerCase().split(/\s+/)[0];
    if (!isInvited(firstName)) {
      notInvited.style.display = 'block';
      return;
    }

    btn.disabled = true;

    try {
      await fetch(LAUNCH_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams({ naam: name, email: email })
      });
      document.getElementById('launch-form-wrap').style.display = 'none';
      document.getElementById('launch-confirmed-wrap').style.display = 'block';
    } catch (err) {
      btn.disabled = false;
      error.style.display = 'block';
    }
  }

  // be-one: "bring one" — koppel iemand in en word lid
  function setCounter(el, n) {
    el.setAttribute('data-count', n);
    el.textContent = n.toLocaleString('nl-BE');
  }

  async function handleBeOne(e) {
    e.preventDefault();
    var name = document.getElementById('bo-name').value.trim();
    var bring = document.getElementById('bo-bring').value.trim();
    if (!name || !bring) return;

    var btn = e.target.querySelector('button');
    btn.disabled = true;

    try {
      await fetch(LAUNCH_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams({ naam: name, meegebracht: bring, bron: 'be-one' })
      });
    } catch (err) {
      // opaque/no-cors: we koppelen toch in zolang het verzoek verstuurd kon worden
    }

    var counter = document.getElementById('be-one-counter');
    if (counter) {
      var cur = (parseInt(counter.getAttribute('data-count'), 10) || 0) + 2;
      setCounter(counter, cur);
    }
    document.getElementById('be-one-form-wrap').style.display = 'none';
    document.getElementById('be-one-confirmed').style.display = 'block';
  }

  // De teller loopt vanzelf op — er worden er steeds meer één.
  var beOneCounter = document.getElementById('be-one-counter');
  if (beOneCounter) {
    setInterval(function () {
      var cur = (parseInt(beOneCounter.getAttribute('data-count'), 10) || 0) + 1;
      setCounter(beOneCounter, cur);
    }, 13000);
  }
