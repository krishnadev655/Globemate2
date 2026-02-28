// ============ AI TRIP PLANNER MODULE ============
(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     KNOWLEDGE BASE  (destination-aware answers)
  ───────────────────────────────────────────── */
  const DEST_FACTS = {
    france: {
      currency: 'EUR (Euro)', visa: 'Schengen Visa', language: 'French',
      timezone: 'CET (UTC+1)', plug: 'Type C/E', emergency: '112',
      bestMonths: 'April–June & September–October',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'Versailles', 'Mont Saint-Michel',
        'French Riviera', 'Bordeaux Vineyards', 'Provence Lavender Fields',
        'Palace of the Louvre', 'Chamonix Alps'],
      cuisine: ['Croissants & Baguettes', 'Coq au Vin', 'Crêpes', 'French Onion Soup',
        'Ratatouille', 'Crème Brûlée', 'Bouillabaisse', 'Foie Gras'],
      areas: { north: 'Paris & Normandy', south: 'Provence & Riviera', west: 'Loire Valley', east: 'Alsace & Alps' }
    },
    usa: {
      currency: 'USD', visa: 'ESTA / B1-B2 Visa', language: 'English',
      timezone: 'Multiple (EST/CST/MST/PST)', plug: 'Type A/B', emergency: '911',
      bestMonths: 'April–June & September–November',
      highlights: ['Statue of Liberty', 'Grand Canyon', 'Yellowstone', 'Times Square',
        'Golden Gate Bridge', 'Walt Disney World', 'Las Vegas Strip', 'Niagara Falls'],
      cuisine: ['BBQ Ribs', 'Clam Chowder', 'Deep-dish Pizza', 'Lobster Rolls',
        'Philly Cheesesteak', 'Tex-Mex', 'Buffalo Wings', 'Key Lime Pie'],
      areas: { east: 'New York & Washington DC', south: 'Florida & New Orleans', west: 'California & Nevada', central: 'Chicago & National Parks' }
    },
    japan: {
      currency: 'JPY (Yen)', visa: 'Visa-free (many passports)', language: 'Japanese',
      timezone: 'JST (UTC+9)', plug: 'Type A/B', emergency: '110 (police) / 119 (fire & ambulance)',
      bestMonths: 'March–May (cherry blossom) & October–December',
      highlights: ['Mount Fuji', 'Fushimi Inari Shrine', 'Hiroshima Peace Memorial',
        'Arashiyama Bamboo Forest', 'Tokyo Skytree', 'Nara Deer Park',
        'Osaka Castle', 'Kyoto Temples'],
      cuisine: ['Sushi & Sashimi', 'Ramen', 'Tempura', 'Takoyaki', 'Wagyu Beef',
        'Matcha Desserts', 'Yakitori', 'Onigiri'],
      areas: { central: 'Tokyo & Yokohama', west: 'Kyoto, Osaka & Nara', north: 'Hokkaido', south: 'Hiroshima & Miyajima' }
    },
    italy: {
      currency: 'EUR (Euro)', visa: 'Schengen Visa', language: 'Italian',
      timezone: 'CET (UTC+1)', plug: 'Type C/F', emergency: '112',
      bestMonths: 'April–June & September–October',
      highlights: ['Colosseum', 'Venice Canals', 'Amalfi Coast', 'Tuscany Hills',
        'Vatican Museums', 'Pompeii', 'Cinque Terre', 'Lake Como'],
      cuisine: ['Neapolitan Pizza', 'Pasta Carbonara', 'Gelato', 'Risotto',
        'Tiramisu', 'Bruschetta', 'Osso Buco', 'Cannoli'],
      areas: { north: 'Milan, Venice & Lake Como', centre: 'Florence & Tuscany', south: 'Naples & Amalfi', islands: 'Sicily & Sardinia' }
    },
    thailand: {
      currency: 'THB (Thai Baht)', visa: 'Visa-on-arrival / e-Visa', language: 'Thai',
      timezone: 'ICT (UTC+7)', plug: 'Type A/B/C', emergency: '191',
      bestMonths: 'November–February',
      highlights: ['Grand Palace', 'Phi Phi Islands', 'Chiang Mai Temples',
        'Floating Markets', 'Elephant Sanctuary', 'Wat Pho', 'Pai Canyon', 'Rail Market'],
      cuisine: ['Pad Thai', 'Tom Yum Goong', 'Som Tum', 'Massaman Curry',
        'Mango Sticky Rice', 'Green Curry', 'Khao Pad', 'Larb'],
      areas: { north: 'Chiang Mai & Pai', central: 'Bangkok', south: 'Phuket & Koh Samui', east: 'Koh Chang & Pattaya' }
    },
    default: {
      currency: 'Local currency', visa: 'Check with your embassy', language: 'Local language',
      timezone: 'Local timezone', plug: 'Universal adapter recommended', emergency: '112 (international)',
      bestMonths: 'Check seasonal guides',
      highlights: ['Historic landmarks', 'Local markets', 'Cultural sites',
        'Natural wonders', 'Cuisine tours', 'Museums', 'Day trips'],
      cuisine: ['Local street food', 'Traditional dishes', 'Regional specialties'],
      areas: {}
    }
  };

  function getDestFacts(destName) {
    if (!destName) return DEST_FACTS.default;
    const key = destName.toLowerCase().trim();
    for (const k of Object.keys(DEST_FACTS)) {
      if (key.includes(k) || k.includes(key)) return DEST_FACTS[k];
    }
    return DEST_FACTS.default;
  }

  /* ─────────────────────────────────────────────
     ITINERARY GENERATOR
  ───────────────────────────────────────────── */
  function generateItinerary(trip, prefs) {
    const facts = getDestFacts(trip.destination);
    const days = prefs.duration || 5;
    const dest = trip.destination || 'your destination';
    const from = trip.departureCity || 'your city';
    const budget = prefs.budget || 'moderate';
    const purpose = prefs.purpose || 'tourism';
    const accommodation = prefs.accommodation || 'mid-range hotel';
    const interests = prefs.interests || [];
    const passengers = trip.passengers || 1;

    const budgetTier = getBudgetTier(budget);
    const accomData = getAccomData(accommodation, dest, budgetTier);
    const transportData = getTransportData(trip.travelMode, from, dest, budgetTier, passengers);

    let html = '';

    // ── Overview Banner ──
    html += `
      <div class="tap-overview-banner">
        <div class="tap-overview-row">
          <div class="tap-ov-item">
            <i class="fas fa-globe-europe"></i>
            <div><small>Destination</small><strong>${dest}</strong></div>
          </div>
          <div class="tap-ov-item">
            <i class="fas fa-moon"></i>
            <div><small>Duration</small><strong>${days} Day${days > 1 ? 's' : ''}</strong></div>
          </div>
          <div class="tap-ov-item">
            <i class="fas fa-wallet"></i>
            <div><small>Budget</small><strong>${budget}</strong></div>
          </div>
          <div class="tap-ov-item">
            <i class="fas fa-bed"></i>
            <div><small>Stay</small><strong>${accomData.name}</strong></div>
          </div>
          <div class="tap-ov-item">
            <i class="fas fa-language"></i>
            <div><small>Language</small><strong>${facts.language}</strong></div>
          </div>
          <div class="tap-ov-item">
            <i class="fas fa-coins"></i>
            <div><small>Currency</small><strong>${facts.currency}</strong></div>
          </div>
        </div>
      </div>`;

    // ── Quick Tips ──
    html += `
      <div class="tap-tips-row">
        <div class="tap-tip-chip"><i class="fas fa-plug"></i> ${facts.plug}</div>
        <div class="tap-tip-chip"><i class="fas fa-phone-alt"></i> Emergency: ${facts.emergency}</div>
        <div class="tap-tip-chip"><i class="fas fa-clock"></i> ${facts.timezone}</div>
        <div class="tap-tip-chip"><i class="fas fa-id-card"></i> ${facts.visa}</div>
      </div>`;

    // ── Budget Breakdown ──
    const breakdown = buildBudgetBreakdown(budgetTier, days, passengers, transportData, accomData);
    html += `
      <div class="tap-section-label"><i class="fas fa-chart-pie"></i> Estimated Budget Breakdown</div>
      <div class="tap-budget-grid">
        ${breakdown.items.map(b => `
          <div class="tap-budget-item">
            <div class="tap-budget-icon" style="background:${b.color}20;color:${b.color}"><i class="fas fa-${b.icon}"></i></div>
            <div class="tap-budget-info">
              <span class="tap-budget-cat">${b.label}</span>
              <span class="tap-budget-amt">${breakdown.sym}${b.amount.toLocaleString()}</span>
            </div>
          </div>`).join('')}
        <div class="tap-budget-total">
          <span>Total Estimate</span>
          <strong>${breakdown.sym}${breakdown.total.toLocaleString()}</strong>
        </div>
      </div>`;

    // ── Day-by-Day Itinerary ──
    html += `<div class="tap-section-label"><i class="fas fa-map-signs"></i> Day-by-Day Itinerary</div>`;
    html += `<div class="tap-days-list">`;

    const dayPlans = buildDayPlans(dest, days, facts, prefs, purpose, budgetTier, accomData);
    dayPlans.forEach((day, idx) => {
      const tripDate = trip.tripDate ? new Date(trip.tripDate) : null;
      let dateStr = '';
      if (tripDate) {
        const d = new Date(tripDate);
        d.setDate(d.getDate() + idx);
        dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }

      html += `
        <div class="tap-day-card">
          <div class="tap-day-header">
            <div class="tap-day-num">Day ${idx + 1}</div>
            <div class="tap-day-title">${day.title}</div>
            ${dateStr ? `<div class="tap-day-date">${dateStr}</div>` : ''}
          </div>
          <div class="tap-day-body">
            ${['morning', 'afternoon', 'evening'].map(slot => `
              <div class="tap-slot">
                <div class="tap-slot-tag tap-slot-${slot}">
                  <i class="fas fa-${slot === 'morning' ? 'sun' : slot === 'afternoon' ? 'cloud-sun' : 'moon'}"></i>
                  ${slot.charAt(0).toUpperCase() + slot.slice(1)}
                </div>
                <div class="tap-slot-content">
                  <p class="tap-slot-activity">${day[slot].activity}</p>
                  <p class="tap-slot-detail">${day[slot].detail}</p>
                  ${day[slot].tip ? `<p class="tap-slot-tip"><i class="fas fa-lightbulb"></i> ${day[slot].tip}</p>` : ''}
                </div>
              </div>`).join('')}
          </div>
          ${day.accommodation ? `
            <div class="tap-day-stay">
              <i class="fas fa-bed"></i>
              <span>Stay: <strong>${day.accommodation}</strong></span>
              <span class="tap-day-stay-price">${breakdown.sym}${accomData.nightlyRate.toLocaleString()}/night</span>
            </div>` : ''}
        </div>`;
    });
    html += '</div>';

    // ── Local Food Guide ──
    html += `
      <div class="tap-section-label"><i class="fas fa-utensils"></i> Local Food Guide</div>
      <div class="tap-food-grid">
        ${facts.cuisine.slice(0, 6).map(dish => `
          <div class="tap-food-item">
            <div class="tap-food-icon"><i class="fas fa-drumstick-bite"></i></div>
            <span>${dish}</span>
          </div>`).join('')}
      </div>`;

    // ── Must-See Attractions ──
    html += `
      <div class="tap-section-label"><i class="fas fa-star"></i> Must-See Highlights</div>
      <div class="tap-highlights-grid">
        ${facts.highlights.map((h, i) => `
          <div class="tap-highlight-chip">
            <span class="tap-hl-num">${i + 1}</span>
            <span>${h}</span>
          </div>`).join('')}
      </div>`;

    // ── Packing Essentials ──
    const packingList = getPackingList(purpose, prefs.dietary, facts);
    html += `
      <div class="tap-section-label"><i class="fas fa-suitcase-rolling"></i> Packing Essentials</div>
      <div class="tap-packing-grid">
        ${packingList.map(item => `
          <div class="tap-pack-item"><i class="fas fa-check-circle"></i> ${item}</div>`).join('')}
      </div>`;

    // ── Travel Tips ──
    html += `
      <div class="tap-section-label"><i class="fas fa-info-circle"></i> GlobeMate AI Tips</div>
      <ul class="tap-tips-list">
        <li><i class="fas fa-bolt"></i> Best time to visit: <strong>${facts.bestMonths}</strong></li>
        <li><i class="fas fa-bolt"></i> Book ${accomData.name} at least 3–4 weeks in advance for the best rates.</li>
        <li><i class="fas fa-bolt"></i> Download an offline map (Maps.me or Google Maps offline) before departure.</li>
        <li><i class="fas fa-bolt"></i> Keep digital & printed copies of your passport and visa.</li>
        <li><i class="fas fa-bolt"></i> Carry <strong>${facts.currency}</strong> in small denominations for local markets.</li>
        ${prefs.dietary && prefs.dietary !== 'none' ? `<li><i class="fas fa-bolt"></i> Communicate dietary needs clearly — carry a translated card for <strong>${prefs.dietary}</strong> requirements.</li>` : ''}
        <li><i class="fas fa-bolt"></i> Purchase travel insurance before departure — it's worth every penny.</li>
        <li><i class="fas fa-bolt"></i> Emergency number in ${dest}: <strong>${facts.emergency}</strong></li>
      </ul>`;

    return html;
  }

  /* ─────────── Helper: Budget ─────────── */
  function getBudgetTier(budgetStr) {
    if (!budgetStr) return 'mid';
    const b = budgetStr.toLowerCase();
    if (b.includes('luxury') || b.includes('high') || b.includes('premium') || b.includes('5 star')) return 'luxury';
    if (b.includes('budget') || b.includes('cheap') || b.includes('backpack') || b.includes('hostel') || b.includes('low')) return 'budget';
    return 'mid';
  }

  function getAccomData(accommodation, dest, tier) {
    const tiers = {
      luxury:  { name: 'Luxury 5-star Hotel', nightlyRate: 350 },
      mid:     { name: 'Comfortable 3-4 star Hotel', nightlyRate: 120 },
      budget:  { name: 'Budget Hotel / Hostel', nightlyRate: 40 }
    };
    const accom = accommodation.toLowerCase();
    if (accom.includes('hostel')) return { name: 'Hostel / Dorm', nightlyRate: 25 };
    if (accom.includes('airbnb') || accom.includes('apartment')) return { name: 'Airbnb / Apartment', nightlyRate: 90 };
    if (accom.includes('luxury') || accom.includes('5 star')) return tiers.luxury;
    if (accom.includes('budget') || accom.includes('cheap')) return tiers.budget;
    return tiers[tier] || tiers.mid;
  }

  function getTransportData(mode, from, dest, tier, passengers) {
    const base = { flight: 600, train: 120, bus: 50, ship: 200 };
    const mults = { luxury: 2.5, mid: 1, budget: 0.65 };
    const ticketPrice = Math.round((base[mode] || 400) * (mults[tier] || 1));
    return { ticketPrice, perPerson: ticketPrice, total: ticketPrice * passengers };
  }

  function buildBudgetBreakdown(tier, days, passengers, transport, accom) {
    const curMap = { luxury: { sym: '$', mult: 1 }, mid: { sym: '$', mult: 1 }, budget: { sym: '$', mult: 1 } };
    const sym = '$';
    const daily = { luxury: { food: 120, activities: 150, local: 60 }, mid: { food: 50, activities: 60, local: 25 }, budget: { food: 20, activities: 20, local: 10 } };
    const d = daily[tier] || daily.mid;
    const flight = transport.total;
    const hotel = accom.nightlyRate * days * passengers;
    const food = d.food * days * passengers;
    const activities = d.activities * days * passengers;
    const local = d.local * days * passengers;
    const misc = Math.round((flight + hotel + food + activities) * 0.08);
    const total = flight + hotel + food + activities + local + misc;
    return {
      sym,
      total,
      items: [
        { label: 'Transport', amount: flight, icon: 'plane', color: '#3b82f6' },
        { label: 'Accommodation', amount: hotel, icon: 'bed', color: '#8b5cf6' },
        { label: 'Food & Dining', amount: food, icon: 'utensils', color: '#f59e0b' },
        { label: 'Activities & Entry', amount: activities, icon: 'ticket-alt', color: '#10b981' },
        { label: 'Local Transport', amount: local, icon: 'taxi', color: '#06b6d4' },
        { label: 'Miscellaneous', amount: misc, icon: 'shopping-bag', color: '#ec4899' },
      ]
    };
  }

  /* ─────────── Helper: Day Plans ─────────── */
  function buildDayPlans(dest, days, facts, prefs, purpose, tier, accom) {
    const highlights = [...facts.highlights];
    const cuisine = [...facts.cuisine];
    const interests = prefs.interests || [];
    const isBusiness = purpose.toLowerCase().includes('business') || purpose.toLowerCase().includes('work');
    const isHoneymoon = purpose.toLowerCase().includes('honeymoon') || purpose.toLowerCase().includes('romance');
    const isAdventure = purpose.toLowerCase().includes('adventure') || interests.some(i => i.toLowerCase().includes('adventure'));
    const isCulture = interests.some(i => i.toLowerCase().includes('cultur') || i.toLowerCase().includes('histor') || i.toLowerCase().includes('museum'));

    const plans = [];

    // Day 1 – Arrival
    plans.push({
      title: `Arrival & First Glimpse of ${dest}`,
      morning: {
        activity: `Depart & Fly to ${dest}`,
        detail: `Check in at the airport early, board your ${prefs.travelMode || 'flight'} and enjoy the journey. Carry snacks and a neck pillow for comfort.`,
        tip: 'Download an offline map and currency converter before you board.'
      },
      afternoon: {
        activity: `Arrive & Hotel Check-in`,
        detail: `Head to your ${accom.name}. Freshen up and get familiar with the neighbourhood. Exchange some local currency.`,
        tip: null
      },
      evening: {
        activity: `Welcome Dinner & First Stroll`,
        detail: `Try a nearby restaurant featuring local specialties — ${cuisine[0] || 'local cuisine'} is a must. Take a relaxing evening walk around the area.`,
        tip: `Ask hotel staff for the best local dining recommendations for ${cuisine[1] || 'traditional dishes'}.`
      },
      accommodation: accom.name
    });

    // Middle days
    for (let d = 2; d <= Math.max(days - 1, 2); d++) {
      const hl = highlights.splice(0, 2);
      const meal = cuisine.splice(0, 1)[0] || 'local cuisine';

      let title, morning, afternoon, evening;

      if (d === 2) {
        title = 'Major Landmarks & Culture';
        morning = {
          activity: `Visit ${hl[0] || 'Main Landmark'}`,
          detail: `Start early to beat the crowds. ${isCulture ? 'Consider hiring a local guide for richer storytelling.' : 'Take your time exploring at your own pace.'}`,
          tip: 'Book tickets online in advance to skip queues.'
        };
        afternoon = {
          activity: `${hl[1] || 'Old Town Exploration'} + Lunch`,
          detail: `Grab ${meal} at a local spot. Explore the streets, markets and architecture. ${isHoneymoon ? 'Look for rooftop restaurants with a view.' : ''}`,
          tip: null
        };
        evening = {
          activity: isBusiness ? 'Business Networking Event / Free Evening' : isHoneymoon ? 'Sunset Cruise or Rooftop Dinner' : 'Local Night Market or Cultural Show',
          detail: isBusiness ? 'Attend a local meetup or review your work agenda for tomorrow.' : `Immerse in local ${isHoneymoon ? 'romance and ambience' : 'culture and nightlife'}.`,
          tip: null
        };
      } else if (isAdventure && d === 3) {
        title = 'Adventure & Outdoor Exploration';
        morning = { activity: 'Morning Hike or Outdoor Activity', detail: `Explore natural landscapes around ${dest}. Pack water and sunscreen.`, tip: 'Start early to enjoy cooler temperatures.' };
        afternoon = { activity: 'Scenic Viewpoint & Picnic Lunch', detail: `Find a scenic spot for a relaxed outdoor lunch with local snacks.`, tip: null };
        evening = { activity: 'Relax & Recovery Dinner', detail: `Wind down with a hearty meal — ${cuisine[0] || 'local specialties'} recommended.`, tip: null };
      } else if (isBusiness && d === 3) {
        title = 'Business Meetings & City Centre';
        morning = { activity: 'Business Meetings / Conference', detail: 'Attend scheduled meetings. Dress professionally and carry business cards.', tip: 'Know local business etiquette.' };
        afternoon = { activity: 'Business Lunch & Networking', detail: `Take clients or colleagues to a fine dining experience — ${meal} works well.`, tip: null };
        evening = { activity: 'City Exploration (Free Evening)', detail: 'Explore a local landmark or shopping district on your own time.', tip: null };
      } else {
        const titles2 = ['Day Trips & Hidden Gems', 'Markets, Food & Local Life', 'Relaxation & Scenic Beauty', 'Museums, Art & Culture'];
        title = titles2[(d - 2) % titles2.length];
        morning = { activity: `${hl[0] || 'Day Trip or Excursion'}`, detail: `Embark on a morning excursion to a nearby area. ${Object.values(facts.areas || {}).slice(0, 1)}`, tip: null };
        afternoon = { activity: 'Local Market & Street Food', detail: `Browse a local market. Try ${meal} and interact with vendors for an authentic experience.`, tip: 'Bargaining is common in local markets — be polite but firm.' };
        evening = { activity: 'Sunset View & Dinner', detail: `Find a high-point or waterfront for sunset. Dine at a restaurant offering ${cuisine[0] || 'local fare'}.`, tip: null };
      }

      plans.push({ title, morning, afternoon, evening, accommodation: accom.name });
    }

    // Last day – Departure
    if (days > 1) {
      plans.push({
        title: 'Last Memories & Departure',
        morning: {
          activity: 'Final Morning Stroll & Breakfast',
          detail: `Savour a final breakfast at a favourite café. Pick up any last-minute souvenirs or gifts.`,
          tip: null
        },
        afternoon: {
          activity: 'Hotel Check-out & Head to Airport/Station',
          detail: `Pack up, settle the bill and leave for your departure point. Allow at least 3 hours for international departures.`,
          tip: 'Keep your passport, boarding pass and itinerary accessible.'
        },
        evening: {
          activity: 'Journey Home',
          detail: 'Board your transport and reflect on an incredible trip. Safe travels!',
          tip: null
        },
        accommodation: null
      });
    }

    return plans.slice(0, days);
  }

  /* ─────────── Helper: Packing ─────────── */
  function getPackingList(purpose, dietary, facts) {
    const base = [
      'Passport & Visa documents', 'Travel insurance certificate',
      'Universal power adapter (' + facts.plug + ')',
      'Local currency + card backup', 'Medications & first-aid kit',
      'Comfortable walking shoes', 'Weather-appropriate clothing',
      'Sunscreen & insect repellent', 'Reusable water bottle',
      'Offline maps downloaded', 'Emergency contact list',
    ];
    if (purpose && purpose.toLowerCase().includes('business')) {
      base.push('Business attire & cards', 'Laptop & charger', 'Presentation materials');
    }
    if (dietary && dietary !== 'none') {
      base.push(`Dietary card translated to ${facts.language}`, 'Safe snacks for emergencies');
    }
    return base;
  }

  /* ─────────────────────────────────────────────
     CONVERSATION ENGINE
  ───────────────────────────────────────────── */
  const STEPS = [
    {
      id: 'welcome',
      sendAI: (trip) => `👋 Hello! I\'m your **GlobeMate AI Travel Assistant**.

I can see you\'re planning a trip to **${trip.destination || 'your destination'}**${trip.tripDate ? ' on **' + new Date(trip.tripDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) + '**' : ''}. 

I\'ll help you build a **detailed, day-by-day itinerary** tailored to your budget and travel style. Let\'s start! 🌍

**What is the main purpose of your trip?**`,
      chips: ['Tourism & Sightseeing', 'Business / Work', 'Honeymoon / Romance', 'Family Holiday', 'Adventure & Outdoors', 'Medical / Wellness'],
      key: 'purpose',
      freeText: true
    },
    {
      id: 'duration',
      sendAI: (trip, prefs) => `Great — a **${prefs.purpose}** trip! 🎉

I noticed your travel date${trip.returnDate ? ` and return date give you roughly **${calcDays(trip.tripDate, trip.returnDate)} days**` : ''}. 

**How many days will you be spending in ${trip.destination || 'the destination'}?**`,
      chips: ['3 Days', '5 Days', '7 Days', '10 Days', '14 Days', '3 Weeks+'],
      key: 'duration',
      parseAnswer: (ans) => parseInt(ans) || 5,
      freeText: true
    },
    {
      id: 'budget',
      sendAI: (trip, prefs) => `Perfect — **${prefs.duration} days** in ${trip.destination || 'the destination'}!

**What is your approximate total budget for this trip?** (include flights, accommodation, food & activities — for all ${trip.passengers || 1} passenger${(trip.passengers || 1) > 1 ? 's' : ''})`,
      chips: ['Under $500', '$500–$1,000', '$1,000–$2,500', '$2,500–$5,000', '$5,000–$10,000', 'Luxury (15,000+)'],
      key: 'budget',
      freeText: true
    },
    {
      id: 'accommodation',
      sendAI: (trip, prefs) => `Got it — budget of **${prefs.budget}**. 

**What type of accommodation do you prefer?**`,
      chips: ['Luxury 5-star Hotel', 'Comfortable 3-4 star Hotel', 'Budget Hotel / Guesthouse', 'Hostel / Dormitory', 'Airbnb / Apartment', 'No preference'],
      key: 'accommodation',
      freeText: true
    },
    {
      id: 'interests',
      sendAI: (trip, prefs) => `Great choice — **${prefs.accommodation}**! 🛎️

**What are your main interests for this trip?** (pick all that apply or type your own)`,
      chips: ['History & Culture', 'Food & Cuisine', 'Adventure & Hiking', 'Shopping', 'Nightlife & Entertainment', 'Nature & Wildlife', 'Photography', 'Relaxation & Spa'],
      key: 'interests',
      multi: true,
      freeText: true
    },
    {
      id: 'dietary',
      sendAI: (trip, prefs) => `Noted your interests: **${Array.isArray(prefs.interests) ? prefs.interests.join(', ') : prefs.interests}**. 🌟

Almost there! Do you have any **dietary requirements or special needs** we should factor in?`,
      chips: ['None', 'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-free', 'Nut allergy'],
      key: 'dietary',
      freeText: true
    },
    {
      id: 'generate',
      sendAI: (trip, prefs) => `Wonderful! I have everything I need. 🎯

Let me now craft your **personalised ${prefs.duration}-day itinerary** for **${trip.destination}**...

⏳ Generating your travel plan…`,
      chips: [],
      key: null,
      freeText: false
    }
  ];

  function calcDays(start, end) {
    if (!start || !end) return null;
    const diff = new Date(end) - new Date(start);
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  }

  /* ─────────────────────────────────────────────
     MODULE
  ───────────────────────────────────────────── */
  const TripAIPlanner = {
    trip: null,
    prefs: {},
    currentStep: 0,
    selectedChips: [],
    generatedHTML: '',

    init() {
      // Load trip data
      const tripId = parseInt(localStorage.getItem('globemate_ai_trip_id'));
      const trips = JSON.parse(localStorage.getItem('globemateTrips') || '[]');
      this.trip = trips.find(t => t.id === tripId) || trips[trips.length - 1] || {};

      this.renderTripBar();
      this.bindEvents();
      this.resetConversation();
    },

    renderTripBar() {
      const t = this.trip;
      const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
      setVal('tapDestName', t.destination);
      setVal('tapTravelDate', t.tripDate ? new Date(t.tripDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : null);
      setVal('tapDepartCity', t.departureCity);
      setVal('tapTravelMode', t.travelMode ? t.travelMode.charAt(0).toUpperCase() + t.travelMode.slice(1) : null);
      setVal('tapPassengers', t.passengers ? `${t.passengers} Passenger${t.passengers > 1 ? 's' : ''}` : null);
    },

    bindEvents() {
      const sendBtn = document.getElementById('tapSendBtn');
      const input = document.getElementById('tapUserInput');
      const resetBtn = document.getElementById('tapResetBtn');
      const printBtn = document.getElementById('tapPrintBtn');
      const shareBtn = document.getElementById('tapShareItineraryBtn');

      if (sendBtn) sendBtn.addEventListener('click', () => this.handleUserInput());
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') this.handleUserInput();
        });
      }
      if (resetBtn) resetBtn.addEventListener('click', () => this.resetConversation());
      if (printBtn) printBtn.addEventListener('click', () => this.printItinerary());
      if (shareBtn) shareBtn.addEventListener('click', () => this.shareItinerary());
    },

    resetConversation() {
      this.prefs = {};
      this.currentStep = 0;
      this.selectedChips = [];

      const msgs = document.getElementById('tapMessages');
      if (msgs) msgs.innerHTML = '';

      const itineraryCard = document.getElementById('tapItineraryCard');
      if (itineraryCard) itineraryCard.classList.add('hidden');

      this.resetProgressUI();
      this.runStep(0);
    },

    resetProgressUI() {
      ['purpose', 'duration', 'budget', 'accommodation', 'interests', 'dietary'].forEach(key => {
        const el = document.getElementById(`prog-${key}`);
        if (el) el.textContent = '—';
        const dot = document.querySelector(`.tap-prog-step[data-step="${key}"] .tap-prog-dot`);
        if (dot) dot.className = 'tap-prog-dot';
      });
    },

    runStep(stepIdx) {
      const step = STEPS[stepIdx];
      if (!step) return;

      const aiText = typeof step.sendAI === 'function' ? step.sendAI(this.trip, this.prefs) : '';

      // Delay for typing effect
      this.addTypingIndicator();
      setTimeout(() => {
        this.removeTypingIndicator();
        this.addMessage('ai', aiText);
        this.renderChips(step);

        // Input bar visibility
        const inputBar = document.getElementById('tapInputBar');
        if (inputBar) inputBar.style.display = step.freeText ? 'flex' : 'none';

        // If generate step — actually generate
        if (step.id === 'generate') {
          setTimeout(() => this.generateAndDisplay(), 1500);
        }
      }, 900);
    },

    renderChips(step) {
      const wrap = document.getElementById('tapChipsWrap');
      const chips = document.getElementById('tapChips');
      if (!chips || !wrap) return;

      this.selectedChips = [];
      chips.innerHTML = '';

      if (!step.chips || step.chips.length === 0) {
        wrap.style.display = 'none';
        return;
      }

      wrap.style.display = 'block';

      step.chips.forEach(label => {
        const btn = document.createElement('button');
        btn.className = 'tap-chip';
        btn.textContent = label;
        btn.addEventListener('click', () => {
          if (step.multi) {
            btn.classList.toggle('selected');
            if (btn.classList.contains('selected')) {
              this.selectedChips.push(label);
            } else {
              this.selectedChips = this.selectedChips.filter(c => c !== label);
            }
            if (this.selectedChips.length > 0) {
              this.processChipAnswer(step, this.selectedChips.join(', '));
            }
          } else {
            this.processChipAnswer(step, label);
          }
        });
        chips.appendChild(btn);
      });

      // Confirm button for multi-select
      if (step.multi) {
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'tap-chip tap-chip-confirm';
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirm';
        confirmBtn.addEventListener('click', () => {
          const answer = this.selectedChips.length > 0 ? this.selectedChips.join(', ') : 'No preference';
          this.processAnswer(step, answer);
        });
        chips.appendChild(confirmBtn);
      }
    },

    processChipAnswer(step, answer) {
      if (!step.multi) {
        this.processAnswer(step, answer);
      }
      // Multi is handled by confirm button
    },

    handleUserInput() {
      const input = document.getElementById('tapUserInput');
      if (!input || !input.value.trim()) return;

      const step = STEPS[this.currentStep];
      if (!step) return;

      const answer = input.value.trim();
      input.value = '';
      this.processAnswer(step, answer);
    },

    processAnswer(step, answer) {
      if (!step.key) return;

      // Hide chips
      const wrap = document.getElementById('tapChipsWrap');
      if (wrap) wrap.style.display = 'none';

      // Add user message
      this.addMessage('user', answer);

      // Store answer
      const parsed = step.parseAnswer ? step.parseAnswer(answer) : answer;
      this.prefs[step.key] = parsed;

      // Update progress UI
      this.updateProgress(step.key, Array.isArray(parsed) ? parsed.join(', ') : String(parsed));

      // Advance
      this.currentStep++;
      if (this.currentStep < STEPS.length) {
        this.runStep(this.currentStep);
      }
    },

    updateProgress(key, value) {
      const el = document.getElementById(`prog-${key}`);
      if (el) el.textContent = value.length > 30 ? value.slice(0, 28) + '…' : value;
      const dot = document.querySelector(`.tap-prog-step[data-step="${key}"] .tap-prog-dot`);
      if (dot) dot.classList.add('done');
    },

    generateAndDisplay() {
      const itinerary = generateItinerary(this.trip, this.prefs);
      this.generatedHTML = itinerary;

      const card = document.getElementById('tapItineraryCard');
      const body = document.getElementById('tapItineraryBody');
      const title = document.getElementById('tapItineraryTitle');
      const subtitle = document.getElementById('tapItinerarySubtitle');

      if (title) title.textContent = `${this.prefs.duration || 5}-Day ${this.trip.destination || 'Trip'} Itinerary`;
      if (subtitle) subtitle.textContent = `Personalised for ${this.prefs.purpose || 'your trip'} by GlobeMate AI`;
      if (body) body.innerHTML = itinerary;
      if (card) card.classList.remove('hidden');

      card.scrollIntoView({ behavior: 'smooth', block: 'start' });

      this.addMessage('ai', `✅ Your **${this.prefs.duration || 5}-day ${this.trip.destination || ''} itinerary** is ready! Scroll down on the right to explore it. You can print or share it using the buttons above the plan. 🎉

Want to **adjust anything**? Click **Restart** to refine your preferences.`);
    },

    /* ── Messages UI ── */
    addMessage(role, text) {
      const msgs = document.getElementById('tapMessages');
      if (!msgs) return;

      const div = document.createElement('div');
      div.className = `tap-msg tap-msg-${role}`;

      if (role === 'ai') {
        div.innerHTML = `
          <div class="tap-msg-avatar-ai"><i class="fas fa-robot"></i></div>
          <div class="tap-msg-bubble">${this.parseMarkdown(text)}</div>`;
      } else {
        div.innerHTML = `
          <div class="tap-msg-bubble tap-msg-bubble-user">${this.escapeHtml(text)}</div>
          <div class="tap-msg-avatar-user"><i class="fas fa-user"></i></div>`;
      }

      msgs.appendChild(div);

      // Animate in
      requestAnimationFrame(() => div.classList.add('visible'));

      // Scroll to bottom
      msgs.scrollTop = msgs.scrollHeight;
    },

    addTypingIndicator() {
      const msgs = document.getElementById('tapMessages');
      if (!msgs) return;
      const div = document.createElement('div');
      div.className = 'tap-msg tap-msg-ai tap-typing';
      div.id = 'tapTypingIndicator';
      div.innerHTML = `
        <div class="tap-msg-avatar-ai"><i class="fas fa-robot"></i></div>
        <div class="tap-msg-bubble tap-typing-bubble">
          <span class="tap-typing-dot"></span>
          <span class="tap-typing-dot"></span>
          <span class="tap-typing-dot"></span>
        </div>`;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    },

    removeTypingIndicator() {
      const el = document.getElementById('tapTypingIndicator');
      if (el) el.remove();
    },

    parseMarkdown(text) {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    },

    escapeHtml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    printItinerary() {
      const body = document.getElementById('tapItineraryBody');
      if (!body) return;
      const win = window.open('', '_blank');
      win.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>${this.trip.destination || 'Trip'} Itinerary — GlobeMate</title>
<style>
  body{font-family:sans-serif;padding:24px;color:#1e293b;line-height:1.6}
  h1{color:#3b82f6}strong{font-weight:700}
  .tap-overview-banner,.tap-budget-grid,.tap-days-list,.tap-food-grid,.tap-highlights-grid,.tap-packing-grid{margin-bottom:24px}
  .tap-day-card{border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:16px}
  .tap-day-header{display:flex;gap:12px;align-items:center;margin-bottom:12px;font-weight:700}
  .tap-slot{display:flex;gap:8px;margin-bottom:8px;padding:8px;border-radius:8px;background:#f8fafc}
  .tap-tips-list li{margin-bottom:6px}
  @media print{body{padding:0}}
</style></head><body>
<h1>🌍 ${this.trip.destination || 'Trip'} — Travel Itinerary</h1>
<p>Generated by GlobeMate AI | ${new Date().toLocaleDateString()}</p>
${body.innerHTML}
</body></html>`);
      win.document.close();
      setTimeout(() => win.print(), 500);
    },

    shareItinerary() {
      const text = `My ${this.prefs.duration || 5}-day trip to ${this.trip.destination || 'amazing destination'} — planned with GlobeMate AI! 🌍✈️`;
      if (navigator.share) {
        navigator.share({ title: 'My GlobeMate Itinerary', text });
      } else if (typeof copyToClipboard === 'function') {
        copyToClipboard(text);
        if (typeof showToast === 'function') showToast('Itinerary summary copied!', 'success');
      }
    },

    cleanup() {
      this.trip = null;
      this.prefs = {};
    }
  };

  window.TripAIPlanner = TripAIPlanner;

  if (typeof PageLoader !== 'undefined') {
    PageLoader.registerModule('trip-ai-planner', TripAIPlanner);
  }
})();
