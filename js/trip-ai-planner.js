// ============ AI TRIP PLANNER — fully self-contained (JS-only styles) ============
(function () {
  'use strict';

  const INR = 84; // 1 USD → INR

  /* ──────────────────────────────────────────
     INJECT SCOPED STYLES  (lives only in JS)
  ────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('tap-styles')) return;
    const style = document.createElement('style');
    style.id = 'tap-styles';
    style.textContent = `
    /* === PAGE WRAPPER === */
    #trip-ai-planner-root {
      font-family: 'Inter', -apple-system, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      min-height: 100vh;
      height: 100vh;
      overflow-y: auto;
      padding-bottom: 60px;
    }

    /* === HERO === */
    .tap-page-hero {
      text-align: center;
      padding: 52px 20px 36px;
      position: relative;
      overflow: hidden;
    }
    .tap-page-hero::before {
      content: '';
      position: absolute;
      top: 0; left: 50%;
      transform: translateX(-50%);
      width: 700px; height: 260px;
      background: radial-gradient(ellipse at 50% 0%, rgba(139,92,246,.22) 0%, transparent 70%);
      pointer-events: none;
    }
    .tap-hero-badge {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 6px 18px; border-radius: 100px;
      background: linear-gradient(135deg,rgba(139,92,246,.13),rgba(59,130,246,.13));
      border: 1px solid rgba(139,92,246,.3);
      font-size: .78rem; font-weight: 700; color: #7c3aed;
      margin-bottom: 18px; letter-spacing: .04em;
    }
    .tap-hero-title {
      font-size: 2.6rem; font-weight: 800; color: #0f172a;
      font-family: 'Playfair Display', serif;
      margin-bottom: 10px; line-height: 1.15;
    }
    .tap-hero-title span {
      background: linear-gradient(135deg, #7c3aed, #3b82f6);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .tap-hero-sub {
      color: #64748b; font-size: .97rem; max-width: 540px; margin: 0 auto;
    }

    /* === TRIP BAR === */
    .tap-bar {
      display: flex; flex-wrap: wrap; gap: 0;
      background: #fff; border: 1px solid #e2e8f0;
      border-radius: 16px; padding: 14px 24px;
      margin: 0 auto 28px; max-width: 1100px;
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
    }
    .tap-bar-item {
      display: flex; align-items: center; gap: 10px; flex: 1; min-width: 130px;
    }
    .tap-bar-icon {
      width: 36px; height: 36px; border-radius: 50%;
      background: #eff6ff; color: #3b82f6;
      display: flex; align-items: center; justify-content: center;
      font-size: .88rem; flex-shrink: 0;
    }
    .tap-bar-label { display: block; font-size: .68rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
    .tap-bar-val { display: block; font-size: .88rem; font-weight: 700; color: #0f172a; }
    .tap-bar-sep { width: 1px; height: 38px; background: #e2e8f0; margin: 0 14px; flex-shrink: 0; }

    /* === LAYOUT === */
    .tap-layout {
      display: grid; grid-template-columns: 400px 1fr;
      gap: 24px; max-width: 1100px; margin: 0 auto;
      padding: 0 20px;
    }

    /* === CHAT CARD === */
    .tap-chat-card {
      background: #fff; border: 1px solid #e2e8f0;
      border-radius: 18px; box-shadow: 0 4px 16px rgba(0,0,0,.07);
      display: flex; flex-direction: column;
      overflow: hidden; position: sticky; top: 78px;
      max-height: calc(100vh - 120px);
    }
    .tap-chat-top {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 18px;
      background: linear-gradient(135deg, #1e1b4b, #2e1065);
    }
    .tap-ai-ball {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #3b82f6);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 1.1rem; flex-shrink: 0;
      box-shadow: 0 0 0 4px rgba(139,92,246,.25);
      animation: tapBeat 2.2s infinite;
    }
    @keyframes tapBeat {
      0%,100% { box-shadow: 0 0 0 4px rgba(139,92,246,.25); }
      50% { box-shadow: 0 0 0 9px rgba(139,92,246,.06); }
    }
    .tap-chat-meta h3 { font-size: .95rem; font-weight: 700; color: #fff; margin-bottom: 2px; }
    .tap-chat-meta span { font-size: .72rem; color: #86efac; display: flex; align-items: center; gap: 5px; }
    .tap-chat-meta span::before { content: '●'; font-size: .55rem; }
    .tap-restart {
      margin-left: auto; display: flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px;
      background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
      color: #fff; font-size: .78rem; cursor: pointer; font-family: inherit;
      transition: background .2s;
    }
    .tap-restart:hover { background: rgba(255,255,255,.22); }

    /* messages */
    .tap-msgs {
      flex: 1; overflow-y: auto; padding: 18px 14px;
      display: flex; flex-direction: column; gap: 12px;
      min-height: 260px; max-height: 380px;
    }
    .tap-msg { display: flex; gap: 9px; align-items: flex-end; opacity: 0; transform: translateY(7px); transition: opacity .28s, transform .28s; }
    .tap-msg.show { opacity: 1; transform: none; }
    .tap-msg-ai { flex-direction: row; }
    .tap-msg-user { flex-direction: row-reverse; }
    .tap-av {
      width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: .78rem;
    }
    .tap-av-ai { background: linear-gradient(135deg,#7c3aed,#3b82f6); color: #fff; }
    .tap-av-user { background: #e2e8f0; color: #64748b; }
    .tap-bubble {
      max-width: 270px; padding: 10px 14px; border-radius: 16px 16px 16px 4px;
      font-size: .86rem; line-height: 1.55; background: #f1f5f9;
      border: 1px solid #e2e8f0; color: #0f172a;
    }
    .tap-bubble-user {
      background: linear-gradient(135deg,#7c3aed,#3b82f6) !important;
      color: #fff !important; border: none !important;
      border-radius: 16px 16px 4px 16px !important;
    }
    /* typing dots */
    .tap-typing-wrap { display: flex; gap: 5px; align-items: center; padding: 4px 2px; }
    .tap-dot { width: 7px; height: 7px; background: #94a3b8; border-radius: 50%; animation: tapDot 1.3s infinite; }
    .tap-dot:nth-child(2) { animation-delay: .2s; }
    .tap-dot:nth-child(3) { animation-delay: .4s; }
    @keyframes tapDot { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

    /* chips */
    .tap-chips-area { padding: 8px 14px 6px; border-top: 1px solid #f1f5f9; background: #f8fafc; }
    .tap-chips-inner { display: flex; flex-wrap: wrap; gap: 7px; }
    .tap-chip {
      padding: 6px 13px; border-radius: 100px;
      border: 1.5px solid #cbd5e1; background: #fff;
      color: #334155; font-size: .8rem; font-weight: 500;
      cursor: pointer; transition: all .2s; font-family: inherit;
    }
    .tap-chip:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
    .tap-chip.on { border-color: #7c3aed; color: #7c3aed; background: rgba(124,58,237,.08); }
    .tap-chip-ok {
      border-color: #7c3aed !important; color: #fff !important;
      background: linear-gradient(135deg,#7c3aed,#3b82f6) !important;
    }

    /* input row */
    .tap-input-row { padding: 10px 14px; border-top: 1px solid #e2e8f0; display: flex; gap: 8px; }
    .tap-txt {
      flex: 1; padding: 10px 13px; border-radius: 10px;
      border: 1.5px solid #cbd5e1; font-size: .87rem;
      color: #0f172a; background: #f8fafc; outline: none; font-family: inherit;
      transition: border-color .2s;
    }
    .tap-txt:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
    .tap-send {
      width: 40px; height: 40px; border-radius: 10px;
      background: linear-gradient(135deg,#7c3aed,#3b82f6); border: none;
      color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: .9rem; transition: transform .15s;
    }
    .tap-send:hover { transform: scale(1.07); }

    /* === RIGHT COLUMN === */
    .tap-right { display: flex; flex-direction: column; gap: 20px; }

    /* progress card */
    .tap-prog-card {
      background: #fff; border: 1px solid #e2e8f0;
      border-radius: 16px; padding: 20px 22px;
      box-shadow: 0 1px 4px rgba(0,0,0,.05);
    }
    .tap-prog-head { font-weight: 700; color: #0f172a; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; font-size: .92rem; }
    .tap-prog-head i { color: #3b82f6; }
    .tap-prog-row { display: grid; grid-template-columns: 12px 1fr auto; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid #f1f5f9; }
    .tap-prog-row:last-child { border-bottom: none; }
    .tap-prog-dot { width: 10px; height: 10px; border-radius: 50%; background: #cbd5e1; transition: background .3s, box-shadow .3s; }
    .tap-prog-dot.done { background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,.4); }
    .tap-prog-lbl { font-size: .84rem; color: #64748b; }
    .tap-prog-val { font-size: .8rem; font-weight: 700; color: #0f172a; text-align: right; max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* === COUNTDOWN === */
    .tap-countdown-card {
      background: linear-gradient(135deg,#1e1b4b,#2e1065);
      border-radius: 18px; padding: 36px 28px;
      text-align: center; color: #fff;
      box-shadow: 0 8px 32px rgba(139,92,246,.25);
    }
    .tap-cd-ring {
      width: 110px; height: 110px; margin: 0 auto 20px;
      position: relative; display: flex; align-items: center; justify-content: center;
    }
    .tap-cd-ring svg { position: absolute; top: 0; left: 0; transform: rotate(-90deg); }
    .tap-cd-ring circle { fill: none; stroke-width: 6; }
    .tap-cd-bg { stroke: rgba(255,255,255,.12); }
    .tap-cd-fill {
      stroke: url(#tapGrad);
      stroke-linecap: round;
      stroke-dasharray: 283;
      stroke-dashoffset: 0;
      transition: stroke-dashoffset 1s linear;
    }
    .tap-cd-num { font-size: 2.5rem; font-weight: 800; color: #fff; position: relative; z-index: 1; }
    .tap-cd-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
    .tap-cd-sub { font-size: .82rem; color: rgba(255,255,255,.6); }
    .tap-cd-steps { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; text-align: left; }
    .tap-cd-step { display: flex; align-items: center; gap: 10px; font-size: .82rem; color: rgba(255,255,255,.5); }
    .tap-cd-step.lit { color: rgba(255,255,255,.9); }
    .tap-cd-step.lit .tap-cd-step-dot { background: #7c3aed; box-shadow: 0 0 8px rgba(124,58,237,.6); }
    .tap-cd-step-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.2); flex-shrink: 0; transition: all .4s; }

    /* === ITINERARY CARD === */
    .tap-itin-card {
      background: #fff; border: 1px solid #e2e8f0;
      border-radius: 18px; overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,.07);
    }
    .tap-itin-head {
      display: flex; align-items: center; gap: 14px;
      padding: 20px 24px; border-bottom: 1px solid #e2e8f0;
      background: linear-gradient(135deg,#f8fafc,#eff6ff);
    }
    .tap-itin-icon {
      width: 50px; height: 50px; border-radius: 14px;
      background: linear-gradient(135deg,#7c3aed,#3b82f6);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 1.3rem; flex-shrink: 0;
    }
    .tap-itin-head h3 { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 3px; }
    .tap-itin-head p { font-size: .78rem; color: #64748b; }
    .tap-itin-btns { margin-left: auto; display: flex; gap: 8px; }
    .tap-btn-sm {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: 9px;
      border: 1.5px solid #cbd5e1; background: #fff;
      color: #64748b; font-size: .8rem; font-weight: 600;
      cursor: pointer; transition: all .2s; font-family: inherit;
    }
    .tap-btn-sm:hover { border-color: #3b82f6; color: #3b82f6; }
    .tap-btn-save {
      background: linear-gradient(135deg,#7c3aed,#3b82f6) !important;
      border-color: transparent !important; color: #fff !important;
    }
    .tap-btn-save:hover { opacity: .88; transform: scale(1.03); }
    .tap-itin-body { padding: 24px; }

    /* overview rows */
    .tap-overview {
      display: grid; grid-template-columns: repeat(auto-fill,minmax(140px,1fr)); gap: 12px;
      background: linear-gradient(135deg,#0f172a,#1e1b4b);
      border-radius: 14px; padding: 20px; margin-bottom: 22px;
    }
    .tap-ov-item { display: flex; align-items: center; gap: 9px; }
    .tap-ov-item i { font-size: 1.1rem; color: rgba(139,92,246,.8); }
    .tap-ov-item small { display: block; font-size: .65rem; color: rgba(255,255,255,.45); text-transform: uppercase; letter-spacing: .06em; }
    .tap-ov-item strong { display: block; font-size: .86rem; font-weight: 700; color: #fff; }

    /* quick-info pills */
    .tap-pills { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 22px; }
    .tap-pill {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 12px; border-radius: 100px;
      background: rgba(59,130,246,.07); border: 1px solid rgba(59,130,246,.2);
      color: #2563eb; font-size: .76rem; font-weight: 600;
    }

    /* section labels */
    .tap-sec-label {
      display: flex; align-items: center; gap: 8px;
      font-weight: 800; font-size: .92rem; color: #0f172a;
      padding-bottom: 10px; border-bottom: 2px solid #f1f5f9;
      margin: 26px 0 14px;
    }
    .tap-sec-label i { color: #7c3aed; }

    /* budget grid */
    .tap-budget-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(170px,1fr)); gap: 10px; margin-bottom: 6px; }
    .tap-b-item {
      display: flex; align-items: center; gap: 11px;
      padding: 12px 13px; border-radius: 12px;
      border: 1px solid #e2e8f0; background: #f8fafc;
    }
    .tap-b-icon {
      width: 36px; height: 36px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: .88rem; flex-shrink: 0;
    }
    .tap-b-cat { display: block; font-size: .72rem; color: #64748b; }
    .tap-b-amt { display: block; font-size: .95rem; font-weight: 800; color: #0f172a; }
    .tap-b-total {
      grid-column: 1/-1; display: flex; justify-content: space-between; align-items: center;
      padding: 14px 16px; border-radius: 12px;
      background: linear-gradient(135deg,#7c3aed,#3b82f6); color: #fff;
      font-size: .92rem; font-weight: 700;
    }
    .tap-b-total strong { font-size: 1.25rem; }

    /* day cards */
    .tap-days { display: flex; flex-direction: column; gap: 16px; }
    .tap-day {
      border: 1px solid #e2e8f0; border-radius: 14px;
      overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.04);
    }
    .tap-day-hdr {
      display: flex; align-items: center; gap: 12px;
      padding: 13px 17px; background: linear-gradient(135deg,#f8fafc,#eff6ff);
      border-bottom: 1px solid #e2e8f0;
    }
    .tap-day-num {
      padding: 4px 11px; border-radius: 100px;
      background: linear-gradient(135deg,#7c3aed,#3b82f6);
      color: #fff; font-size: .74rem; font-weight: 800; flex-shrink: 0;
    }
    .tap-day-ti { font-weight: 700; color: #0f172a; flex: 1; font-size: .9rem; }
    .tap-day-dt { font-size: .76rem; color: #94a3b8; }
    .tap-day-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 9px; }
    .tap-slot { display: flex; gap: 12px; }
    .tap-slot-tag {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 9px; border-radius: 6px; font-size: .72rem; font-weight: 700;
      flex-shrink: 0; width: 96px;
    }
    .morning { background: rgba(245,158,11,.1); color: #b45309; }
    .afternoon { background: rgba(59,130,246,.1); color: #1d4ed8; }
    .evening { background: rgba(139,92,246,.1); color: #7c3aed; }
    .tap-slot-act { font-size: .875rem; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .tap-slot-det { font-size: .82rem; color: #64748b; margin-bottom: 2px; }
    .tap-slot-tip { font-size: .78rem; color: #3b82f6; display: flex; align-items: flex-start; gap: 4px; }
    .tap-day-stay {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 15px; background: rgba(59,130,246,.04);
      border-top: 1px solid #f1f5f9; font-size: .8rem; color: #64748b;
    }
    .tap-day-stay i { color: #3b82f6; }
    .tap-day-stay strong { color: #0f172a; }
    .tap-day-stay-price { margin-left: auto; color: #10b981; font-weight: 700; }

    /* food/highlights/packing */
    .tap-food-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(130px,1fr)); gap: 9px; }
    .tap-food-item {
      display: flex; align-items: center; gap: 7px;
      padding: 9px 11px; border-radius: 10px;
      background: rgba(245,158,11,.06); border: 1px solid rgba(245,158,11,.18);
      font-size: .8rem; font-weight: 600; color: #0f172a;
    }
    .tap-food-item i { color: #f59e0b; }
    .tap-hl-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
    .tap-hl-chip {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 13px; border-radius: 100px;
      background: rgba(124,58,237,.06); border: 1px solid rgba(124,58,237,.2);
      font-size: .8rem; font-weight: 600; color: #0f172a;
    }
    .tap-hl-n {
      width: 18px; height: 18px; border-radius: 50%;
      background: #7c3aed; color: #fff;
      font-size: .62rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }
    .tap-pack-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(195px,1fr)); gap: 7px; }
    .tap-pack-item {
      display: flex; align-items: center; gap: 7px;
      padding: 8px 11px; border-radius: 9px;
      background: rgba(16,185,129,.05); border: 1px solid rgba(16,185,129,.18);
      font-size: .8rem; color: #0f172a;
    }
    .tap-pack-item i { color: #10b981; font-size: .78rem; }
    .tap-tips-ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
    .tap-tips-ul li {
      display: flex; align-items: flex-start; gap: 9px;
      padding: 9px 13px; border-radius: 9px;
      background: #f8fafc; border: 1px solid #e2e8f0;
      font-size: .86rem; color: #0f172a;
    }
    .tap-tips-ul li i { color: #f59e0b; margin-top: 2px; flex-shrink: 0; }

    /* back bar */
    .tap-back-bar { text-align: center; padding: 26px 20px 0; }
    .tap-back-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 22px; border-radius: 10px;
      background: #fff; border: 1.5px solid #cbd5e1;
      color: #64748b; font-size: .88rem; font-weight: 700;
      cursor: pointer; transition: all .2s; font-family: inherit;
    }
    .tap-back-btn:hover { border-color: #3b82f6; color: #3b82f6; }

    /* saved-trip-item hook */
    .saved-trip-item { cursor: pointer; }
    .saved-trip-item:hover { background: #eff6ff !important; border-color: #3b82f6 !important; }
    .tap-plan-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; border-radius: 100px;
      background: linear-gradient(135deg,rgba(139,92,246,.13),rgba(59,130,246,.13));
      border: 1px solid rgba(139,92,246,.28);
      font-size: .68rem; font-weight: 700; color: #6d28d9; margin-left: 6px;
    }

    /* responsive */
    @media (max-width: 900px) {
      .tap-layout { grid-template-columns: 1fr; }
      .tap-chat-card { position: static; max-height: 520px; }
      .tap-hero-title { font-size: 1.85rem; }
    }
    @media (max-width: 580px) {
      .tap-bar-sep { display: none; }
      .tap-bar { gap: 12px; }
      .tap-budget-grid { grid-template-columns: 1fr 1fr; }
      .tap-slot { flex-direction: column; gap: 5px; }
      .tap-slot-tag { width: auto; }
      .tap-itin-btns { flex-wrap: wrap; }
    }
    `;
    document.head.appendChild(style);
  }

  /* ──────────────────────────────────────────
     KNOWLEDGE BASE
  ────────────────────────────────────────── */
  const DB = {
    france: {
      currency:'EUR (Euro)', visa:'Schengen Visa', language:'French',
      tz:'CET (UTC+1)', plug:'Type C/E', sos:'112',
      best:'April–June & Sep–Oct',
      places:['Eiffel Tower','Louvre Museum','Palace of Versailles','Mont Saint-Michel','French Riviera','Provence Lavender Fields','Bordeaux Wine Country','Chamonix Alps','Loire Valley Châteaux'],
      food:['Croissants & Baguettes','Coq au Vin','Crêpes','French Onion Soup','Ratatouille','Crème Brûlée','Bouillabaisse','Foie Gras'],
    },
    usa: {
      currency:'USD', visa:'ESTA / B1-B2 Visa', language:'English',
      tz:'EST/CST/PST (multiple)', plug:'Type A/B', sos:'911',
      best:'April–June & Sep–Nov',
      places:['Statue of Liberty','Grand Canyon','Yellowstone','Times Square','Golden Gate Bridge','Walt Disney World','Las Vegas Strip','Niagara Falls'],
      food:['BBQ Ribs','Clam Chowder','Deep-dish Pizza','Lobster Rolls','Philly Cheesesteak','Tex-Mex','Buffalo Wings','Key Lime Pie'],
    },
    japan: {
      currency:'JPY (Yen)', visa:'Visa-free (most passports)', language:'Japanese',
      tz:'JST (UTC+9)', plug:'Type A/B', sos:'110 / 119',
      best:'Mar–May & Oct–Dec',
      places:['Mount Fuji','Fushimi Inari Shrine','Hiroshima Memorial','Arashiyama Bamboo Forest','Tokyo Skytree','Nara Deer Park','Osaka Castle','Kyoto Temples'],
      food:['Sushi & Sashimi','Ramen','Tempura','Takoyaki','Wagyu Beef','Matcha Sweets','Yakitori','Onigiri'],
    },
    italy: {
      currency:'EUR (Euro)', visa:'Schengen Visa', language:'Italian',
      tz:'CET (UTC+1)', plug:'Type C/F', sos:'112',
      best:'April–June & Sep–Oct',
      places:['Colosseum','Venice Canals','Amalfi Coast','Tuscany Hills','Vatican Museums','Pompeii Ruins','Cinque Terre','Lake Como'],
      food:['Neapolitan Pizza','Pasta Carbonara','Gelato','Risotto','Tiramisu','Bruschetta','Osso Buco','Cannoli'],
    },
    thailand: {
      currency:'THB (Thai Baht)', visa:'Visa-on-Arrival / e-Visa', language:'Thai',
      tz:'ICT (UTC+7)', plug:'Type A/B/C', sos:'191',
      best:'November–February',
      places:['Grand Palace','Phi Phi Islands','Chiang Mai Temples','Floating Markets','Elephant Sanctuary','Muay Thai Show','Pai Canyon','Railay Beach'],
      food:['Pad Thai','Tom Yum','Som Tum','Massaman Curry','Mango Sticky Rice','Green Curry','Khao Pad','Larb'],
    },
    uk: {
      currency:'GBP', visa:'UK Standard Visitor Visa', language:'English',
      tz:'GMT / BST (UTC+0/+1)', plug:'Type G', sos:'999',
      best:'May–September',
      places:['Big Ben & Parliament','Tower of London','Buckingham Palace','Stonehenge','Edinburgh Castle','Lake District','Oxford University','Cotswolds Villages'],
      food:['Fish & Chips','Full English Breakfast','Shepherd\'s Pie','Afternoon Tea','Sticky Toffee Pudding','Cornish Pasty','Haggis','Sunday Roast'],
    },
    germany: {
      currency:'EUR (Euro)', visa:'Schengen Visa', language:'German',
      tz:'CET (UTC+1)', plug:'Type C/F', sos:'112',
      best:'May–September',
      places:['Neuschwanstein Castle','Brandenburg Gate','Cologne Cathedral','Black Forest','Romantic Road','Oktoberfest Grounds','Heidelberg Old Town','Rhine Valley'],
      food:['Bratwurst','Pretzels','Schnitzel','Sauerkraut','Black Forest Cake','Currywurst','Strudel','Weisswurst'],
    },
    singapore: {
      currency:'SGD', visa:'Visa-free (most passports)', language:'English / Malay / Tamil / Mandarin',
      tz:'SGT (UTC+8)', plug:'Type G', sos:'999',
      best:'February–April',
      places:['Marina Bay Sands','Gardens by the Bay','Sentosa Island','Universal Studios','Merlion Park','Chinatown','Little India','Clarke Quay'],
      food:['Hainanese Chicken Rice','Laksa','Chilli Crab','Char Kway Teow','Nasi Lemak','Satay','Kaya Toast','Durian'],
    },
    uae: {
      currency:'AED', visa:'Visa-on-Arrival (many passports)', language:'Arabic / English',
      tz:'GST (UTC+4)', plug:'Type G', sos:'999',
      best:'October–April',
      places:['Burj Khalifa','Dubai Mall','Sheikh Zayed Mosque','Palm Jumeirah','Desert Safari','Burj Al Arab','Old Dubai Souks','Ferrari World Abu Dhabi'],
      food:['Shawarma','Hummus & Flatbread','Lamb Machboos','Al Harees','Luqaimat','Camel Milk Chocolate','Kunafa','Mixed Grill'],
    },
    default: {
      currency:'Local currency', visa:'Check your embassy', language:'Local language',
      tz:'Local timezone', plug:'Universal adapter recommended', sos:'112',
      best:'Check seasonal guides',
      places:['Historic Landmarks','Local Markets','Cultural Centres','National Parks','Waterfronts','Museums','Hill Stations','Nature Reserves'],
      food:['Local Street Food','Traditional Dishes','Regional Specialties','Fresh Market Produce','Popular Desserts'],
    }
  };

  function getFacts(name) {
    if (!name) return DB.default;
    const k = name.toLowerCase().trim();
    for (const key of Object.keys(DB)) {
      if (k.includes(key) || key.includes(k)) return DB[key];
    }
    return DB.default;
  }

  /* ──────────────────────────────────────────
     BUDGET  (INR)
  ────────────────────────────────────────── */
  const inr = n => `₹${(n * INR).toLocaleString('en-IN')}`;

  function parseBudgetINR(str) {
    // accept any numeric string like "50000" or "₹50,000" or "50k"
    if (!str) return null;
    const s = str.toString().toLowerCase().replace(/[₹,\s]/g, '');
    const k = s.endsWith('k') ? parseFloat(s) * 1000 : parseFloat(s);
    return isNaN(k) ? null : k;
  }

  function getTier(budgetStr) {
    const b = (budgetStr || '').toLowerCase();
    if (b.includes('luxury') || b.includes('premium') || b.includes('5 star')) return 'luxury';
    if (b.includes('budget') || b.includes('backpack') || b.includes('hostel') || b.includes('low') || b.includes('cheap')) return 'budget';
    const amt = parseBudgetINR(budgetStr);
    if (amt !== null) {
      if (amt >= 500000) return 'luxury';
      if (amt <= 80000)  return 'budget';
      return 'mid';
    }
    return 'mid';
  }

  // USD base amounts → converted to INR on display
  const DAILY = {
    luxury: { food: 120, act: 150, local: 60 },
    mid:    { food: 50,  act: 60,  local: 25 },
    budget: { food: 20,  act: 20,  local: 10 }
  };
  const ACCOM_RATE = { luxury: 350, mid: 120, budget: 40 };
  const FLIGHT_BASE = { flight: 600, train: 120, bus: 50, ship: 200 };
  const TIER_MULT   = { luxury: 2.5, mid: 1, budget: 0.65 };

  function buildAccom(str, tier) {
    const s = (str || '').toLowerCase();
    if (s.includes('hostel') || s.includes('dorm'))         return { name: 'Hostel / Dorm',           rate: 25 };
    if (s.includes('airbnb') || s.includes('apartment'))    return { name: 'Airbnb / Apartment',       rate: 90 };
    if (s.includes('luxury') || s.includes('5 star'))       return { name: '5-Star Luxury Hotel',      rate: 350 };
    if (s.includes('budget'))                               return { name: 'Budget Hotel / Guesthouse', rate: 40 };
    return { name: tier === 'luxury' ? '5-Star Luxury Hotel' : tier === 'budget' ? 'Budget Hotel' : '3–4 Star Hotel',
             rate: ACCOM_RATE[tier] || 120 };
  }

  function buildBudget(tier, days, pax, mode, accom, budgetInput) {
    const d = DAILY[tier] || DAILY.mid;
    const flight  = Math.round((FLIGHT_BASE[mode] || 400) * (TIER_MULT[tier] || 1));
    const hotel   = accom.rate * days;          // per person per night → total nights
    const food    = d.food * days * pax;
    const act     = d.act  * days * pax;
    const local   = d.local* days * pax;
    const misc    = Math.round((flight + hotel + food + act) * 0.08);
    const total   = flight + hotel + food + act + local + misc;

    // If user typed a specific INR budget, use that as the reported total
    const userAmt = parseBudgetINR(budgetInput);
    const reportedTotal = userAmt !== null ? userAmt : total * INR;

    return {
      items: [
        { label:'Transport',        usd: flight * pax, icon:'plane',        color:'#3b82f6' },
        { label:'Accommodation',    usd: hotel,        icon:'bed',          color:'#8b5cf6' },
        { label:'Food & Dining',    usd: food,         icon:'utensils',     color:'#f59e0b' },
        { label:'Activities & Entry',usd:act,          icon:'ticket-alt',   color:'#10b981' },
        { label:'Local Transport',  usd: local,        icon:'taxi',         color:'#06b6d4' },
        { label:'Miscellaneous',    usd: misc,         icon:'shopping-bag', color:'#ec4899' },
      ],
      totalINR: reportedTotal,
      nightlyINR: accom.rate * INR
    };
  }

  /* ──────────────────────────────────────────
     ITINERARY GENERATOR
  ────────────────────────────────────────── */
  function generateItinerary(trip, prefs) {
    const facts    = getFacts(trip.destination);
    const days     = prefs.duration || 5;
    const dest     = trip.destination || 'your destination';
    const pax      = trip.passengers || 1;
    const tier     = getTier(prefs.budget);
    const accom    = buildAccom(prefs.accommodation, tier);
    const budget   = buildBudget(tier, days, pax, trip.travelMode, accom, prefs.budget);
    const places   = [...facts.places];
    const food     = [...facts.food];
    const purpose  = prefs.purpose || 'tourism';
    const isHoney  = /honeymoon|romance/i.test(purpose);
    const isBiz    = /business|work/i.test(purpose);
    const isAdv    = /adventure|outdoor/i.test(purpose) || (prefs.interests || []).some(i => /adventure|outdoor/i.test(i));

    let out = '';

    // ── Overview ──
    out += `<div class="tap-overview">`;
    [
      ['globe-europe', 'Destination',   dest],
      ['moon',         'Duration',      `${days} Day${days>1?'s':''}`],
      ['wallet',       'Budget',        `₹${Math.round(budget.totalINR).toLocaleString('en-IN')}`],
      ['bed',          'Accommodation', accom.name],
      ['language',     'Language',      facts.language],
      ['coins',        'Currency',      facts.currency],
    ].forEach(([ic, lbl, val]) => out += `
      <div class="tap-ov-item">
        <i class="fas fa-${ic}"></i>
        <div><small>${lbl}</small><strong>${val}</strong></div>
      </div>`);
    out += `</div>`;

    // ── Pill row ──
    out += `<div class="tap-pills">
      <div class="tap-pill"><i class="fas fa-plug"></i> Plug: ${facts.plug}</div>
      <div class="tap-pill"><i class="fas fa-phone-alt"></i> SOS: ${facts.sos}</div>
      <div class="tap-pill"><i class="fas fa-clock"></i> ${facts.tz}</div>
      <div class="tap-pill"><i class="fas fa-id-card"></i> ${facts.visa}</div>
    </div>`;

    // ── Budget breakdown ──
    out += `<div class="tap-sec-label"><i class="fas fa-chart-pie"></i> Estimated Budget (in Rupees)</div>
    <div class="tap-budget-grid">`;
    budget.items.forEach(b => {
      out += `<div class="tap-b-item">
        <div class="tap-b-icon" style="background:${b.color}1a;color:${b.color}"><i class="fas fa-${b.icon}"></i></div>
        <div>
          <span class="tap-b-cat">${b.label}</span>
          <span class="tap-b-amt">₹${Math.round(b.usd * INR).toLocaleString('en-IN')}</span>
        </div>
      </div>`;
    });
    out += `<div class="tap-b-total">
      <span>Total Estimated Budget (${pax} pax, ${days} days)</span>
      <strong>₹${Math.round(budget.totalINR).toLocaleString('en-IN')}</strong>
    </div></div>`;

    // ── Day plans ──
    out += `<div class="tap-sec-label"><i class="fas fa-map-signs"></i> Day-by-Day Itinerary</div>
    <div class="tap-days">`;

    const dayPlans = makeDayPlans(dest, days, facts, prefs, purpose, tier, accom, isHoney, isBiz, isAdv);
    dayPlans.forEach((day, i) => {
      let dateStr = '';
      if (trip.tripDate) {
        const d = new Date(trip.tripDate);
        d.setDate(d.getDate() + i);
        dateStr = d.toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' });
      }
      out += `<div class="tap-day">
        <div class="tap-day-hdr">
          <div class="tap-day-num">Day ${i+1}</div>
          <div class="tap-day-ti">${day.title}</div>
          ${dateStr ? `<div class="tap-day-dt">${dateStr}</div>` : ''}
        </div>
        <div class="tap-day-body">`;
      ['morning','afternoon','evening'].forEach(slot => {
        const s = day[slot];
        out += `<div class="tap-slot">
          <div class="tap-slot-tag ${slot}"><i class="fas fa-${slot==='morning'?'sun':slot==='afternoon'?'cloud-sun':'moon'}"></i> ${slot.charAt(0).toUpperCase()+slot.slice(1)}</div>
          <div>
            <p class="tap-slot-act">${s.activity}</p>
            <p class="tap-slot-det">${s.detail}</p>
            ${s.tip ? `<p class="tap-slot-tip"><i class="fas fa-lightbulb"></i> ${s.tip}</p>` : ''}
          </div>
        </div>`;
      });
      out += `</div>`;
      if (day.stay) {
        out += `<div class="tap-day-stay">
          <i class="fas fa-bed"></i>
          <span>Stay: <strong>${accom.name}</strong></span>
          <span class="tap-day-stay-price">₹${budget.nightlyINR.toLocaleString('en-IN')}/night</span>
        </div>`;
      }
      out += `</div>`;
    });
    out += `</div>`;

    // ── Food ──
    out += `<div class="tap-sec-label"><i class="fas fa-utensils"></i> Local Food to Try</div>
    <div class="tap-food-grid">`;
    food.slice(0,8).forEach(dish => {
      out += `<div class="tap-food-item"><i class="fas fa-drumstick-bite"></i>${dish}</div>`;
    });
    out += `</div>`;

    // ── Highlights ──
    out += `<div class="tap-sec-label"><i class="fas fa-star"></i> Must-Visit Attractions</div>
    <div class="tap-hl-wrap">`;
    facts.places.forEach((h, i) => {
      out += `<div class="tap-hl-chip"><span class="tap-hl-n">${i+1}</span>${h}</div>`;
    });
    out += `</div>`;

    // ── Packing ──
    const pack = getPacking(purpose, facts);
    out += `<div class="tap-sec-label"><i class="fas fa-suitcase-rolling"></i> Packing Essentials</div>
    <div class="tap-pack-grid">`;
    pack.forEach(p => out += `<div class="tap-pack-item"><i class="fas fa-check-circle"></i>${p}</div>`);
    out += `</div>`;

    // ── Tips ──
    out += `<div class="tap-sec-label"><i class="fas fa-info-circle"></i> AI Travel Tips</div>
    <ul class="tap-tips-ul">
      <li><i class="fas fa-bolt"></i> Best time to visit <strong>${dest}</strong>: ${facts.best}</li>
      <li><i class="fas fa-bolt"></i> Book ${accom.name} at least 3–4 weeks in advance for best rates.</li>
      <li><i class="fas fa-bolt"></i> Download offline maps (Google Maps / Maps.me) before departure.</li>
      <li><i class="fas fa-bolt"></i> Keep digital + printed copies of passport and visa.</li>
      <li><i class="fas fa-bolt"></i> Carry some <strong>${facts.currency}</strong> cash for local markets &amp; taxis.</li>
      <li><i class="fas fa-bolt"></i> Emergency helpline in ${dest}: <strong>${facts.sos}</strong></li>
      <li><i class="fas fa-bolt"></i> Always purchase travel insurance — it's essential, not optional.</li>
      ${prefs.dietary && prefs.dietary !== 'None' ? `<li><i class="fas fa-bolt"></i> Carry a dietary card translated to <strong>${facts.language}</strong> for <strong>${prefs.dietary}</strong> needs.</li>` : ''}
    </ul>`;

    return out;
  }

  /* ── Day plan builder helper ── */
  function makeDayPlans(dest, days, facts, prefs, purpose, tier, accom, isHoney, isBiz, isAdv) {
    const places = [...facts.places];
    const food = [...facts.food];
    const plans = [];

    // Day 1 — Arrival
    plans.push({
      title: `Arrival & First Impressions of ${dest}`,
      morning:   { activity: `Depart & Travel to ${dest}`, detail: `Board your transport, arrive and freshen up. Exchange some local currency at the airport.`, tip: 'Download offline maps & currency app before you board.' },
      afternoon: { activity: `Hotel Check-in & Rest`,      detail: `Check into ${accom.name}. Explore the nearby streets and grab a light snack.`, tip: null },
      evening:   { activity: `Welcome Dinner`,             detail: `Dine at a local restaurant — try ${food[0] || 'local cuisine'}. Take a relaxed evening walk.`, tip: `Ask hotel staff for hidden local dining gems.` },
      stay: true
    });

    const themeTitles = [
      'Major Landmarks & History', 'Food, Markets & Local Life',
      'Day Trip & Scenic Beauty',   'Adventure & Outdoor Exploration',
      'Culture, Arts & Museums',    'Shopping & Relaxation',
      'Hidden Gems & Neighbourhood Walks'
    ];

    for (let d = 2; d <= Math.max(days - 1, 2); d++) {
      const p1 = places.shift() || `${dest} Landmark`;
      const p2 = places.shift() || `${dest} Attraction`;
      const meal = food.shift() || 'local cuisine';
      const title = isBiz ? (d===2 ? 'Business Meetings & City Centre' : themeTitles[(d-2) % themeTitles.length]) :
                    isHoney ? (d===2 ? 'Romance, Fine Dining & Scenic Views' : themeTitles[(d-2) % themeTitles.length]) :
                    themeTitles[(d-2) % themeTitles.length];

      plans.push({
        title,
        morning:   { activity: `Visit ${p1}`, detail: `Start early to beat the crowds. ${isBiz ? 'Attend morning meetings.' : isHoney ? 'Explore together at a relaxed pace.' : 'Hire a local guide for deeper insight.'}`, tip: 'Pre-book tickets online to skip queues.' },
        afternoon: { activity: `${p2} + Lunch`, detail: `Grab ${meal} at a well-rated local spot. Explore the area, browse local markets.`, tip: tier==='budget' ? 'Street food stalls offer great value & taste.' : null },
        evening:   { activity: isHoney ? 'Rooftop / Candlelight Dinner' : isBiz ? 'Business Networking / Free Evening' : isAdv ? 'Night Excursion or Cultural Show' : 'Local Night Life or Cultural Performance', detail: `${isHoney ? `Enjoy a romantic dinner with a view — unforgettable for both of you.` : isBiz ? `Review tomorrow's agenda or attend local networking event.` : `Soak in the local culture and nightlife atmosphere.`}`, tip: null },
        stay: true
      });
    }

    // Last day
    if (days > 1) {
      plans.push({
        title: `Final Memories & Departure`,
        morning:   { activity: `Breakfast & Final Stroll`,   detail: `Enjoy a last meal at a favourite café. Pick up souvenirs and gifts.`, tip: null },
        afternoon: { activity: `Hotel Check-out & Departure`, detail: `Settle the bill and head to the airport / station. Allow at least 3 hours for international flights.`, tip: 'Keep your passport and boarding pass accessible.' },
        evening:   { activity: `Journey Home`,               detail: `Board your transport. Reflect on a wonderful trip — safe travels! ✈️`, tip: null },
        stay: false
      });
    }

    return plans.slice(0, days);
  }

  function getPacking(purpose, facts) {
    return [
      'Passport & Visa documents', 'Travel insurance certificate',
      `Power adapter (${facts.plug})`, 'Local currency + backup card',
      'Medications & first-aid kit', 'Comfortable walking shoes',
      'Weather-appropriate clothing', 'Sunscreen & insect repellent',
      'Reusable water bottle', 'Offline map downloaded',
      ...(/business/i.test(purpose) ? ['Business attire & cards','Laptop & charger'] : []),
      ...(/honeymoon|romance/i.test(purpose) ? ['Special occasion outfit','Camera for memories'] : []),
    ];
  }

  /* ──────────────────────────────────────────
     CONVERSATION STEPS
  ────────────────────────────────────────── */
  const STEPS = [
    {
      id: 'welcome',
      ai: (t) => `👋 Hello! I'm <strong>GlobeMate AI</strong> — your personal travel planning assistant.\n\nI can see you're planning a trip to <strong>${t.destination || 'your destination'}</strong>${t.tripDate ? ` on <strong>${new Date(t.tripDate).toLocaleDateString('en-IN',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</strong>` : ''}.\n\nI'll craft a <strong>detailed day-by-day itinerary</strong> with an INR budget breakdown for your trip. Let's begin! 🌍\n\n<strong>What is the main purpose of this trip?</strong>`,
      chips: ['Tourism & Sightseeing','Business / Work','Honeymoon & Romance','Family Holiday','Adventure & Outdoors','Medical / Wellness'],
      key: 'purpose', multi: false, free: true
    },
    {
      id: 'duration',
      ai: (t,p) => `Great — a <strong>${p.purpose}</strong> trip! 🎉\n\n<strong>How many days will you spend in ${t.destination || 'the destination'}?</strong>`,
      chips: ['3 Days','5 Days','7 Days','10 Days','14 Days','21+ Days'],
      key: 'duration', multi: false, free: true,
      parse: ans => { const n = parseInt(ans); return isNaN(n) ? 5 : n; }
    },
    {
      id: 'budget',
      ai: (t,p) => `Perfect — <strong>${p.duration} days</strong> in ${t.destination}!\n\n<strong>What is your approximate total budget in ₹ (Rupees)?</strong>\n<small style="color:#94a3b8">(Include flights, stay, food & activities for all ${t.passengers||1} passenger${(t.passengers||1)>1?'s':''})</small>`,
      chips: ['₹30,000–50,000','₹50,000–1 Lakh','₹1–2 Lakhs','₹2–5 Lakhs','₹5–10 Lakhs','Luxury (10L+)'],
      key: 'budget', multi: false, free: true
    },
    {
      id: 'accommodation',
      ai: (_t,p) => `Budget noted as <strong>${p.budget}</strong>.\n\n<strong>Preferred type of accommodation?</strong>`,
      chips: ['Luxury 5-Star Hotel','3–4 Star Hotel','Budget Hotel / Guesthouse','Hostel / Dormitory','Airbnb / Apartment','No preference'],
      key: 'accommodation', multi: false, free: true
    },
    {
      id: 'interests',
      ai: (_t,p) => `Staying at a <strong>${p.accommodation}</strong>! 🛎️\n\n<strong>What are your main interests?</strong> (Select all that apply, then click ✓ Confirm)`,
      chips: ['History & Culture','Food & Cuisine','Adventure & Hiking','Shopping','Nightlife','Nature & Wildlife','Photography','Relaxation & Spa'],
      key: 'interests', multi: true, free: true
    },
    {
      id: 'dietary',
      ai: (_t,p) => `Interests noted: <strong>${Array.isArray(p.interests)?p.interests.join(', '):p.interests}</strong>.\n\nAlmost done! Any <strong>dietary requirements or special needs</strong>?`,
      chips: ['None','Vegetarian','Vegan','Halal','Kosher','Gluten-free','Nut allergy'],
      key: 'dietary', multi: false, free: true
    },
    {
      id: 'generate',
      ai: (_t,p) => `All set! 🎯 Generating your personalised <strong>${p.duration}-day itinerary</strong> with full ₹ budget breakdown…\n\n⏳ This takes about 20 seconds while I research the best plan for you.`,
      chips: [], key: null, multi: false, free: false
    }
  ];

  function calcDays(s, e) {
    const d = new Date(e) - new Date(s);
    return Math.max(1, Math.round(d / 86400000));
  }

  /* ──────────────────────────────────────────
     MODULE
  ────────────────────────────────────────── */
  const TripAIPlanner = {
    trip: {},
    prefs: {},
    step: 0,
    chosen: [],
    generatedHTML: '',
    cdTimer: null,

    init() {
      injectStyles();

      const root = document.getElementById('trip-ai-planner-root');
      if (!root) return;

      // Load trip
      const id = parseInt(localStorage.getItem('globemate_ai_trip_id'));
      const trips = JSON.parse(localStorage.getItem('globemateTrips') || '[]');
      this.trip = trips.find(t => t.id === id) || trips[trips.length - 1] || {};

      root.innerHTML = this.buildHTML();
      this.bindAll();
      this.reset();
    },

    buildHTML() {
      const t = this.trip;
      const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric',year:'numeric'}) : '—';
      const modeIcon = m => m==='flight'?'plane':m==='train'?'train':m==='ship'?'ship':'bus';

      return `
<!-- Hero -->
<div class="tap-page-hero">
  <div class="tap-hero-badge"><i class="fas fa-robot"></i> GlobeMate AI Planner</div>
  <h2 class="tap-hero-title">Your <span>Smart Itinerary</span></h2>
  <p class="tap-hero-sub">Answer a few quick questions and our AI will build a complete day-by-day travel plan with INR budget — ready in 20 seconds.</p>
</div>

<!-- Trip bar -->
<div class="tap-bar" style="max-width:1160px;margin:0 auto 28px;padding:14px 24px;">
  <div class="tap-bar-item">
    <div class="tap-bar-icon"><i class="fas fa-map-marker-alt"></i></div>
    <div><span class="tap-bar-label">Destination</span><span class="tap-bar-val">${t.destination||'—'}</span></div>
  </div>
  <div class="tap-bar-sep"></div>
  <div class="tap-bar-item">
    <div class="tap-bar-icon"><i class="fas fa-calendar-alt"></i></div>
    <div><span class="tap-bar-label">Travel Date</span><span class="tap-bar-val">${fmtDate(t.tripDate)}</span></div>
  </div>
  <div class="tap-bar-sep"></div>
  <div class="tap-bar-item">
    <div class="tap-bar-icon"><i class="fas fa-map-pin"></i></div>
    <div><span class="tap-bar-label">Departing From</span><span class="tap-bar-val">${t.departureCity||'—'}</span></div>
  </div>
  <div class="tap-bar-sep"></div>
  <div class="tap-bar-item">
    <div class="tap-bar-icon"><i class="fas fa-${modeIcon(t.travelMode)}"></i></div>
    <div><span class="tap-bar-label">Travel Mode</span><span class="tap-bar-val">${t.travelMode?t.travelMode.charAt(0).toUpperCase()+t.travelMode.slice(1):'—'}</span></div>
  </div>
  <div class="tap-bar-sep"></div>
  <div class="tap-bar-item">
    <div class="tap-bar-icon"><i class="fas fa-users"></i></div>
    <div><span class="tap-bar-label">Passengers</span><span class="tap-bar-val">${t.passengers||'—'} Passenger${(t.passengers||1)>1?'s':''}</span></div>
  </div>
</div>

<!-- Main layout -->
<div class="tap-layout" style="max-width:1160px;margin:0 auto;padding:0 20px;">

  <!-- Chat column -->
  <div>
    <div class="tap-chat-card">
      <div class="tap-chat-top">
        <div class="tap-ai-ball"><i class="fas fa-robot"></i></div>
        <div class="tap-chat-meta">
          <h3>GlobeMate AI</h3>
          <span>Online & Ready</span>
        </div>
        <button class="tap-restart" id="tapRestart"><i class="fas fa-redo"></i> Restart</button>
      </div>
      <div class="tap-msgs" id="tapMsgs"></div>
      <div class="tap-chips-area" id="tapChipsArea" style="display:none">
        <div class="tap-chips-inner" id="tapChips"></div>
      </div>
      <div class="tap-input-row" id="tapInputRow" style="display:none">
        <input class="tap-txt" id="tapTxt" placeholder="Type your answer…" autocomplete="off">
        <button class="tap-send" id="tapSend"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
  </div>

  <!-- Right column -->
  <div class="tap-right" id="tapRight">

    <!-- Progress -->
    <div class="tap-prog-card">
      <div class="tap-prog-head"><i class="fas fa-tasks"></i> Planning Progress</div>
      <div id="tapProgRows">
        ${[['purpose','Purpose of Travel'],['duration','Trip Duration'],['budget','Total Budget (₹)'],['accommodation','Accommodation'],['interests','Interests'],['dietary','Dietary / Special']].map(([k,l])=>`
        <div class="tap-prog-row" data-key="${k}">
          <div class="tap-prog-dot" id="dot-${k}"></div>
          <span class="tap-prog-lbl">${l}</span>
          <span class="tap-prog-val" id="val-${k}">—</span>
        </div>`).join('')}
      </div>
    </div>

    <!-- Countdown (hidden by default) -->
    <div class="tap-countdown-card" id="tapCountdown" style="display:none">
      <div class="tap-cd-title"><i class="fas fa-cogs"></i> Building Your Itinerary</div>
      <div class="tap-cd-ring">
        <svg viewBox="0 0 100 100" width="110" height="110">
          <defs>
            <linearGradient id="tapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#7c3aed"/>
              <stop offset="100%" style="stop-color:#3b82f6"/>
            </linearGradient>
          </defs>
          <circle class="tap-cd-bg" cx="50" cy="50" r="45"/>
          <circle class="tap-cd-fill" id="tapCdArc" cx="50" cy="50" r="45"/>
        </svg>
        <div class="tap-cd-num" id="tapCdNum">20</div>
      </div>
      <p class="tap-cd-sub">Our AI is researching the best routes, stays & experiences for you</p>
      <div class="tap-cd-steps" id="tapCdSteps">
        <div class="tap-cd-step" data-idx="0"><div class="tap-cd-step-dot"></div><span>Analysing your destination & preferences…</span></div>
        <div class="tap-cd-step" data-idx="1"><div class="tap-cd-step-dot"></div><span>Mapping top attractions & hidden gems…</span></div>
        <div class="tap-cd-step" data-idx="2"><div class="tap-cd-step-dot"></div><span>Estimating INR budget breakdown…</span></div>
        <div class="tap-cd-step" data-idx="3"><div class="tap-cd-step-dot"></div><span>Crafting day-by-day schedule…</span></div>
        <div class="tap-cd-step" data-idx="4"><div class="tap-cd-step-dot"></div><span>Writing local food & packing guide…</span></div>
        <div class="tap-cd-step" data-idx="5"><div class="tap-cd-step-dot"></div><span>Finalising tips & recommendations…</span></div>
      </div>
    </div>

    <!-- Itinerary output (hidden initially) -->
    <div class="tap-itin-card" id="tapItinCard" style="display:none">
      <div class="tap-itin-head">
        <div class="tap-itin-icon"><i class="fas fa-map-signs"></i></div>
        <div>
          <h3 id="tapItinTitle">Your Travel Itinerary</h3>
          <p id="tapItinSub">Generated by GlobeMate AI</p>
        </div>
        <div class="tap-itin-btns">
          <button class="tap-btn-sm tap-btn-save" id="tapSaveBtn"><i class="fas fa-save"></i> Save</button>
          <button class="tap-btn-sm" id="tapPrintBtn"><i class="fas fa-print"></i> Print</button>
          <button class="tap-btn-sm" id="tapShareBtn"><i class="fas fa-share-alt"></i> Share</button>
        </div>
      </div>
      <div class="tap-itin-body" id="tapItinBody"></div>
    </div>

  </div>
</div>

<!-- Back -->
<div class="tap-back-bar">
  <button class="tap-back-btn" data-tab="trip-planner"><i class="fas fa-arrow-left"></i> Back to Trip Planner</button>
</div>`;
    },

    bindAll() {
      document.getElementById('tapRestart')?.addEventListener('click', () => this.reset());
      document.getElementById('tapSend')?.addEventListener('click', () => this.handleInput());
      document.getElementById('tapTxt')?.addEventListener('keypress', e => { if (e.key==='Enter') this.handleInput(); });
      document.getElementById('tapSaveBtn')?.addEventListener('click', () => this.saveItinerary());
      document.getElementById('tapPrintBtn')?.addEventListener('click', () => this.printItinerary());
      document.getElementById('tapShareBtn')?.addEventListener('click', () => this.shareItinerary());
    },

    reset() {
      clearInterval(this.cdTimer);
      this.prefs  = {};
      this.step   = 0;
      this.chosen = [];

      document.getElementById('tapMsgs').innerHTML = '';
      document.getElementById('tapCountdown').style.display = 'none';
      document.getElementById('tapItinCard').style.display  = 'none';

      ['purpose','duration','budget','accommodation','interests','dietary'].forEach(k => {
        const v = document.getElementById(`val-${k}`);
        const d = document.getElementById(`dot-${k}`);
        if (v) v.textContent = '—';
        if (d) d.classList.remove('done');
      });

      this.runStep(0);
    },

    runStep(idx) {
      const s = STEPS[idx];
      if (!s) return;
      this.showTyping();
      setTimeout(() => {
        this.hideTyping();
        this.addMsg('ai', s.ai(this.trip, this.prefs));
        this.renderChips(s);
        const ir = document.getElementById('tapInputRow');
        if (ir) ir.style.display = s.free ? 'flex' : 'none';
        if (s.id === 'generate') setTimeout(() => this.startCountdown(), 800);
      }, 700);
    },

    renderChips(s) {
      const area = document.getElementById('tapChipsArea');
      const box  = document.getElementById('tapChips');
      if (!box || !area) return;
      this.chosen = [];
      box.innerHTML = '';
      if (!s.chips || !s.chips.length) { area.style.display = 'none'; return; }
      area.style.display = 'block';

      s.chips.forEach(label => {
        const btn = document.createElement('button');
        btn.className = 'tap-chip';
        btn.textContent = label;
        btn.addEventListener('click', () => {
          if (s.multi) {
            btn.classList.toggle('on');
            if (btn.classList.contains('on')) this.chosen.push(label);
            else this.chosen = this.chosen.filter(x => x !== label);
          } else {
            this.processAnswer(s, label);
          }
        });
        box.appendChild(btn);
      });

      if (s.multi) {
        const ok = document.createElement('button');
        ok.className = 'tap-chip tap-chip-ok';
        ok.innerHTML = '<i class="fas fa-check"></i> Confirm';
        ok.addEventListener('click', () => {
          const ans = this.chosen.length ? this.chosen.join(', ') : 'No preference';
          this.processAnswer(s, ans);
        });
        box.appendChild(ok);
      }
    },

    handleInput() {
      const txt = document.getElementById('tapTxt');
      if (!txt || !txt.value.trim()) return;
      const s = STEPS[this.step];
      if (!s) return;
      const val = txt.value.trim();
      txt.value = '';
      this.processAnswer(s, val);
    },

    processAnswer(s, answer) {
      document.getElementById('tapChipsArea').style.display = 'none';
      this.addMsg('user', answer);
      const parsed = s.parse ? s.parse(answer) : answer;
      if (s.key) {
        this.prefs[s.key] = parsed;
        this.updateProg(s.key, Array.isArray(parsed) ? parsed.join(', ') : String(parsed));
      }
      this.step++;
      if (this.step < STEPS.length) this.runStep(this.step);
    },

    updateProg(key, val) {
      const v = document.getElementById(`val-${key}`);
      const d = document.getElementById(`dot-${key}`);
      if (v) v.textContent = val.length > 28 ? val.slice(0,26)+'…' : val;
      if (d) d.classList.add('done');
    },

    /* ── Countdown (20 seconds) ── */
    startCountdown() {
      const cd = document.getElementById('tapCountdown');
      if (cd) cd.style.display = 'block';
      let secs = 20;
      const arc = document.getElementById('tapCdArc');
      const num = document.getElementById('tapCdNum');
      const circumference = 283;
      const cdStepEls = document.querySelectorAll('.tap-cd-step');
      const stepTimes = [18, 15, 12, 8, 4, 1]; // seconds remaining when each step lights up

      if (arc) arc.style.strokeDashoffset = '0';

      this.cdTimer = setInterval(() => {
        secs--;
        if (num) num.textContent = Math.max(secs, 0);
        if (arc) arc.style.strokeDashoffset = String(circumference - (circumference * ((20 - secs) / 20)));

        // light up steps
        stepTimes.forEach((threshold, i) => {
          if (secs <= threshold && cdStepEls[i]) cdStepEls[i].classList.add('lit');
        });

        if (secs <= 0) {
          clearInterval(this.cdTimer);
          if (cd) cd.style.display = 'none';
          this.showItinerary();
        }
      }, 1000);
    },

    showItinerary() {
      const html    = generateItinerary(this.trip, this.prefs);
      this.generatedHTML = html;

      const card    = document.getElementById('tapItinCard');
      const body    = document.getElementById('tapItinBody');
      const title   = document.getElementById('tapItinTitle');
      const sub     = document.getElementById('tapItinSub');

      if (title) title.textContent = `${this.prefs.duration||5}-Day ${this.trip.destination||'Trip'} Itinerary`;
      if (sub)   sub.textContent   = `Personalised for ${this.prefs.purpose||'your trip'} · GlobeMate AI`;
      if (body)  body.innerHTML    = html;
      if (card)  card.style.display = 'block';

      card.scrollIntoView({ behavior: 'smooth', block: 'start' });

      this.addMsg('ai', `✅ Your <strong>${this.prefs.duration||5}-day ${this.trip.destination||''} itinerary</strong> is ready with a full ₹ budget breakdown! 🎉\n\nScroll down to explore it. Use <strong>Save</strong> to store it, <strong>Print</strong> for a PDF, or <strong>Restart</strong> to adjust anything.`);
    },

    /* ── Save ── */
    saveItinerary() {
      const saved = JSON.parse(localStorage.getItem('globemate_saved_itineraries') || '[]');
      const entry = {
        id: Date.now(),
        destination: this.trip.destination || 'Unknown',
        date: new Date().toISOString(),
        prefs: this.prefs,
        trip: this.trip,
        html: this.generatedHTML
      };
      saved.unshift(entry);
      localStorage.setItem('globemate_saved_itineraries', JSON.stringify(saved));
      const btn = document.getElementById('tapSaveBtn');
      if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
        btn.style.borderColor = 'transparent';
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-save"></i> Save';
          btn.style.background = '';
          btn.style.borderColor = '';
        }, 2500);
      }
      if (typeof showToast === 'function') showToast(`Itinerary saved — ${this.trip.destination}!`, 'success');
    },

    /* ── Print ── */
    printItinerary() {
      const body = document.getElementById('tapItinBody');
      if (!body) return;
      const w = window.open('', '_blank');
      w.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>${this.trip.destination||'Trip'} Itinerary — GlobeMate</title>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
<style>
  body{font-family:'Inter',sans-serif;padding:28px;color:#0f172a;line-height:1.6;font-size:14px}
  h1{color:#7c3aed;margin-bottom:4px} .meta{color:#64748b;font-size:12px;margin-bottom:20px}
  .tap-overview{background:#1e1b4b;color:#fff;border-radius:10px;padding:16px;display:flex;flex-wrap:wrap;gap:14px;margin-bottom:16px}
  .tap-ov-item i{color:rgba(139,92,246,.8);margin-right:6px}
  .tap-ov-item small{font-size:10px;text-transform:uppercase;color:rgba(255,255,255,.45);display:block}
  .tap-ov-item strong{color:#fff;font-size:13px}
  .tap-pills{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
  .tap-pill{background:rgba(59,130,246,.07);border:1px solid rgba(59,130,246,.2);color:#2563eb;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:600}
  .tap-sec-label{font-weight:800;font-size:13px;border-bottom:2px solid #f1f5f9;padding-bottom:6px;margin:18px 0 10px;display:flex;align-items:center;gap:6px}
  .tap-sec-label i{color:#7c3aed}
  .tap-budget-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:6px}
  .tap-b-item{display:flex;align-items:center;gap:8px;padding:8px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc}
  .tap-b-icon{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:.8rem}
  .tap-b-cat{font-size:10px;color:#64748b;display:block} .tap-b-amt{font-size:13px;font-weight:800;display:block}
  .tap-b-total{grid-column:1/-1;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;padding:10px 14px;border-radius:8px;display:flex;justify-content:space-between}
  .tap-b-total strong{font-size:1.1rem}
  .tap-day{border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:12px}
  .tap-day-hdr{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0}
  .tap-day-num{background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:800}
  .tap-day-ti{font-weight:700;font-size:13px}
  .tap-day-body{padding:10px 14px}
  .tap-slot{display:flex;gap:10px;margin-bottom:7px;padding:7px;border-radius:7px;background:#f8fafc}
  .tap-slot-tag{font-size:10px;font-weight:700;padding:3px 8px;border-radius:5px;flex-shrink:0;width:80px}
  .morning{background:rgba(245,158,11,.1);color:#b45309} .afternoon{background:rgba(59,130,246,.1);color:#1d4ed8} .evening{background:rgba(139,92,246,.1);color:#7c3aed}
  .tap-slot-act{font-size:12px;font-weight:700;margin:0 0 2px} .tap-slot-det{font-size:11px;color:#64748b;margin:0}
  .tap-food-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
  .tap-food-item{display:flex;align-items:center;gap:6px;padding:7px;border-radius:8px;background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.18);font-size:11px;font-weight:600}
  .tap-hl-wrap{display:flex;flex-wrap:wrap;gap:6px}
  .tap-hl-chip{display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:100px;background:rgba(124,58,237,.06);border:1px solid rgba(124,58,237,.2);font-size:11px;font-weight:600}
  .tap-hl-n{width:15px;height:15px;border-radius:50%;background:#7c3aed;color:#fff;font-size:9px;display:flex;align-items:center;justify-content:center;font-weight:800}
  .tap-pack-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
  .tap-pack-item{display:flex;align-items:center;gap:6px;padding:6px 9px;border-radius:7px;background:rgba(16,185,129,.05);border:1px solid rgba(16,185,129,.18);font-size:11px}
  .tap-pack-item i{color:#10b981}
  .tap-tips-ul{list-style:none;padding:0;display:flex;flex-direction:column;gap:6px}
  .tap-tips-ul li{display:flex;align-items:flex-start;gap:8px;padding:7px 10px;border-radius:7px;background:#f8fafc;border:1px solid #e2e8f0;font-size:11px}
  .tap-tips-ul li i{color:#f59e0b;margin-top:1px}
  @media print{body{padding:0 8px}}
</style>
</head><body>
<h1>🌍 ${this.trip.destination||'Trip'} — Travel Itinerary</h1>
<div class="meta">Generated by GlobeMate AI &nbsp;·&nbsp; ${new Date().toLocaleDateString('en-IN')} &nbsp;·&nbsp; Purpose: ${this.prefs.purpose||'—'} &nbsp;·&nbsp; Duration: ${this.prefs.duration||5} Days &nbsp;·&nbsp; Budget: ${this.prefs.budget||'—'}</div>
${body.innerHTML}
</body></html>`);
      w.document.close();
      setTimeout(() => w.print(), 600);
    },

    /* ── Share ── */
    shareItinerary() {
      const text = `My ${this.prefs.duration||5}-day ${this.trip.destination||'trip'} itinerary — planned with GlobeMate AI! 🌍✈️ Budget: ${this.prefs.budget||'—'}`;
      if (navigator.share) {
        navigator.share({ title: 'My GlobeMate Itinerary', text }).catch(()=>{});
      } else {
        navigator.clipboard?.writeText(text).then(() => {
          if (typeof showToast === 'function') showToast('Itinerary summary copied!', 'success');
        });
      }
    },

    /* ── Messages helpers ── */
    addMsg(role, text) {
      const msgs = document.getElementById('tapMsgs');
      if (!msgs) return;
      const div = document.createElement('div');
      div.className = `tap-msg tap-msg-${role}`;
      const html = text.replace(/\n/g,'<br>');
      if (role === 'ai') {
        div.innerHTML = `<div class="tap-av tap-av-ai"><i class="fas fa-robot"></i></div>
          <div class="tap-bubble">${html}</div>`;
      } else {
        const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        div.innerHTML = `<div class="tap-bubble tap-bubble-user">${safe}</div>
          <div class="tap-av tap-av-user"><i class="fas fa-user"></i></div>`;
      }
      msgs.appendChild(div);
      requestAnimationFrame(() => div.classList.add('show'));
      msgs.scrollTop = msgs.scrollHeight;
    },

    showTyping() {
      const msgs = document.getElementById('tapMsgs');
      if (!msgs) return;
      const d = document.createElement('div');
      d.className = 'tap-msg tap-msg-ai'; d.id = 'tapTyping';
      d.innerHTML = `<div class="tap-av tap-av-ai"><i class="fas fa-robot"></i></div>
        <div class="tap-bubble"><div class="tap-typing-wrap">
          <span class="tap-dot"></span><span class="tap-dot"></span><span class="tap-dot"></span>
        </div></div>`;
      msgs.appendChild(d);
      requestAnimationFrame(() => d.classList.add('show'));
      msgs.scrollTop = msgs.scrollHeight;
    },

    hideTyping() {
      document.getElementById('tapTyping')?.remove();
    },

    cleanup() {
      clearInterval(this.cdTimer);
      const style = document.getElementById('tap-styles');
      if (style) style.remove();
    }
  };

  window.TripAIPlanner = TripAIPlanner;

  if (typeof PageLoader !== 'undefined') {
    PageLoader.registerModule('trip-ai-planner', TripAIPlanner);
  }
})();
