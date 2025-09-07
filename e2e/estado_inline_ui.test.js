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

  async function clickCancelarInRow(row) {
    const btns = await row.$$('button');
    for (const b of btns) {
      const t = await page.evaluate(el => el.textContent?.trim() || '', b);
      if (t === 'Cancelar') {
        await b.click();
        return;
      }
    }
    throw new Error('Botón Cancelar no encontrado en fila');
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

  async function getErrorTextInRow() {
    return await page.evaluate(() => {
      const r = document.querySelector('[data-e2e-estado-row="1"]');
      const e = r ? r.querySelector('span.text-xs.text-red-600') : null;
      return e ? e.textContent?.trim() || '' : '';
    });
  }

  // CASE 1: Intentar Cancelar (confirm dialog debe aparecer y lo cancelamos; estado no cambia). Luego salimos de edición.
  let confirmPromptText1 = null;
  page.removeAllListeners('dialog');
  page.on('dialog', async (dialog) => {
    const type = dialog.type();
    const msg = dialog.message();
    if (type === 'confirm' && msg.includes('cancelar este evento')) {
      confirmPromptText1 = msg;
      await dialog.dismiss();
    } else {
      await dialog.accept();
    }
  });

  await page.goto(`${baseUrl}/fechas/1`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('main');

  const row1 = await findEstadoRow();
  const before1 = await getChipTextInRow(row1);

  await clickEditarInRow(row1);
  await setSelectValueInRow(row1, 'Cancelada');
  await clickGuardarInRow(row1);

  // Seguimos en modo edición (se canceló el confirm). Salimos con Cancelar y verificamos el chip.
  await clickCancelarInRow(row1);
  await sleep(200);
  const after1 = await getChipTextInRow(await findEstadoRow());

  console.log('CASE1', { before1, after1, confirmPromptText1 });
  if (confirmPromptText1 == null) throw new Error('No apareció el prompt de confirmación para Cancelada');
  if (before1 !== after1) throw new Error(`El estado cambió inesperadamente tras cancelar confirm: ${before1} -> ${after1}`);

  // CASE 2: Desde Ejecutada intentar Cerrar (confirm aceptar y error de negocio esperado). Estado no debe cambiar. Luego salimos de edición.
  let confirmPromptText2 = null;
  page.removeAllListeners('dialog');
  page.on('dialog', async (dialog) => {
    const type = dialog.type();
    const msg = dialog.message();
    if (type === 'confirm' && msg.includes('Vas a cerrar el evento')) {
      confirmPromptText2 = msg;
      await dialog.accept();
    } else {
      // Aceptar cualquier otro diálogo para no bloquear la ejecución
      await dialog.accept();
    }
  });

  await page.goto(`${baseUrl}/fechas/3`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('main');

  const row2 = await findEstadoRow();
  const before2 = await getChipTextInRow(row2);

  await clickEditarInRow(row2);
  await setSelectValueInRow(row2, 'Cerrada');
  await clickGuardarInRow(row2);

  // Esperar a que aparezca el error inline en la fila
  await page.waitForFunction(() => {
    const r = document.querySelector('[data-e2e-estado-row="1"]');
    const e = r ? r.querySelector('span.text-xs.text-red-600') : null;
    return !!(e && /No se puede cerrar/.test(e.textContent || ''));
  });
  const errorText2 = await getErrorTextInRow();

  // Tras el error, salimos de edición con Cancelar y verificamos el chip
  await clickCancelarInRow(row2);
  await sleep(200);
  const after2 = await getChipTextInRow(await findEstadoRow());

  console.log('CASE2', { before2, after2, confirmPromptText2, errorText2 });
  if (confirmPromptText2 == null) throw new Error('No apareció el prompt de confirmación para Cerrar');
  if (!errorText2 || !/No se puede cerrar/.test(errorText2)) throw new Error('No apareció el mensaje de negocio esperado al cerrar');
  if (before2 !== after2) throw new Error(`El estado cambió inesperadamente tras validación de cierre: ${before2} -> ${after2}`);

  await browser.close();
  console.log(JSON.stringify({ ok: true, case1: { before1, after1, confirmPromptText1 }, case2: { before2, after2, confirmPromptText2, errorText2 } }, null, 2));
})().catch(e => {
  console.error(e);
  process.exit(1);
});