const puppeteer = require('puppeteer');

(async () => {
  const baseUrl = 'http://localhost:3000';
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1280, height: 900 } });
  const page = await browser.newPage();

  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

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
    return (await page.evaluate(el => el.textContent?.trim() || '', chip));
  }

  async function clickGuardarInRow(row) {
    const btns = await row.$$('button');
    for (const b of btns) {
      const t = await page.evaluate(el => el.textContent?.trim() || '', b);
      if (t.startsWith('Guardar')) {
        await b.click();
        return;
      }
    }
    throw new Error('Botón Guardar no encontrado en fila');
  }

  async function clickEditarInRow(row) {
    const btns = await row.$$('button');
    for (const b of btns) {
      const t = await page.evaluate(el => el.textContent?.trim() || '', b);
      if (t === 'Editar') {
        await b.click();
        return;
      }
    }
    throw new Error('Botón Editar no encontrado en fila');
  }

  async function setSelectValueInRow(row, value) {
    const sel = await row.$('select');
    if (!sel) throw new Error('Select no encontrado en fila');
    await page.evaluate((s, v) => {
      const opt = Array.from(s.options).find(o => o.value === v || o.textContent.trim() === v);
      if (opt) s.value = opt.value; else s.value = v;
      s.dispatchEvent(new Event('change', { bubbles: true }));
    }, sel, value);
    await page.waitForFunction((v) => {
      const r = document.querySelector('[data-e2e-estado-row="1"]');
      const select = r ? r.querySelector('select') : null;
      return select && select.value === v;
    }, {}, value);
  }

  async function openPagosTab() {
    await page.waitForSelector('[data-testid="tab-Pagos"]');
    await page.$eval('[data-testid="tab-Pagos"]', el => { el.scrollIntoView({ block: 'center' }); el.click(); });
    await sleep(200);
  }

  async function openAddPagoPanel() {
    await page.waitForSelector('[data-testid="btn-toggle-pago"]');
    const alreadyOpen = await page.$('[data-testid="panel-add-pago"]');
    if (!alreadyOpen) {
      await page.$eval('[data-testid="btn-toggle-pago"]', el => { el.scrollIntoView({ block: 'center' }); el.click(); });
      await page.waitForSelector('[data-testid="panel-add-pago"]');
    }
  }

  async function addPago({ tipo, monto }) {
    await openAddPagoPanel();
    await page.select('[data-testid="select-tipo-pago"]', tipo);
    await page.click('[data-testid="input-monto-pago"]', { clickCount: 3 });
    await page.type('[data-testid="input-monto-pago"]', String(monto));
    await page.$eval('[data-testid="btn-guardar-pago"]', el => { el.scrollIntoView({ block: 'center' }); el.click(); });
    // Esperar a que se cierre el panel y aparezca/actualice la lista o el resumen
    await page.waitForFunction(() => !document.querySelector('[data-testid="panel-add-pago"]'));
    await sleep(200);
  }

  function parseMoneyTextToNumber(text) {
    const digits = (text || '').replace(/[^0-9]/g, '');
    return Number(digits || '0');
  }

  async function getAnticipoObjetivoFromPage() {
    // Busca el nodo que contiene "Anticipo:" en la tarjeta de Negocio y parsea su valor
    return await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('div'));
      for (const n of nodes) {
        const strong = n.querySelector('strong');
        const label = strong ? (strong.textContent || '').trim() : '';
        if (/^Anticipo:/.test(label)) {
          const text = (n.textContent || '').trim();
          const valText = text.replace(/^.*Anticipo:\s*/, '');
          const digits = valText.replace(/[^0-9]/g, '');
          return Number(digits || '0');
        }
      }
      return 0;
    });
  }

  // Manejo de diálogos: aceptar confirm de cierre
  page.removeAllListeners('dialog');
  page.on('dialog', async (dialog) => {
    const type = dialog.type();
    const msg = dialog.message();
    if (type === 'confirm' && msg.includes('Vas a cerrar el evento')) {
      await dialog.accept();
    } else {
      await dialog.accept();
    }
  });

  // Preparar dato de prueba: duplicar la fecha 1 con estado inicial controlado PendienteAnticipo
  await page.goto(`${baseUrl}/fechas/1`, { waitUntil: 'networkidle2' });
  const duplicatedId = await page.evaluate(async () => {
    try {
      const res = await fetch(`/api/fechas/1/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ override: { estado: 'PendienteAnticipo' } })
      });
      const data = await res.json().catch(() => ({}));
      return data && data.id ? data.id : null;
    } catch (_) {
      return null;
    }
  });
  if (!duplicatedId) throw new Error('No se pudo duplicar la fecha base (id=1) para pruebas de flujo válido');

  // Escenario: PendienteAnticipo -> Confirmada -> Ejecutada -> Pagos completos -> Cerrada
  await page.goto(`${baseUrl}/fechas/${duplicatedId}`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('main');

  let row = await findEstadoRow();
  let estado = await getChipTextInRow(row);
  if (estado !== 'PendienteAnticipo') {
    // Intentar forzar a PendienteAnticipo si por alguna razón no quedó así
    await clickEditarInRow(row);
    await setSelectValueInRow(row, 'PendienteAnticipo');
    await clickGuardarInRow(row);
    await page.waitForFunction(() => {
      const r = document.querySelector('[data-e2e-estado-row="1"]');
      const chip = r ? r.querySelector('span.rounded-full') : null;
      return chip && chip.textContent && chip.textContent.trim() === 'PendienteAnticipo';
    });
    row = await findEstadoRow();
    estado = await getChipTextInRow(row);
  }

  // Agregar anticipo requerido para poder confirmar
  await openPagosTab();
  await page.waitForSelector('[data-testid="summary-saldo-pendiente"]');
  const anticipoObjetivo = await getAnticipoObjetivoFromPage();
  const saldoText0 = await page.$eval('[data-testid="summary-saldo-pendiente"]', el => el.textContent || '');
  const saldo0 = parseMoneyTextToNumber(saldoText0);
  const pAnticipo = Math.min(anticipoObjetivo, saldo0);
  if (pAnticipo > 0) {
    await addPago({ tipo: 'Anticipo', monto: pAnticipo });
  }

  // PendienteAnticipo -> Confirmada
  row = await findEstadoRow();
  await clickEditarInRow(row);
  await setSelectValueInRow(row, 'Confirmada');
  await clickGuardarInRow(row);
  // esperar refresh y chip
  await page.waitForFunction(() => {
    const r = document.querySelector('[data-e2e-estado-row="1"]');
    const chip = r ? r.querySelector('span.rounded-full') : null;
    return chip && chip.textContent && chip.textContent.trim() === 'Confirmada';
  });
  row = await findEstadoRow();
  estado = await getChipTextInRow(row);

  // Confirmada -> Ejecutada
  if (estado === 'Confirmada') {
    await clickEditarInRow(row);
    await setSelectValueInRow(row, 'Ejecutada');
    await clickGuardarInRow(row);
    await page.waitForFunction(() => {
      const r = document.querySelector('[data-e2e-estado-row="1"]');
      const chip = r ? r.querySelector('span.rounded-full') : null;
      return chip && chip.textContent && chip.textContent.trim() === 'Ejecutada';
    });
    row = await findEstadoRow();
    estado = await getChipTextInRow(row);
  }

  if (estado !== 'Ejecutada') throw new Error('No se llegó a estado Ejecutada, actual: ' + estado);

  // Agregar pagos hasta completar totalNegociado
  await openPagosTab();
  // Ver saldo pendiente actual
  await page.waitForSelector('[data-testid="summary-saldo-pendiente"]');
  const saldoText1 = await page.$eval('[data-testid="summary-saldo-pendiente"]', el => el.textContent || '');
  const saldo1 = parseMoneyTextToNumber(saldoText1);
  if (saldo1 > 0) {
    await addPago({ tipo: 'Segundo', monto: saldo1 });
  }

  const totalPagosText = await page.$eval('[data-testid="summary-total-pagos"]', el => el.textContent || '');
  const saldoTextF = await page.$eval('[data-testid="summary-saldo-pendiente"]', el => el.textContent || '');
  const totalPagos = parseMoneyTextToNumber(totalPagosText);
  const saldoF = parseMoneyTextToNumber(saldoTextF);

  if (saldoF !== 0) throw new Error('El saldo no quedó en 0 tras agregar pagos, saldo=' + saldoF);

  // Volver a estado y cerrar evento
  row = await findEstadoRow();
  await clickEditarInRow(row);
  await setSelectValueInRow(row, 'Cerrada');
  await clickGuardarInRow(row);

  // Esperar a que el chip cambie a Cerrada
  await page.waitForFunction(() => {
    const r = document.querySelector('[data-e2e-estado-row="1"]');
    const chip = r ? r.querySelector('span.rounded-full') : null;
    return chip && chip.textContent && chip.textContent.trim() === 'Cerrada';
  });

  const finalRow = await findEstadoRow();
  const finalEstado = await getChipTextInRow(finalRow);

  console.log('VALID FLOW RESULT', { totalPagos, saldoF, finalEstado });
  if (finalEstado !== 'Cerrada') throw new Error('El estado final no es Cerrada');

  await browser.close();
  console.log(JSON.stringify({ ok: true, totalPagos, finalEstado }, null, 2));
})().catch(e => {
  console.error(e);
  process.exit(1);
});