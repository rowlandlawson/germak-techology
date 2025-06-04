
  const termsCheckbox = document.getElementById('terms');
  const registerBtn = document.getElementById('registerBtn');

  termsCheckbox.addEventListener('change', function () {
    if (this.checked) {
      registerBtn.disabled = false;
      registerBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      registerBtn.classList.add('hover:from-blue-700', 'hover:to-emerald-700');
    } else {
      registerBtn.disabled = true;
      registerBtn.classList.add('opacity-50', 'cursor-not-allowed');
      registerBtn.classList.remove('hover:from-blue-700', 'hover:to-emerald-700');
    }
  });