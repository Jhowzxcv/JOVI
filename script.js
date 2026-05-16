'use strict';
/* =========================================================
   FOCO — script.js
   Sprint 2 — Web Development
   Vanilla JS puro, sem frameworks ou bibliotecas externas
   ========================================================= */

/* ===========================
   VARIAVEIS E CONSTANTES
   =========================== */
var APP_NOME = 'Foco';
var APP_VERSAO = '1.0-beta';
var SLIDES_DATA = [
  { titulo: 'Modo Camera',      descricao: 'Aponte para o slide. O modo Estudo ativa automaticamente.', cor: '#6E0FB5', icone: '📷' },
  { titulo: 'Resumo Automatico', descricao: 'Da foto ao resumo estruturado em menos de 3 segundos com IA.', cor: '#FF0066', icone: '📄' },
  { titulo: 'Flashcards',       descricao: 'Algoritmo FSRS agenda a revisao certa no momento certo.', cor: '#4a6900', icone: '🃏' },
  { titulo: 'Seu Progresso',    descricao: 'Graficos por materia mostram onde voce evolui e onde precisa de reforco.', cor: '#0A0A0A', icone: '📊' }
];

var slideAtual = 0;
var totalSlides = SLIDES_DATA.length;
var autoplayTimer = null;
var AUTOPLAY_INTERVALO = 3800;

/* ===========================
   SLIDESHOW
   =========================== */
function iniciarSlideshow() {
  var wrapper = document.querySelector('.slideshow-wrapper');
  if (!wrapper) return;

  var track    = wrapper.querySelector('.slideshow-track');
  var dotsCont = wrapper.querySelector('.slideshow-dots');
  var btnAnt   = wrapper.querySelector('.slide-btn--anterior');
  var btnProx  = wrapper.querySelector('.slide-btn--proximo');

  SLIDES_DATA.forEach(function(dado, i) {
    var fig = document.createElement('figure');
    fig.className = 'slide' + (i === 0 ? ' slide--ativo' : '');
    fig.setAttribute('aria-label', 'Tela ' + (i+1) + ': ' + dado.titulo);

    var tela = document.createElement('div');
    tela.className = 'slide-tela';
    tela.style.background = dado.cor;

    var ico = document.createElement('span');
    ico.className = 'slide-icone';
    ico.setAttribute('aria-hidden', 'true');
    ico.textContent = dado.icone;

    var cap = document.createElement('figcaption');
    cap.className = 'slide-figcaption';

    var tit = document.createElement('strong');
    tit.className = 'slide-titulo';
    tit.textContent = dado.titulo;

    var desc = document.createElement('p');
    desc.className = 'slide-desc';
    desc.textContent = dado.descricao;

    cap.appendChild(tit);
    cap.appendChild(desc);
    tela.appendChild(ico);
    fig.appendChild(tela);
    fig.appendChild(cap);
    track.appendChild(fig);
  });

  SLIDES_DATA.forEach(function(_, i) {
    var dot = document.createElement('button');
    dot.className = 'slide-dot' + (i === 0 ? ' slide-dot--ativo' : '');
    dot.setAttribute('aria-label', 'Slide ' + (i+1) + ' de ' + totalSlides);
    dot.setAttribute('type', 'button');
    dot.addEventListener('click', function() { irParaSlide(i); });
    dotsCont.appendChild(dot);
  });

  if (btnAnt)  btnAnt.addEventListener('click',  function() { irParaSlide(slideAtual - 1); });
  if (btnProx) btnProx.addEventListener('click', function() { irParaSlide(slideAtual + 1); });

  var touchX = 0;
  track.addEventListener('touchstart', function(e) { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   function(e) {
    var diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) irParaSlide(diff > 0 ? slideAtual + 1 : slideAtual - 1);
  });

  iniciarAutoplay();
}

function irParaSlide(n) {
  var slides = document.querySelectorAll('.slide');
  var dots   = document.querySelectorAll('.slide-dot');
  if (!slides.length) return;

  slides[slideAtual].classList.remove('slide--ativo');
  if (dots[slideAtual]) dots[slideAtual].classList.remove('slide-dot--ativo');

  slideAtual = ((n % totalSlides) + totalSlides) % totalSlides;

  slides[slideAtual].classList.add('slide--ativo');
  if (dots[slideAtual]) dots[slideAtual].classList.add('slide-dot--ativo');

  reiniciarAutoplay();
}

function iniciarAutoplay()  { autoplayTimer = setInterval(function() { irParaSlide(slideAtual + 1); }, AUTOPLAY_INTERVALO); }
function reiniciarAutoplay() { clearInterval(autoplayTimer); iniciarAutoplay(); }

