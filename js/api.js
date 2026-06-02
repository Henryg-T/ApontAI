// =========================================================
//  api.js — Configuração central da API ApontaAí
//  Troque a BASE_URL pela URL do ngrok quando reiniciar
// =========================================================

const BASE_URL = 'https://gully-tag-skirmish.ngrok-free.dev';

const HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};

// Cadastrar novo usuário
async function cadastrarUsuario(nome, email, senha) {
  const response = await fetch(`${BASE_URL}/slidesGestus`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ nome, email, senha })
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.message || 'Erro ao cadastrar usuário');
  }

  return await response.json();
}

// Login — busca usuário pelo email e valida senha no frontend
// (para validação real no backend, seria necessário uma rota de login dedicada)
async function loginUsuario(email, senha) {
  const response = await fetch(`${BASE_URL}/slidesGestus`, {
    method: 'GET',
    headers: HEADERS
  });

  if (!response.ok) {
    throw new Error('Erro ao conectar com o servidor');
  }

  const usuarios = await response.json();
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (!usuario) {
    throw new Error('E-mail ou senha incorretos');
  }

  return usuario;
}
