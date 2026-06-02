// =========================================================
//  cadastro.js — Login
// =========================================================

const SVG_ON  = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3" stroke-linecap="round"/></svg>`;
const SVG_OFF = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.5 10.5A3 3 0 0 0 14 14m-7.94-4.06A9.97 9.97 0 0 0 1.5 12s4 7.5 10.5 7.5c1.93 0 3.73-.52 5.27-1.44M6.53 6.53A9.97 9.97 0 0 1 12 4.5c6.5 0 10.5 7.5 10.5 7.5a18.1 18.1 0 0 1-2.59 3.41"/></svg>`;

const input = document.getElementById('senhaInput');
const btn   = document.getElementById('olhoBtn');
btn.innerHTML = SVG_ON;
btn.addEventListener('click', () => {
  if (input.type === 'password') { input.type = 'text';     btn.innerHTML = SVG_OFF; }
  else                           { input.type = 'password'; btn.innerHTML = SVG_ON;  }
});

// --- Lógica de login ---
const btnEntrar  = document.getElementById('btnEntrar');
const msgErro    = document.getElementById('msgErro');

btnEntrar.addEventListener('click', async () => {
  const email = document.getElementById('emailInput').value.trim();
  const senha = document.getElementById('senhaInput').value;

  msgErro.textContent = '';

  if (!email || !senha) {
    msgErro.textContent = 'Preencha todos os campos.';
    return;
  }

  btnEntrar.disabled    = true;
  btnEntrar.textContent = 'Entrando...';

  try {
    const usuario = await loginUsuario(email, senha);
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
    window.location.href = 'index2.html';
  } catch (err) {
    msgErro.textContent = err.message || 'Erro ao fazer login. Tente novamente.';
  } finally {
    btnEntrar.disabled    = false;
    btnEntrar.textContent = 'Entrar';
  }
});