/* ===========================
   MANIPULACAO DE STRINGS
   =========================== */
function validarEmail(email) {
  var limpo = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpo);
}

function contemApenasLetras(str) {
  var semAcento = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return /^[a-zA-Z\s]+$/.test(semAcento);
}

function capitalizarPalavra(p) { return p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : p; }

function formatarNome(nome) {
  return nome.trim().split(' ').map(capitalizarPalavra).join(' ');
}

function obterPrimeiroNome(nome) {
  var partes = nome.trim().split(' ');
  return partes[0] ? capitalizarPalavra(partes[0]) : 'Estudante';
}

/* ===========================
   VALIDACAO DE FORMULARIO
   =========================== */
function iniciarValidacaoForm() {
  var form = document.querySelector('.contact-form');
  if (!form) return;

  var campoNome    = form.querySelector('#name');
  var campoEmail   = form.querySelector('#email');
  var campoMsg     = form.querySelector('#message');

  if (campoEmail) {
    campoEmail.addEventListener('blur', function() {
      if (campoEmail.value.trim() && !validarEmail(campoEmail.value)) {
        mostrarErroCampo(campoEmail, 'E-mail invalido. Ex: nome@dominio.com');
      } else {
        limparErroCampo(campoEmail);
      }
    });
  }
  if (campoNome) { campoNome.addEventListener('input', function() { limparErroCampo(campoNome); }); }
  if (campoMsg)  { campoMsg.addEventListener('input',  function() { limparErroCampo(campoMsg); }); }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    limparTodosErros(form);

    var nome  = campoNome  ? campoNome.value.trim()  : '';
    var email = campoEmail ? campoEmail.value.trim() : '';
    var msg   = campoMsg   ? campoMsg.value.trim()   : '';
    var erros = [];

    if (nome.length < 3) {
      mostrarErroCampo(campoNome, 'Nome muito curto. Minimo 3 caracteres.');
      erros.push('Nome invalido');
    } else if (!contemApenasLetras(nome)) {
      mostrarErroCampo(campoNome, 'O nome nao deve conter numeros ou simbolos.');
      erros.push('Nome com caracteres invalidos');
    }

    if (!validarEmail(email)) {
      mostrarErroCampo(campoEmail, 'Informe um e-mail valido. Ex: nome@email.com');
      erros.push('E-mail invalido');
    }

    if (msg.length < 10) {
      mostrarErroCampo(campoMsg, 'A mensagem deve ter pelo menos 10 caracteres.');
      erros.push('Mensagem muito curta');
    }

    if (erros.length > 0) {
      alert(
        'ATENCAO — ' + APP_NOME + ' encontrou ' + erros.length + ' erro(s):\n\n' +
        erros.map(function(er, i) { return (i+1) + '. ' + er; }).join('\n') +
        '\n\nCorrija os campos e tente novamente.'
      );
      return;
    }

    var nomeFormatado = formatarNome(nome);
    var primeiroNome  = obterPrimeiroNome(nomeFormatado);
    var btn = form.querySelector('button[type=submit]');

    if (btn) {
      var textoOrig = btn.textContent;
      btn.textContent = 'Enviando...';
      btn.disabled = true;

      setTimeout(function() {
        btn.textContent = 'Mensagem enviada!';
        alert(
          'Mensagem enviada com sucesso!\n\n' +
          'Ola, ' + primeiroNome + '! Recebemos seu contato.\n' +
          'Responderemos em ate 24h para: ' + email
        );
        setTimeout(function() {
          btn.textContent = textoOrig;
          btn.disabled = false;
          form.reset();
          limparTodosErros(form);
        }, 2000);
      }, 800);
    }
  });
}

function mostrarErroCampo(campo, msg) {
  if (!campo) return;
  campo.style.borderBottomColor = '#FF0066';
  campo.setAttribute('aria-invalid', 'true');
  var el = campo.parentNode.querySelector('.erro-campo');
  if (!el) { el = document.createElement('span'); el.className = 'erro-campo'; el.setAttribute('role','alert'); campo.parentNode.appendChild(el); }
  el.textContent = '! ' + msg;
}

function limparErroCampo(campo) {
  if (!campo) return;
  campo.style.borderBottomColor = '';
  campo.removeAttribute('aria-invalid');
  var el = campo.parentNode.querySelector('.erro-campo');
  if (el) el.remove();
}

function limparTodosErros(form) {
  form.querySelectorAll('.erro-campo').forEach(function(el) { el.remove(); });
  form.querySelectorAll('input, textarea, select').forEach(function(el) {
    el.style.borderBottomColor = '';
    el.removeAttribute('aria-invalid');
  });
}

/* ===========================
   PROMPT — BETA SIGNUP
   =========================== */
