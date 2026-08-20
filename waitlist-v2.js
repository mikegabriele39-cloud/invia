(() => {
  const form = document.getElementById('waitlistForm');
  if (!form) return;

  const emailInput = document.getElementById('waitlistEmail');
  const status = document.getElementById('waitlistStatus');
  const interestError = document.getElementById('waitlistInterestError');
  const submit = document.getElementById('waitlistSubmit');
  const success = document.getElementById('waitlistSuccess');
  const successInterests = document.getElementById('waitlistSuccessInterests');
  const again = document.getElementById('waitlistAgain');
  const selectAll = document.getElementById('waitlistSelectAll');
  const options = Array.from(form.querySelectorAll('input[name="interests"]'));

  const SUPABASE_URL = 'https://ibwwdsnlbwvuyhfdasdj.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_nXg3n9IgxQTveiYLCd1CQA_y9cNWdnV';

  function selectedInterests() {
    return options.filter(option => option.checked).map(option => option.value);
  }

  function refreshSelectAllLabel() {
    if (!selectAll) return;
    const allSelected = options.length > 0 && options.every(option => option.checked);
    selectAll.textContent = allSelected ? 'Clear all' : 'Select all three';
  }

  options.forEach(option => option.addEventListener('change', () => {
    if (interestError) interestError.textContent = '';
    refreshSelectAllLabel();
  }));

  selectAll?.addEventListener('click', () => {
    const shouldSelect = !options.every(option => option.checked);
    options.forEach(option => { option.checked = shouldSelect; });
    if (interestError) interestError.textContent = '';
    refreshSelectAllLabel();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    const email = String(emailInput?.value || '').trim().toLowerCase();
    const interests = selectedInterests();

    if (!interests.length) {
      if (interestError) interestError.textContent = 'Choose at least one shirt.';
      options[0]?.focus();
      return;
    }

    if (!email || !emailInput?.checkValidity()) {
      if (status) {
        status.textContent = 'Enter a valid email address.';
        status.className = 'waitlist-status error';
      }
      emailInput?.focus();
      return;
    }

    if (interestError) interestError.textContent = '';
    if (status) {
      status.textContent = '';
      status.className = 'waitlist-status';
    }
    submit.disabled = true;
    submit.classList.add('loading');
    const submitLabel = submit.querySelector('span');
    if (submitLabel) submitLabel.textContent = 'Joining...';

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/Waitlist`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ email, interests })
      });

      if (response.ok) {
        form.hidden = true;
        success.hidden = false;
        if (successInterests) successInterests.textContent = `Interested in: ${interests.join(' · ')}`;
        localStorage.setItem('inviaWaitlistJoined', 'true');
        return;
      }

      const text = await response.text();
      if (response.status === 409 || /duplicate|unique/i.test(text)) {
        if (status) {
          status.textContent = 'That email is already on the waitlist.';
          status.className = 'waitlist-status note';
        }
      } else if (/interests|column/i.test(text)) {
        console.error('INVIA waitlist schema error:', response.status, text);
        if (status) {
          status.textContent = 'Almost ready — the interest field still needs to be enabled in the waitlist database.';
          status.className = 'waitlist-status error';
        }
      } else {
        console.error('INVIA waitlist error:', response.status, text);
        if (status) {
          status.textContent = 'Couldn’t join right now. Please try again.';
          status.className = 'waitlist-status error';
        }
      }
    } catch (error) {
      console.error('INVIA waitlist network error:', error);
      if (status) {
        status.textContent = 'Connection issue. Please try again.';
        status.className = 'waitlist-status error';
      }
    } finally {
      submit.disabled = false;
      submit.classList.remove('loading');
      if (submitLabel) submitLabel.textContent = 'Join Waitlist';
    }
  }, true);

  again?.addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    form.reset();
    if (interestError) interestError.textContent = '';
    if (status) {
      status.textContent = '';
      status.className = 'waitlist-status';
    }
    if (successInterests) successInterests.textContent = '';
    refreshSelectAllLabel();
    options[0]?.focus();
  });

  refreshSelectAllLabel();
})();
