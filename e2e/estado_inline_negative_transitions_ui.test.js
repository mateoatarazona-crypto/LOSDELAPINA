const puppeteer = require('puppeteer');

(async () => {
  const baseUrl = 'http://localhost:3000';
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1280, height: 900 }, protocolTimeout: 120000 });
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(60000);

  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  // Captura y auto-aceptación de diálogos nativos para evitar bloqueo del runtime
  let lastDialogMessage = null;
  page.on('dialog', async (dlg) => {
    try { lastDialogMessage = dlg.message(); } catch (_) { lastDialogMessage = null; }
    try { await dlg.accept(); } catch (_) {}
  });

  async function tagEstadoRow() {
    const tagged = await page.$$eval('div.flex.items-center.gap-2', (nodes) => {
      for (const n of nodes) {
        const strong = n.querySelector('strong');
        const strongText = strong ? strong.textContent.trim() : '';
        if (strongText.startsWith('Estado:')) {
          n.setAttribute('data-e2e-estado-row', '1');
          return true;
        }
      }
      return false;
    });
    if (!tagged) throw new Error('No se pudo etiquetar la fila de Estado');
  }

  async function findEstadoRow() {
    await page.waitForSelector('div.flex.items-center.gap-2');
    await tagEstadoRow();
    const row = await page.$('[data-e2e-estado-row="1"]');
    if (!row) throw new Error('Fila Estado no encontrada tras etiquetar');
    return row;
  }

  async function getChipTextInRow(row) {
    const chip = await row.$('span.rounded-full');
    if (!chip) return '';
    return (await page.evaluate(el => el.textContent ? el.textContent.trim() : '', chip));
  }

  async function clickButtonInRow(textOrStartsWith) {
    // Evitar evaluate de página; usar ElementHandles y evaluar texto de cada botón
    const row = await findEstadoRow();
    const btns = await row.$$('button');
    let target = null;
    const isStarts = typeof textOrStartsWith === 'string' && textOrStartsWith.endsWith('*');
    const label = isStarts ? textOrStartsWith.slice(0, -1) : textOrStartsWith;
    for (const b of btns) {
      const txt = await page.evaluate(el => (el.textContent || '').trim(), b);
      if ((isStarts && txt.startsWith(label)) || (!isStarts && txt === label)) {
        target = b;
        break;
      }
    }
    if (!target) throw new Error(`Botón ${textOrStartsWith} no encontrado en fila`);
    // Asegurar scroll al centro y click estable
    try { await target.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' })); } catch (_) {}
    await target.click({ delay: 10 });
  }

  async function clickGuardarInRow() {
    await clickButtonInRow('Guardar*');
    try { await page.waitForSelector('[data-e2e-estado-row="1"] select', { timeout: 5000, hidden: true }); } catch (_) {}
  }

  async function clickEditarInRow() {
    await clickButtonInRow('Editar');
    await page.waitForSelector('[data-e2e-estado-row="1"] select', { timeout: 10000 });
  }

  async function clickCancelarInRow() {
    await clickButtonInRow('Cancelar');
    try { await page.waitForSelector('[data-e2e-estado-row="1"] select', { timeout: 5000, hidden: true }); } catch (_) {}
  }

  async function setSelectValueInRow(row, value) {
    await page.waitForSelector('[data-e2e-estado-row="1"] select', { timeout: 10000 });

    const resolved = await page.evaluate((v) => {
      const r = document.querySelector('[data-e2e-estado-row="1"]');
      const s = r ? r.querySelector('select') : null;
      if (!s) return null;
      const opt = Array.from(s.options).find(o => o.value === v || (o.textContent || '').trim() === v);
      return opt ? opt.value : null;
    }, value);

    if (!resolved) throw new Error(`Opción no disponible en select: ${value}`);

    await page.select('[data-e2e-estado-row="1"] select', resolved);

    await page.waitForFunction((v) => {
      const r = document.querySelector('[data-e2e-estado-row="1"]');
      const select = r ? r.querySelector('select') : null;
      return !!select && select.value === v;
    }, {}, resolved);
  }

  async function getSelectOptionsInRow(row) {
    await page.waitForSelector('[data-e2e-estado-row="1"] select', { timeout: 10000 });
    const sel = await page.$('[data-e2e-estado-row="1"] select');
    if (!sel) throw new Error('Select no encontrado en fila');
    return await page.evaluate((s) => Array.from(s.options).map(o => ({ value: o.value, text: (o.textContent || '').trim() })), sel);
  }

  // Helper: esperar un diálogo (alert/confirm) y devolver su mensaje; acepta automáticamente
  async function waitForDialogMessage(timeout = 15000) {
    const end = Date.now() + timeout;
    const startSeen = lastDialogMessage;
    while (Date.now() < end) {
      if (lastDialogMessage && lastDialogMessage !== startSeen) return lastDialogMessage;
      await sleep(100);
    }
    return lastDialogMessage && lastDialogMessage !== startSeen ? lastDialogMessage : null;
  }

  // Preparar dato de prueba: duplicar la fecha 1 para trabajar con un evento controlado y estado inicial del seed
  await page.goto(`${baseUrl}/fechas/1`, { waitUntil: 'networkidle2' });
  const duplicatedId = await page.evaluate(async () => {
    try {
      const res = await fetch(`/api/fechas/1/duplicate`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ override: { estado: 'Contratada' } })
      });
      const data = await res.json().catch(() => ({}));
      return data && data.id ? data.id : null;
    } catch (_) {
      return null;
    }
  });
  if (!duplicatedId) {
    throw new Error('No se pudo duplicar la fecha base (id=1) para pruebas');
  }
  console.log('Usando fecha duplicada con id:', duplicatedId);

  // CASE A: En Contratada, la opción 'Cerrada' NO debe estar disponible (transición inválida)
  await page.goto(`${baseUrl}/fechas/${duplicatedId}`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('main');

  let row = await findEstadoRow();
  let initialEstado = await getChipTextInRow(row);

  // Entrar en edición y leer opciones
  await clickEditarInRow();
  const optsContratada = await getSelectOptionsInRow(row);
  const textsA = optsContratada.map(o => o.text);
  console.log('CASE A initialEstado, options:', initialEstado, textsA);

  const hasCerradaInContratada = textsA.includes('Cerrada');
  const hasPendAnt = textsA.includes('PendienteAnticipo');
  const hasCancel = textsA.includes('Cancelada');

  // Salir de edición
  await clickCancelarInRow();

  // CASE B: Anticipo insuficiente bloquea Confirmación
  // - Transicionar Contratada -> PendienteAnticipo
  row = await findEstadoRow();
  initialEstado = await getChipTextInRow(row);
  if (initialEstado === 'Contratada') {
    await clickEditarInRow();
    await setSelectValueInRow(row, 'PendienteAnticipo');
    await clickGuardarInRow();
    await page.waitForFunction(() => {
      const r = document.querySelector('[data-e2e-estado-row="1"]');
      const chip = r ? r.querySelector('span.rounded-full') : null;
      return chip && chip.textContent && chip.textContent.trim() === 'PendienteAnticipo';
    });
  }

  // Intentar PendienteAnticipo -> Confirmada (anticipo objetivo en seed es 5,000,000 y no hay pagos tipo Anticipo)
  row = await findEstadoRow();
  await clickEditarInRow();
  await setSelectValueInRow(row, 'Confirmada');
  await clickGuardarInRow();

  // Esperar mensaje de negocio: inline o diálogo de alerta
  const dlgMsg = await waitForDialogMessage(15000);
  let errorText = '';
  try {
    await page.waitForSelector('[data-e2e-estado-row="1"] span.text-xs.text-red-600', { timeout: dlgMsg ? 2000 : 10000 });
    errorText = await page.evaluate(() => {
      const r = document.querySelector('[data-e2e-estado-row="1"]');
      const e = r ? r.querySelector('span.text-xs.text-red-600') : null;
      return e ? e.textContent.trim() : '';
    });
  } catch (_) {}

  // Salir de edición y verificar que el chip sigue en PendienteAnticipo
  await clickCancelarInRow();
  await sleep(200);
  const afterEstado = await getChipTextInRow(await findEstadoRow());

  const okA = !hasCerradaInContratada && hasPendAnt && hasCancel;
  const combinedMsg = errorText || dlgMsg || '';
  const okB = /Para confirmar el evento, el anticipo registrado/i.test(combinedMsg) && afterEstado === 'PendienteAnticipo';

  console.log('NEGATIVE TRANSITIONS', { okA, okB, afterEstado, errorText, dlgMsg, optsContratada: textsA });

  await browser.close();
  if (okA && okB) {
    console.log(JSON.stringify({ ok: true, okA, okB }, null, 2));
    process.exit(0);
  } else {
    process.exit(2);
  }
})().catch(e => {
  console.error(e);
  process.exit(1);
});