function iniciarPromptBeta() {
  document.querySelectorAll('a.btn').forEach(function(btn) {
    var texto = btn.textContent.toLowerCase().trim();
    if (texto.indexOf('beta') === -1 && texto.indexOf('quero o app') === -1) return;

    btn.addEventListener('click', function(e) {
      var destino = btn.getAttribute('href');
      if (!destino || destino === '#') return;

      e.preventDefault();

      var curso = prompt(
        APP_NOME + ' — Lista de espera do Beta\n\n' +
        'Qual e o seu curso universitario?\n' +
        '(Ex: Engenharia de Software, Medicina, Administracao...)'
      );

      if (curso === null) return;

      var cursoLimpo = curso.trim();
      if (cursoLimpo.length < 2) {
        alert('Por favor, informe seu curso para continuar.\nExemplo: Engenharia de Software');
        return;
      }

      sessionStorage.setItem('foco_curso', cursoLimpo);

      alert(
        'Tudo certo!\n\n' +
        'Curso registrado: ' + cursoLimpo + '\n' +
        'Preencha o formulario para garantir sua vaga no ' + APP_NOME + ' beta.'
      );

      window.location.href = destino;
    });
  });
}

function preencherCursoSessao() {
  var curso = sessionStorage.getItem('foco_curso');
  var campo = document.querySelector('#institution');
  if (curso && campo && campo.value === '') {
    campo.value = curso;
    campo.style.borderBottomColor = 'var(--brand)';
  }
}

/* ===========================
   ANIMACAO DE CONTADORES
   =========================== */
function iniciarContadores() {
  var stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;

  if (!('IntersectionObserver' in window)) { stats.forEach(animarContador); return; }

  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { animarContador(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });

  stats.forEach(function(el) { obs.observe(el); });
}

function animarContador(el) {
  var original = el.innerHTML;
  var match = original.match(/(\d+)/);
  if (!match) return;

  var fim   = parseInt(match[1], 10);
  var atual = 0;
  var frames = 80;
  var frame  = 0;

  el.style.opacity = '0.3';

  var timer = setInterval(function() {
    frame++;
    var easeOut = 1 - Math.pow(1 - (frame / frames), 3);
    atual = Math.round(fim * easeOut);
    el.innerHTML = original.replace(match[1], String(atual));

    if (frame >= frames) {
      el.innerHTML = original;
      el.style.opacity = '1';
      clearInterval(timer);
    }
  }, 16);
}

/* ===========================
   SCROLL REVEAL
   =========================== */
function iniciarReveal() {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) { els.forEach(function(el) { el.classList.add('in'); }); return; }

  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { entry.target.classList.add('in'); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  els.forEach(function(el) { obs.observe(el); });
}

/* ===========================
   FAQ ACCORDION
   =========================== */
function iniciarFAQ() {
  document.querySelectorAll('.faq-item').forEach(function(item) {
    var btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', function() {
      var aberto = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(el) { el.classList.remove('open'); });
      if (!aberto) item.classList.add('open');
    });
  });
}

/* ===========================
   MENU MOBILE
   =========================== */
function iniciarMenuMobile() {
  var toggle = document.querySelector('.btn-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', function() {
    var aberto = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  });

  navLinks.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ===========================
   MARQUEE
   =========================== */
function iniciarMarquee() {
  document.querySelectorAll('.marquee-track').forEach(function(track) {
    track.innerHTML += track.innerHTML;
  });
}

/* ===========================
   CONTADOR DE CARACTERES
   =========================== */
function iniciarContadorCaracteres() {
  var textarea = document.querySelector('#message');
  if (!textarea) return;
  var span = document.createElement('span');
  span.className = 'char-contador';
  span.style.cssText = 'font-size:11px;color:var(--muted);display:block;margin-top:4px;font-family:var(--font-mono);';
  span.textContent = '0 caracteres (minimo 10)';
  textarea.parentNode.appendChild(span);

  textarea.addEventListener('input', function() {
    var n = textarea.value.trim().length;
    span.textContent = n + ' caracteres (minimo 10)';
    span.style.color = n >= 10 ? 'var(--brand)' : 'var(--accent)';
  });
}

/* ===========================
   INICIALIZACAO
   =========================== */
document.addEventListener('DOMContentLoaded', function() {
  iniciarReveal();
  iniciarMenuMobile();
  iniciarMarquee();
  iniciarSlideshow();
  iniciarValidacaoForm();
  iniciarPromptBeta();
  iniciarContadores();
  iniciarFAQ();
  iniciarContadorCaracteres();
  preencherCursoSessao();
  console.log('[' + APP_NOME + ' v' + APP_VERSAO + '] Iniciado com sucesso.');
});
