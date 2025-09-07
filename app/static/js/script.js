const passwordEl = document.getElementById('password');
const meterBar = document.getElementById('meter-bar');
const label = document.getElementById('label');
const reasonsEl = document.getElementById('reasons');
const checkBtn = document.getElementById('check');

function clientEvaluate(pw){
  let score = 0;
  const reasons = [];
  if(pw.length >= 12) score += 1; else reasons.push('Use 12+ characters');
  if(/[a-z]/.test(pw)) score += 1; else reasons.push('Add lowercase');
  if(/[A-Z]/.test(pw)) score += 1; else reasons.push('Add uppercase');
  if(/[0-9]/.test(pw)) score += 1; else reasons.push('Add numbers');
  if(!/[!@#$%^&*()\-_=+\[\]{}\\|;:'",<.>/?`~]/.test(pw)) reasons.push('Add special char');

  let labelText = '—';
  if(score <= 1) labelText = 'Very Weak';
  else if(score == 2) labelText = 'Weak';
  else if(score == 3) labelText = 'Medium';
  else labelText = 'Strong';

  return {score, label: labelText, reasons};
}

function updateUI(res){
  const percent = (res.score / 4) * 100;
  meterBar.style.width = percent + '%';

  if(res.score <= 1) meterBar.style.background = '#e03131';
  else if(res.score == 2) meterBar.style.background = '#ff922b';
  else if(res.score == 3) meterBar.style.background = '#ffd43b';
  else meterBar.style.background = '#37b24d';

  label.textContent = 'Strength: ' + res.label;
  reasonsEl.innerHTML = '';
  res.reasons.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    reasonsEl.appendChild(li);
  });
}

passwordEl.addEventListener('input', e => {
  const res = clientEvaluate(e.target.value);
  updateUI(res);
});

checkBtn.addEventListener('click', async () => {
  const pw = passwordEl.value;
  const resp = await fetch('/api/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({password: pw})
  });
  const data = await resp.json();
  updateUI(data);
});
