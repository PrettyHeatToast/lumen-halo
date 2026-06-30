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

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLaunchToast();
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
