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

    if (!active) {
      const navHtml = await page.$eval('nav', el => el.innerHTML).catch(() => 'no-nav');
      console.error('DEBUG navHtml:', navHtml);
    }

    // Esperar encabezado de la sección de Pagos
    await page.waitForFunction(() => Array.from(document.querySelectorAll('h3')).some(h => /registro de pagos/i.test(h.textContent || '')), { timeout: 30000 });

    // Buscar botón toggle de forma flexible
    const ensureToggleButton = async () => {
      let exists = await page.$('[data-testid="btn-toggle-pago"]');
      if (exists) return true;
      // Buscar por texto
      await page.evaluate(() => {
        const container = document.querySelector('h3')?.closest('div');
        if (!container) return;
        const btn = Array.from(container.querySelectorAll('button')).find(b => /agregar pago|saldo completo|cerrar/i.test(b.textContent || ''));
        if (btn) { btn.setAttribute('data-testid', 'btn-toggle-pago'); }
      });
      exists = await page.$('[data-testid="btn-toggle-pago"]');
      return !!exists;
    };

    const hasToggle = await ensureToggleButton();
    if (!hasToggle) {
      // dump de la sección
      const pagosSection = await page.evaluate(() => {
        const h = Array.from(document.querySelectorAll('h3')).find(h => /registro de pagos/i.test(h.textContent || ''));
        const root = h ? h.closest('div') : document.body;
        return root ? root.innerText.slice(0, 2000) : 'no-section';
      });
      console.error('DEBUG pagosSection:', pagosSection);
      throw new Error('No se encontró botón toggle de pagos');
    }

    // Conteo inicial de items de pago
    let initialItems = 0;
    try {
      await page.waitForSelector('[data-testid="pago-item"]', { timeout: 2000 });
      initialItems = await page.$$eval('[data-testid="pago-item"]', els => els.length);
    } catch (_) { initialItems = 0; }

    // Abrir panel si no está abierto
    const panelOpen = !!(await page.$('[data-testid="panel-add-pago"]'));
    if (!panelOpen) {
      await page.$eval('[data-testid="btn-toggle-pago"]', el => { el.scrollIntoView({ block: 'center' }); el.click(); });
      await page.waitForSelector('[data-testid="panel-add-pago"]', { visible: true });
    }

    await page.waitForSelector('[data-testid="select-tipo-pago"]', { visible: true });
    await page.$eval('[data-testid="select-tipo-pago"]', (sel) => {
      const value = 'Anticipo';
      const opt = Array.from(sel.options).find(o => o.value === value || (o.textContent || '').trim() === value);
      const nextVal = opt ? opt.value : value;
      const proto = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
      if (proto && proto.set) proto.set.call(sel, nextVal);
      else sel.value = nextVal;
      sel.dispatchEvent(new Event('input', { bubbles: true }));
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => {
      const sel = document.querySelector('[data-testid="select-tipo-pago"]');
      return sel && (sel.value === 'Anticipo');
    }, { timeout: 5000 });
    // Leer saldo disponible y preparar monto inválido (saldo + 1)
    await page.waitForSelector('[data-testid="saldo-disponible"]', { visible: true });
    const saldoDisponible = await page.$eval('[data-testid="saldo-disponible"]', el => {
      const txt = (el.textContent || '').replace(/[^0-9]/g, '');
      const n = txt ? parseInt(txt, 10) : 0;
      return Number.isFinite(n) ? n : 0;
    });
    const invalidAmount = saldoDisponible + 1;
    console.log('PAGE_LOG: saldoDisponible=', saldoDisponible, ' invalidAmount=', invalidAmount);

    await page.waitForSelector('[data-testid="input-monto-pago"]', { visible: true });
    await page.$eval('[data-testid="input-monto-pago"]', (inp, amount) => {
      inp.focus();
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      if (setter && setter.set) setter.set.call(inp, ''); else inp.value = '';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      if (setter && setter.set) setter.set.call(inp, String(amount)); else inp.value = String(amount);
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new Event('change', { bubbles: true }));
    }, invalidAmount);
    await page.waitForFunction((amount) => {
      const inp = document.querySelector('[data-testid="input-monto-pago"]');
      return inp && inp.value === String(amount);
    }, { timeout: 5000 }, invalidAmount);

    await page.$eval('[data-testid="btn-guardar-pago"]', el => { el.scrollIntoView({ block: 'center' }); el.click(); });

    await page.waitForFunction(() => {
      const panel = document.querySelector('[data-testid="panel-add-pago"]');
      if (!panel) return false;
      const err = panel.querySelector('.text-red-600');
      return !!err && /excede el saldo disponible/i.test((err.textContent || ''));
    }, { timeout: 20000 });

    const errorText = await page.$eval('[data-testid="panel-add-pago"]', el => {
      const err = el.querySelector('.text-red-600');
      return err ? err.textContent.trim() : null;
    }).catch(() => null);

    const finalItems = await page.$$eval('[data-testid="pago-item"]', els => els.length).catch(() => 0);

    const ok = !!errorText && /excede el saldo disponible/i.test(errorText);

    if (!ok) {
      await page.screenshot({ path: 'e2e/pagos_negative_ui_failure.png', fullPage: true });
    }

    const result = { ok, errorText, initialItems, finalItems, itemsUnchanged: initialItems === finalItems, tabsDump, activePagos: active, saldoDisponible, invalidAmount };
    console.log(JSON.stringify(result, null, 2));

    await browser.close();
    process.exit(ok && initialItems === finalItems ? 0 : 2);
  } catch (e) {
    try { await page.screenshot({ path: 'e2e/pagos_negative_ui_error.png', fullPage: true }); } catch (_) {}
    console.error('E2E error:', e && e.message ? e.message : e);
    await browser.close();
    process.exit(1);
  }
})();