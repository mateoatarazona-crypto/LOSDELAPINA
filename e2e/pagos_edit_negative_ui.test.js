const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'], protocolTimeout: 120000 });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(60000);

  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  page.on('console', (msg) => console.log('PAGE_LOG:', msg.text()));
  page.on('pageerror', (err) => console.error('PAGE_ERROR:', err.message));
  page.on('dialog', async (dialog) => {
    try {
      console.log('PAGE_DIALOG:', dialog.message());
      await dialog.accept();
    } catch (e) {
      console.error('DIALOG_ERROR:', e && e.message ? e.message : e);
    }
  });

  try {
    await page.goto('http://localhost:3000/fechas/1', { waitUntil: 'domcontentloaded' });

    await page.waitForFunction(() => document.querySelectorAll('[data-testid^="tab-"]').length > 0);

    await page.waitForSelector('[data-testid="tab-Pagos"]');
    const activatePagos = async () => {
      await page.$eval('[data-testid="tab-Pagos"]', el => { el.scrollIntoView({ block: 'center' }); el.click(); });
      const becameActive = await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="tab-Pagos"]');
        return !!(btn && btn.className && btn.className.includes('border-blue-500'));
      });
      return becameActive;
    };

    let active = false;
    for (let i = 0; i < 5 && !active; i++) {
      active = await activatePagos();
      if (!active) {
        await page.evaluate(() => {
          const nav = document.querySelector('nav');
          if (!nav) return;
          const btn = Array.from(nav.querySelectorAll('button')).find(b => /\bPagos\b/i.test(b.textContent || ''));
          if (btn) { btn.scrollIntoView({ block: 'center' }); (btn).click(); }
        });
        await sleep(500);
        active = await page.evaluate(() => {
          const btn = document.querySelector('[data-testid="tab-Pagos"]');
          return !!(btn && btn.className && btn.className.includes('border-blue-500'));
        });
      }
      if (!active) await sleep(500);
    }

    const tabsDump = await page.$$eval('nav button', btns => btns.map(b => ({ text: (b.textContent || '').trim(), cls: b.className })));
    console.log('PAGE_LOG: tabsDump =', JSON.stringify(tabsDump));

    await page.waitForFunction(() => Array.from(document.querySelectorAll('h3')).some(h => /registro de pagos/i.test(h.textContent || '')), { timeout: 30000 });

    // Conteo inicial de items de pago
    await page.waitForSelector('[data-testid="pago-item"]', { timeout: 10000 });
    const initialItems = await page.$$eval('[data-testid="pago-item"]', els => els.length);
    if (initialItems === 0) throw new Error('No hay pagos para editar');

    // Leer totales del resumen para calcular totalNegociado
    const parseMoney = (t) => {
      const txt = String(t || '').replace(/[^0-9]/g, '');
      return txt ? parseInt(txt, 10) : 0;
    };
    const totalPagos = await page.$eval('[data-testid="summary-total-pagos"]', el => {
      const txt = el.textContent || '';
      return parseInt((txt.match(/\d/g) || []).join('') || '0', 10);
    });
    const saldoPendiente = await page.$eval('[data-testid="summary-saldo-pendiente"]', el => {
      const txt = el.textContent || '';
      return parseInt((txt.match(/\d/g) || []).join('') || '0', 10);
    });
    const totalNegociado = totalPagos + saldoPendiente;
    console.log('PAGE_LOG: totalPagos=', totalPagos, ' saldoPendiente=', saldoPendiente, ' totalNegociado=', totalNegociado);

    // Tomar el primer item y su monto actual
    const items = await page.$$('[data-testid="pago-item"]');
    const firstItem = items[0];
    const originalMonto = await firstItem.$eval('.font-semibold', el => {
      const txt = el.textContent || '';
      return parseInt((txt.match(/\d/g) || []).join('') || '0', 10);
    });
    console.log('PAGE_LOG: originalMonto=', originalMonto);

    // Hacer click en Editar dentro del primer item
    await firstItem.evaluate(el => {
      const btn = Array.from(el.querySelectorAll('button')).find(b => /Editar/i.test(b.textContent || ''));
      if (!btn) throw new Error('No se encontró botón Editar');
      btn.scrollIntoView({ block: 'center' });
      (btn).click();
    });

    // Esperar que el item entre en modo edición (botón Guardar visible) y el input de monto esté presente
    await page.waitForFunction(() => {
      const items = Array.from(document.querySelectorAll('[data-testid="pago-item"]'));
      const editing = items.find(div => Array.from(div.querySelectorAll('button')).some(b => /\bGuardar\b/i.test(b.textContent || '')));
      return !!(editing && editing.querySelector('input[type="number"]'));
    }, { timeout: 10000 });

    // Calcular saldo disponible para edición y monto inválido
    const saldoDisponibleEdit = totalNegociado - (totalPagos - originalMonto);
    const invalidAmount = saldoDisponibleEdit + 1;
    console.log('PAGE_LOG: saldoDisponibleEdit=', saldoDisponibleEdit, ' invalidAmount=', invalidAmount);

    // Setear el monto con setters nativos y verificar dentro del item en edición
    await page.evaluate((amount) => {
      const items = Array.from(document.querySelectorAll('[data-testid="pago-item"]'));
      const editing = items.find(div => Array.from(div.querySelectorAll('button')).some(b => /\bGuardar\b/i.test(b.textContent || '')));
      if (!editing) throw new Error('No se encontró contenedor en edición');
      const inp = editing.querySelector('input[type="number"]');
      if (!inp) throw new Error('No se encontró input de monto en edición');
      inp.focus();
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      if (setter && setter.set) setter.set.call(inp, ''); else inp.value = '';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      if (setter && setter.set) setter.set.call(inp, String(amount)); else inp.value = String(amount);
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new Event('change', { bubbles: true }));
    }, invalidAmount);

    await page.waitForFunction((amount) => {
      const items = Array.from(document.querySelectorAll('[data-testid="pago-item"]'));
      const editing = items.find(div => Array.from(div.querySelectorAll('button')).some(b => /\bGuardar\b/i.test(b.textContent || '')));
      const inp = editing ? editing.querySelector('input[type="number"]') : null;
      return !!(inp && inp.value === String(amount));
    }, { timeout: 5000 }, invalidAmount);

    // Click en Guardar dentro del item editando
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[data-testid="pago-item"]'));
      const editing = items.find(div => Array.from(div.querySelectorAll('button')).some(b => /\bGuardar\b/i.test(b.textContent || '')));
      if (!editing) throw new Error('No se encontró contenedor en edición');
      const btn = Array.from(editing.querySelectorAll('button')).find(b => /\bGuardar\b/i.test(b.textContent || ''));
      if (!btn) throw new Error('No se encontró botón Guardar');
      (btn).scrollIntoView({ block: 'center' });
      (btn).click();
    });

    // Esperar mensaje de error en el DOM dentro del item en edición
    await page.waitForFunction(() => {
      const items = Array.from(document.querySelectorAll('[data-testid="pago-item"]'));
      const editing = items.find(div => Array.from(div.querySelectorAll('button')).some(b => /\bGuardar\b/i.test(b.textContent || '')));
      if (!editing) return false;
      const err = editing.querySelector('.text-red-600');
      return !!err && /excede el saldo disponible/i.test((err.textContent || ''));
    }, { timeout: 20000 });

    const errorText = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[data-testid="pago-item"]'));
      const editing = items.find(div => Array.from(div.querySelectorAll('button')).some(b => /\bGuardar\b/i.test(b.textContent || '')));
      if (!editing) return null;
      const err = editing.querySelector('.text-red-600');
      return err ? err.textContent.trim() : null;
    }).catch(() => null);

    // Verificar que no cambió el número de items ni el monto original tras cancelar
    const finalItems = await page.$$eval('[data-testid="pago-item"]', els => els.length).catch(() => 0);

    // Cancelar edición y validar monto sigue igual
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[data-testid="pago-item"]'));
      const editing = items.find(div => Array.from(div.querySelectorAll('button')).some(b => /\bGuardar\b/i.test(b.textContent || '')));
      if (!editing) return;
      const btn = Array.from(editing.querySelectorAll('button')).find(b => /Cancelar/i.test(b.textContent || ''));
      if (btn) (btn).click();
    });
    // Esperar a que salga del modo edición (que ya no exista el botón Guardar en ningún item)
    await page.waitForFunction(() => {
      const items = Array.from(document.querySelectorAll('[data-testid="pago-item"]'));
      return !items.some(div => Array.from(div.querySelectorAll('button')).some(b => /\bGuardar\b/i.test(b.textContent || '')));
    }, { timeout: 10000 });

    const displayedMonto = await page.$eval('[data-testid="pago-item"] .font-semibold', el => {
      const txt = el.textContent || '';
      return parseInt((txt.match(/\d/g) || []).join('') || '0', 10);
    });

    const ok = !!errorText && /excede el saldo disponible/i.test(errorText) && initialItems === finalItems && displayedMonto === originalMonto;

    if (!ok) {
      await page.screenshot({ path: 'e2e/pagos_edit_negative_ui_failure.png', fullPage: true });
    }

    const result = { ok, errorText, initialItems, finalItems, displayedMonto, originalMonto, tabsDump, activePagos: active, totalPagos, saldoPendiente, totalNegociado, saldoDisponibleEdit, invalidAmount };
    console.log(JSON.stringify(result, null, 2));

    await browser.close();
    process.exit(ok ? 0 : 2);
  } catch (e) {
    try { await page.screenshot({ path: 'e2e/pagos_edit_negative_ui_error.png', fullPage: true }); } catch (_) {}
    console.error('E2E error:', e && e.message ? e.message : e);
    await browser.close();
    process.exit(1);
  }
})();