// =========================================================
//  CC.js — Criar Conta
// =========================================================

const SVG_ON  = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3" stroke-linecap="round"/></svg>`;
const SVG_OFF = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.5 10.5A3 3 0 0 0 14 14m-7.94-4.06A9.97 9.97 0 0 0 1.5 12s4 7.5 10.5 7.5c1.93 0 3.73-.52 5.27-1.44M6.53 6.53A9.97 9.97 0 0 1 12 4.5c6.5 0 10.5 7.5 10.5 7.5a18.1 18.1 0 0 1-2.59 3.41"/></svg>`;

function criarToggle(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn   = document.getElementById(btnId);
  btn.innerHTML = SVG_ON;
  btn.addEventListener('click', () => {
    if (input.type === 'password') { input.type = 'text';     btn.innerHTML = SVG_OFF; }
    else                           { input.type = 'password'; btn.innerHTML = SVG_ON;  }
  });
}

criarToggle('senhaInput',     'olhoBtn');
criarToggle('senhaConfInput', 'olhoBtnConf');

// --- Lógica de cadastro ---
const btnCriarConta = document.getElementById('btnCriarConta');
const msgErro       = document.getElementById('msgErro');
const msgSucesso    = document.getElementById('msgSucesso');

btnCriarConta.addEventListener('click', async () => {
  const nome  = document.getElementById('nomeInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();
  const senha = document.getElementById('senhaInput').value;
  const conf  = document.getElementById('senhaConfInput').value;

  msgErro.textContent    = '';
  msgSucesso.textContent = '';

  if (!nome || !email || !senha || !conf) {
    msgErro.textContent = 'Preencha todos os campos.';
    return;
  }

  if (senha !== conf) {
    msgErro.textContent = 'As senhas não coincidem.';
    return;
  }

  if (senha.length < 6) {
    msgErro.textContent = 'A senha deve ter pelo menos 6 caracteres.';
    return;
  }

  btnCriarConta.disabled    = true;
  btnCriarConta.textContent = 'Criando conta...';

  try {
    await cadastrarUsuario(nome, email, senha);
    msgSucesso.textContent = 'Conta criada com sucesso! Redirecionando...';
    setTimeout(() => { window.location.href = 'cadastro.html'; }, 1500);
  } catch (err) {
    msgErro.textContent = err.message || 'Erro ao criar conta. Tente novamente.';
  } finally {
    btnCriarConta.disabled    = false;
    btnCriarConta.textContent = 'Criar conta';
  }
});
