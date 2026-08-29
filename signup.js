(function () {
  var STORAGE_KEY = 'btSignupDone';

  function hasAlreadySignedUp() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function rememberSignedUp() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {
      // localStorage unavailable (private mode, blocked, etc.) — not critical, just skip remembering
    }
  }

  function showAlreadySubmitted(form, status) {
    form.style.display = 'none';
    if (status) {
      status.textContent = "You're already on the list — we'll email you the moment Budget Tracker launches.";
      status.className = 'form-status success';
    }
  }

  var forms = document.querySelectorAll('.signup-form-wrap');
  forms.forEach(function (form) {
    var status = form.parentElement.querySelector('.form-status');

    if (hasAlreadySignedUp()) {
      showAlreadySubmitted(form, status);
      return;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var button = form.querySelector('button');
      var honeypot = form.querySelector('.hp-field');
      if (honeypot && honeypot.checked) return; // bot caught by honeypot

      button.disabled = true;
      button.textContent = 'Sending…';
      if (status) {
        status.textContent = '';
        status.className = 'form-status';
      }

      var formData = new FormData(form);
      // Explicitly record both consent choices as clear Yes/No — never omitted, never ambiguous.
      var privacyTermsBox = form.querySelector('input[name="privacy_terms_agreement"]');
      var promoBox = form.querySelector('input[name="promotional_email_optin"]');
      formData.set('privacy_terms_agreement', privacyTermsBox && privacyTermsBox.checked ? 'Yes' : 'No');
      formData.set('promotional_email_optin', promoBox && promoBox.checked ? 'Yes' : 'No');
      // Client-reported submission time (browser clock, not server-verified — see Privacy Policy).
      formData.set('submitted_at_client', new Date().toISOString());

      fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            rememberSignedUp();
            form.reset();
            form.style.display = 'none';
            if (status) {
              status.textContent = "Thanks — we'll email you the moment Budget Tracker launches.";
              status.className = 'form-status success';
            }
          } else {
            throw new Error(data.message || 'Submission failed');
          }
        })
        .catch(function () {
          button.disabled = false;
          button.textContent = 'Get notified';
          if (status) {
            status.textContent = 'Something went wrong — email us directly at bramoralabsupport@gmail.com instead.';
            status.className = 'form-status error';
          }
        });
    });
  });
})();
