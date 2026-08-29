(function () {
  var forms = document.querySelectorAll('.signup-form-wrap');
  forms.forEach(function (form) {
    var status = form.parentElement.querySelector('.form-status');
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

      fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
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
