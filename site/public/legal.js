/* Módulo legal (Venezuela): política de privacidad, términos y condiciones,
   borrado de datos y casilla de consentimiento en formularios.
   Se configura con atributos data-* en la etiqueta <script> que lo carga. */
(function () {
  'use strict';
  if (window.__moduloLegal) return;
  window.__moduloLegal = true;

  var tag = document.currentScript || document.querySelector('script[src*="legal.js"]');
  var d = (tag && tag.dataset) || {};
  var marca = d.marca || 'este sitio';
  var correo = d.correo || '';
  var whatsapp = (d.whatsapp || '').replace(/\D/g, '');
  var envio = d.envio || 'whatsapp'; // whatsapp | correo | servidor
  var precios = d.precios === 'si';
  var actualizado = d.fecha || '12 de octubre de 2026';

  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = (tag && tag.src ? tag.src.replace(/legal\.js.*$/, '') : '/') + 'legal.css';
  document.head.appendChild(css);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var contactoHTML = (function () {
    var partes = [];
    if (correo) partes.push('el correo <a href="mailto:' + esc(correo) + '">' + esc(correo) + '</a>');
    if (whatsapp) partes.push('WhatsApp al <a href="https://wa.me/' + whatsapp + '" target="_blank" rel="noopener">+' + whatsapp + '</a>');
    return partes.length ? partes.join(' o ') : 'los medios de contacto que aparecen en esta página';
  })();

  var destino = {
    whatsapp: 'se envían a través de WhatsApp (servicio de Meta Platforms), donde los recibe directamente ' + esc(marca),
    correo: 'se envían por correo electrónico a ' + esc(marca),
    servidor: 'se envían por correo electrónico a ' + esc(marca) + ' mediante un proveedor de envío de correos'
  }[envio] || '';

  var TEXTOS = {
    privacidad: {
      titulo: 'Política de privacidad',
      html:
        '<p class="lg-fecha">Última actualización: ' + esc(actualizado) + '</p>' +
        '<h3>1. Quién es responsable</h3><p>' + esc(marca) + ' es responsable de los datos personales que nos facilitas a través de este sitio web. Puedes contactarnos por ' + contactoHTML + '.</p>' +
        '<h3>2. Qué datos recogemos</h3><p>Solo los que escribes en los formularios de contacto o reserva: normalmente nombre, correo electrónico, teléfono y el mensaje que nos envías. Este sitio no guarda esos datos en una base de datos propia: ' + destino + '.</p>' +
        '<h3>3. Para qué los usamos</h3><p>Únicamente para responder tu consulta, darte la información que pediste y, si corresponde, gestionar tu reserva o cita. No vendemos ni cedemos tus datos a terceros con fines comerciales y no te enviaremos publicidad sin tu permiso.</p>' +
        '<h3>4. Base legal</h3><p>Tratamos tus datos con tu consentimiento, que nos das al marcar la casilla de aceptación antes de enviar un formulario, conforme a los artículos 28 y 60 de la Constitución de la República Bolivariana de Venezuela, que protegen tu derecho a la privacidad y a conocer y controlar el uso de tus datos (habeas data).</p>' +
        '<h3>5. Cookies y analítica</h3><p>Este sitio no usa cookies de publicidad ni herramientas de seguimiento como Google Analytics o el Pixel de Meta. Solo puede usar cookies técnicas imprescindibles para que la página funcione.</p>' +
        '<h3>6. Con quién se comparten</h3><p>Con los proveedores técnicos necesarios para que el sitio funcione: el servicio de alojamiento web (Vercel) y, en su caso, el canal por el que nos llega tu mensaje. Estos proveedores pueden tratar datos fuera de Venezuela, siempre para prestar ese servicio.</p>' +
        '<h3>7. Cuánto tiempo los conservamos</h3><p>Mientras sean necesarios para atender tu solicitud o mientras dure la relación contigo. Después los eliminamos, salvo que la ley nos obligue a conservarlos.</p>' +
        '<h3>8. Tus derechos</h3><p>Puedes pedir en cualquier momento acceder a tus datos, corregirlos o eliminarlos, y retirar tu consentimiento. Escríbenos por ' + contactoHTML + ' o usa la opción <a href="#" data-legal="borrar">Borrar mis datos</a>.</p>' +
        '<h3>9. Seguridad</h3><p>Aplicamos medidas razonables para proteger tus datos. La Ley Especial contra los Delitos Informáticos sanciona el acceso indebido a la información.</p>' +
        '<h3>10. Menores de edad</h3><p>Este sitio no está dirigido a menores de 18 años. Si eres menor, pide a tu representante que nos contacte.</p>' +
        '<h3>11. Cambios</h3><p>Podemos actualizar esta política. La fecha de arriba indica la última versión.</p>'
    },
    terminos: {
      titulo: 'Términos y condiciones',
      html:
        '<p class="lg-fecha">Última actualización: ' + esc(actualizado) + '</p>' +
        '<h3>1. Aceptación</h3><p>Al usar este sitio web aceptas estos términos. Si no estás de acuerdo, te pedimos no usarlo.</p>' +
        '<h3>2. Qué ofrece el sitio</h3><p>Este sitio presenta información sobre ' + esc(marca) + ' y sus servicios, y te permite contactarnos. No se realizan compras ni pagos en línea: cualquier contratación se acuerda directamente con nosotros.</p>' +
        (precios ? '<h3>3. Precios</h3><p>Los precios que aparecen son referenciales, pueden cambiar sin previo aviso y no constituyen una oferta vinculante. El precio final se confirma por escrito antes de contratar, conforme a la normativa venezolana de protección del consumidor y precios justos.</p>' : '<h3>3. Información</h3><p>Procuramos que la información esté actualizada, pero puede contener errores u omisiones. Confírmala con nosotros antes de tomar una decisión.</p>') +
        '<h3>4. Propiedad intelectual</h3><p>Los textos, el diseño, los logotipos y las imágenes de este sitio pertenecen a ' + esc(marca) + ' o a sus autores, y están protegidos por la Ley sobre el Derecho de Autor de Venezuela. No puedes copiarlos ni usarlos con fines comerciales sin autorización.</p>' +
        '<h3>5. Uso adecuado</h3><p>Te comprometes a no usar el sitio para fines ilícitos, a no intentar acceder sin permiso a sus sistemas y a no enviar información falsa o de terceros.</p>' +
        '<h3>6. Enlaces externos</h3><p>Algunos enlaces llevan a servicios de terceros (por ejemplo WhatsApp o redes sociales). No somos responsables de sus contenidos ni de sus políticas.</p>' +
        '<h3>7. Responsabilidad</h3><p>No respondemos por interrupciones del sitio ni por daños derivados de un uso indebido. Nada de lo publicado constituye asesoramiento profesional individual.</p>' +
        '<h3>8. Ley aplicable</h3><p>Estos términos se rigen por las leyes de la República Bolivariana de Venezuela.</p>' +
        '<h3>9. Contacto</h3><p>Para cualquier duda escríbenos por ' + contactoHTML + '.</p>'
    },
    borrar: {
      titulo: 'Borrar mis datos',
      html:
        '<p>Puedes pedir que eliminemos todos los datos personales que nos hayas enviado (nombre, correo, teléfono y mensajes). Es gratis y no tienes que dar explicaciones.</p>' +
        '<p>Envíanos tu solicitud indicando el nombre y el correo o teléfono con el que nos contactaste. La atenderemos en un plazo máximo de 15 días y te confirmaremos cuando esté hecha.</p>' +
        '<div class="lg-acciones">' +
          (correo ? '<a class="lg-btn" href="mailto:' + esc(correo) + '?subject=' + encodeURIComponent('Solicitud de eliminación de mis datos') + '&body=' + encodeURIComponent('Hola, solicito que eliminen mis datos personales. Nombre: \nCorreo o teléfono con el que los contacté: ') + '">Pedir por correo</a>' : '') +
          (whatsapp ? '<a class="lg-btn" href="https://wa.me/' + whatsapp + '?text=' + encodeURIComponent('Hola, solicito que eliminen mis datos personales.') + '" target="_blank" rel="noopener">Pedir por WhatsApp</a>' : '') +
          (!correo && !whatsapp ? '<p>Escríbenos usando los medios de contacto de esta página con el asunto «Eliminar mis datos».</p>' : '') +
        '</div>'
    }
  };

  /* ---------- ficha superpuesta ---------- */
  var capa, panel, cuerpo, tituloEl, ultimoFoco;
  function crearFicha() {
    capa = document.createElement('div');
    capa.className = 'lg-capa';
    capa.hidden = true;
    capa.innerHTML =
      '<div class="lg-ficha" role="dialog" aria-modal="true" aria-labelledby="lg-titulo">' +
        '<button type="button" class="lg-cerrar" aria-label="Cerrar">&times;</button>' +
        '<h2 id="lg-titulo" class="lg-titulo"></h2>' +
        '<div class="lg-cuerpo"></div>' +
      '</div>';
    document.body.appendChild(capa);
    panel = capa.querySelector('.lg-ficha');
    cuerpo = capa.querySelector('.lg-cuerpo');
    tituloEl = capa.querySelector('.lg-titulo');
    capa.querySelector('.lg-cerrar').addEventListener('click', cerrar);
    capa.addEventListener('click', function (e) { if (e.target === capa) cerrar(); });
    document.addEventListener('keydown', function (e) { if (!capa.hidden && e.key === 'Escape') cerrar(); });
  }
  function abrir(clave) {
    var t = TEXTOS[clave]; if (!t) return;
    if (!capa) crearFicha();
    ultimoFoco = document.activeElement;
    tituloEl.textContent = t.titulo;
    cuerpo.innerHTML = t.html;
    cuerpo.scrollTop = 0;
    capa.hidden = false;
    document.documentElement.classList.add('lg-abierta');
    capa.querySelector('.lg-cerrar').focus();
  }
  function cerrar() {
    capa.hidden = true;
    document.documentElement.classList.remove('lg-abierta');
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-legal]');
    if (!a) return;
    e.preventDefault();
    abrir(a.getAttribute('data-legal'));
  });

  /* ---------- enlaces en el pie ---------- */
  function ponerEnlaces() {
    if (document.querySelector('.lg-barra')) return;
    var barra = document.createElement('div');
    barra.className = 'lg-barra';
    barra.innerHTML =
      '<a href="#" data-legal="privacidad">Política de privacidad</a>' +
      '<span aria-hidden="true">·</span><a href="#" data-legal="terminos">Términos y condiciones</a>' +
      '<span aria-hidden="true">·</span><a href="#" data-legal="borrar">Borrar mis datos</a>';
    var pies = document.querySelectorAll('footer');
    var pie = pies[pies.length - 1];
    (pie || document.body).appendChild(barra);
    if (!pie) barra.classList.add('lg-barra--suelta');
  }

  /* ---------- consentimiento en formularios ---------- */
  var n = 0;
  function prepararFormulario(f) {
    if (f.dataset.lgListo || f.closest('.lg-capa')) return;
    if (f.getAttribute('role') === 'search' || f.querySelector('input[type="search"]')) return;
    if (!f.querySelector('input:not([type="hidden"]), textarea, select')) return;
    f.dataset.lgListo = '1';
    var id = 'lg-ok-' + (++n);
    var caja = document.createElement('div');
    caja.className = 'lg-consent';
    caja.innerHTML =
      '<input type="checkbox" id="' + id + '" required>' +
      '<label for="' + id + '">He leído y acepto la <a href="#" data-legal="privacidad">política de privacidad</a> y los <a href="#" data-legal="terminos">términos</a>.</label>' +
      '<p class="lg-aviso" role="alert" hidden>Marca la casilla para poder enviar.</p>';
    var enviar = f.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
    if (enviar && enviar.parentNode) enviar.parentNode.insertBefore(caja, enviar);
    else f.appendChild(caja);
    var check = caja.querySelector('input');
    var aviso = caja.querySelector('.lg-aviso');
    check.addEventListener('change', function () { if (check.checked) aviso.hidden = true; });
    function bloquear(e) {
      if (check.checked) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      aviso.hidden = false;
      check.focus();
    }
    f.addEventListener('submit', bloquear, true);
    f.querySelectorAll('a[href*="wa.me"], a[href^="mailto:"]').forEach(function (b) {
      if (caja.contains(b)) return;
      b.addEventListener('click', bloquear, true);
    });
  }
  function revisarFormularios() { document.querySelectorAll('form').forEach(prepararFormulario); }

  function iniciar() {
    ponerEnlaces();
    revisarFormularios();
    new MutationObserver(function () { revisarFormularios(); if (!document.querySelector('.lg-barra')) ponerEnlaces(); })
      .observe(document.body, { childList: true, subtree: true });
    var h = (location.hash || '').replace('#', '');
    if (h === 'privacidad' || h === 'terminos' || h === 'borrar-datos') abrir(h === 'borrar-datos' ? 'borrar' : h);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
