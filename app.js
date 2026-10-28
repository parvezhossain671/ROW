/**
 * Barishal Palli Bidyut Samity-1 | Central Operations & Management System
 * Integrated Modules:
 * 1) ROW Management System (daily_row_work, offices)
 * 2) Monthly Technical Report (সকল অফিসের মাসিক কাজের প্রতিবেদন - দৈনিক অভিযোগ কেন্দ্র এন্ট্রি ও অর্থ বছর ক্রমপুঞ্জিত হিসাব সহ)
 * 3) GIS Location Finder (Consumer locations, KML management)
 * 4) Lines & Transformers (Future)
 */

// ================= GLOBAL NAVIGATION & MODULE CONTROLLER =================
window.openModule = function(type) {
  if (window.location.hash !== "#" + type) {
    window.location.hash = type;
  }

  const portal = document.getElementById("frontPortal");
  const rowShell = document.getElementById("rowModuleShell");
  const gisShell = document.getElementById("gisModuleShell");
  const monthlyShell = document.getElementById("monthlyModuleShell");
  const otherShell = document.getElementById("otherModuleShell");
  const backBtn = document.getElementById("backToHomeBtn");
  const subTitle = document.getElementById("topSubTitle");

  if (portal) portal.style.display = "none";
  if (backBtn) backBtn.style.display = "inline-block";

  if (type === 'row') {
    if (gisShell) gisShell.style.display = "none";
    if (monthlyShell) monthlyShell.style.display = "none";
    if (otherShell) otherShell.style.display = "none";
    if (rowShell) rowShell.style.display = "flex";
    if (subTitle) subTitle.textContent = "Daily Right of Way (ROW) Work Management";
    if (typeof loadRow === 'function') loadRow();
  } else if (type === 'gis') {
    if (rowShell) rowShell.style.display = "none";
    if (monthlyShell) monthlyShell.style.display = "none";
    if (otherShell) otherShell.style.display = "none";
    if (gisShell) gisShell.style.display = "block";
    if (subTitle) subTitle.textContent = "GIS Location Finder • Consumer & Map Dashboard";
    if (typeof initGis === 'function') initGis();
  } else if (type === 'monthly') {
    if (rowShell) rowShell.style.display = "none";
    if (gisShell) gisShell.style.display = "none";
    if (otherShell) otherShell.style.display = "none";
    if (monthlyShell) monthlyShell.style.display = "block";
    if (subTitle) subTitle.textContent = "কারিগরী বিভাগের মাসিক কাজের প্রতিবেদন";
    if (typeof initMonthlyReport === 'function') initMonthlyReport();
  } else {
    if (rowShell) rowShell.style.display = "none";
    if (gisShell) gisShell.style.display = "none";
    if (monthlyShell) monthlyShell.style.display = "none";
    if (otherShell) otherShell.style.display = "flex";

    const titleEl = document.getElementById("moduleTitle");
    const descEl = document.getElementById("moduleDesc");
    const iconEl = document.getElementById("moduleIcon");

    if (type === 'line') {
      if (titleEl) titleEl.textContent = "লাইন ও ট্রান্সফরমার সংক্রান্ত মডিউল";
      if (descEl) descEl.textContent = "বিতরণ লাইন মেরামত, ট্রান্সফরমার লোড-টেস্টিং ও সংরক্ষণ তথ্য মডিউল প্রস্তুত হচ্ছে।";
      if (iconEl) iconEl.textContent = "⚡";
      if (subTitle) subTitle.textContent = "Distribution Line & Transformer Tracking";
    }
  }
};

window.showPortal = function() {
  if (window.location.hash) {
    window.history.replaceState(null, null, ' '); 
  }

  const portal = document.getElementById("frontPortal");
  const rowShell = document.getElementById("rowModuleShell");
  const gisShell = document.getElementById("gisModuleShell");
  const monthlyShell = document.getElementById("monthlyModuleShell");
  const otherShell = document.getElementById("otherModuleShell");
  const backBtn = document.getElementById("backToHomeBtn");
  const subTitle = document.getElementById("topSubTitle");

  if (portal) portal.style.display = "block";
  if (rowShell) rowShell.style.display = "none";
  if (gisShell) gisShell.style.display = "none";
  if (monthlyShell) monthlyShell.style.display = "none";
  if (otherShell) otherShell.style.display = "none";
  if (backBtn) backBtn.style.display = "none";
  if (subTitle) subTitle.textContent = "সেন্ট্রাল অপারেশন ও ম্যানেজমেন্ট পোর্টাল";

  if (typeof closeMobileMenu === 'function') closeMobileMenu();
};


// ================= MODULE 1: ROW MANAGEMENT =================
const ROW_SUPABASE_URL = "https://zagnttuftlkdrhyrwabx.supabase.co";
const ROW_KEY = "sb_publishable_4rr4OPiyCkCFXp05EgViUg_aC38LFqd";

const ROW_MAP = {
  "বরিশাল সদর": ["সদর দপ্তর অ/কে", "সাহেবেরহাট এরিয়া অফিস", "সাহেবেরহাট এরিয়া অফিস", "চরামদ্দী এরিয়া অফিস", "চরমোনাই এরিয়া অফিস", "কড়াপুর অ/কে", "কড়াপুর অ/কে", "ছয়মাইল অ/কে", "ছামাইল অ/কে", "চরবাড়ীয়া অ/কে", "চরবাড়ীয়া অ/কে", "বুখাইনগর অ/কে", "বুধাইনগর অ/কে", "চরকাউয়া অ/কে", "চরকাউয়া অ/কে", "কামারখালী অ/কে", "কমরখালী অ/কে"],
  "মুলাদী": ["মুলাদী সদর অ/কে", "কাজীরহাট এ/কে", "কাজীরহাট অ/কে", "কাজিরহাট অ/কে", "সোনামদ্দিন বন্দর অ/কে", "চরপদ্মা অ/কে", "নাজিরপুর অ/কে", "রহমানেরহাট অ/কে", "রহমানপুরহাট অ/কে"],
  "বাকেরগঞ্জ": ["বাকেরগঞ্জ সদর অ/কে", "কলসকাঠী অ/কে", "পেয়ারপুর অ/কে", "পেয়ারাপুর অ/কে", "পেয়ারপুর অ/কে", "পাদ্রীশিবপুর অ/কে", "সেনেরহাট অ/কে", "নলুয়া অ/কে", "নলুয়া অ/কে", "নন্দুয়ালী অ/কে", "মহেশপুর অ/কে"],
  "মেহেন্দিগঞ্জ": ["মেহেন্দিগঞ্জ সদর অ/কে", "জাঙ্গালিয়া অ/কে", "জাঙ্গালিয়া অ/কে", "ডাঙ্গালিয়া অ/কে", "মাষ্টারহাট অ/কে", "মাষ্টার হাট অ/কে"],
  "হিজলা": ["হিজলা সদর অ/কে", "কাউরিয়া অ/কে", "কাউরিয়া অ/কে", "মেমানিয়া অ/কে", "মেমানিয়া অ/কে"]
};

const cleanStr = str => str ? str.replace(/য়/g, 'য়').replace(/ড়/g, 'ড়').trim() : "";
const ROW_AREA = {};
Object.entries(ROW_MAP).forEach(([a, x]) => x.forEach(o => ROW_AREA[cleanStr(o)] = a));

let rowOffices = [], rowAllOffices = [], rowWorkData = [],
  today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
  rowAccessToken = null, rowCurrentUser = null;

const $ = id => document.getElementById(id);
const num = x => Number(x || 0);
const fmt = x => num(x).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const pct = (r, t) => t ? Math.min(100, r / t * 100) : 0;

const getArea = o => {
  if (!o) return "বরিশাল সদর";
  const norm = cleanStr(o);
  if (ROW_AREA[norm]) return ROW_AREA[norm];
  if (norm.includes("পেয়ারপুর") || norm.includes("পেয়ারাপুর") || norm.includes("নলুয়া") || norm.includes("বাকেরগঞ্জ") || norm.includes("কলসকাঠী") || norm.includes("পাদ্রীশিবপুর") || norm.includes("সেনেরহাট")) return "বাকেরগঞ্জ";
  if (norm.includes("জাঙ্গালিয়া") || norm.includes("মেহেন্দিগঞ্জ") || norm.includes("মাষ্টারহাট")) return "মেহেন্দিগঞ্জ";
  if (norm.includes("কড়াপুর") || norm.includes("সাহেবেরহাট") || norm.includes("চরকাউয়া") || norm.includes("চরমোনাই") || norm.includes("চরামদ্দী") || norm.includes("ছয়মাইল") || norm.includes("চরবাড়ীয়া") || norm.includes("বুখাইনগর") || norm.includes("কামারখালী")) return "বরিশাল সদর";
  if (norm.includes("মুলাদী") || norm.includes("কাজীরহাট") || norm.includes("সোনামদ্দিন")) return "মুলাদী";
  if (norm.includes("হিজলা") || norm.includes("কাউরিয়া") || norm.includes("মেমানিয়া")) return "হিজলা";
  for (const [a, arr] of Object.entries(ROW_MAP)) {
    if (arr.some(item => norm.includes(cleanStr(item)) || cleanStr(item).includes(norm))) return a;
  }
  return "বরিশাল সদর";
};

async function rowApi(path, opt = {}) {
  const h = { apikey: ROW_KEY, "Content-Type": "application/json", ...(opt.headers || {}) };
  if (rowAccessToken) h.Authorization = `Bearer ${rowAccessToken}`;
  const r = await fetch(ROW_SUPABASE_URL + "/rest/v1/" + path, { ...opt, headers: h });
  const t = await r.text();
  if (!r.ok) throw Error(t || `HTTP ${r.status}`);
  return t ? JSON.parse(t) : [];
}

function officeStats() {
  return rowOffices.map(o => {
    const rs = rowWorkData.filter(r => r.office_id === o.id);
    return { ...o, area: getArea(o.office_name), row: rs.reduce((s, r) => s + num(r.row_km), 0), lab: rs.reduce((s, r) => s + num(r.labour_count), 0) };
  });
}

function renderRow() {
  const os = officeStats();
  const T = rowOffices.reduce((s, o) => s + num(o.target_km), 0);
  const R = os.reduce((s, o) => s + o.row, 0);
  const L = os.reduce((s, o) => s + o.lab, 0);
  const rem = Math.max(0, T - R);
  const P = pct(R, T);

  if ($("headDate")) $("headDate").textContent = today.split("-").reverse().join("-");
  if ($("kOff")) $("kOff").textContent = rowOffices.length;
  if ($("kTarget")) $("kTarget").textContent = fmt(T);
  if ($("kDone")) $("kDone").textContent = fmt(R);
  if ($("kRemain")) $("kRemain").textContent = fmt(rem);
  if ($("kLabour")) $("kLabour").textContent = fmt(L);
  if ($("doneBar")) $("doneBar").style.width = P + "%";
  if ($("remainBar")) $("remainBar").style.width = (100 - P) + "%";
  if ($("donePct")) $("donePct").textContent = P.toFixed(1) + "% সম্পন্ন";
  if ($("remainPct")) $("remainPct").textContent = (100 - P).toFixed(1) + "% অবশিষ্ট";
  if ($("donutPct")) $("donutPct").textContent = P.toFixed(1) + "%";
  if (document.querySelector(".donut")) document.querySelector(".donut").style.background = `conic-gradient(#159b55 0 ${P * 3.6}deg,#e4ebf2 ${P * 3.6}deg 360deg)`;

  let am = {};
  Object.keys(ROW_MAP).forEach(a => am[a] = { t: 0, r: 0, l: 0 });
  os.forEach(o => { if (am[o.area]) { am[o.area].t += num(o.target_km); am[o.area].r += o.row; am[o.area].l += o.lab; } });
  const mx = Math.max(...Object.values(am).map(x => x.t), 1);
  if ($("bars")) $("bars").innerHTML = Object.entries(am).map(([a, x]) => `<div class="barGroup"><div class="target" style="height:${x.t / mx * 150}px"><span>${fmt(x.t)}</span></div><div class="done" style="height:${x.r / mx * 150}px"><span>${fmt(x.r)}</span></div><label>${a}</label></div>`).join("");

  if ($("areaBody")) {
    $("areaBody").innerHTML = os.length ? os.map((o, i) => {
      const p = pct(o.row, o.target_km);
      return `<tr>
        <td>${i + 1}</td>
        <td><b>${o.office_name}</b><br><small style="color:#666">${o.area}</small></td>
        <td>${fmt(o.target_km)}</td>
        <td>${fmt(o.row)}</td>
        <td>${fmt(Math.max(0, num(o.target_km) - o.row))}</td>
        <td>${p.toFixed(1)}%</td>
        <td><span class="status ${p < 65 ? 'warn' : ''}">${p < 65 ? 'অগ্রগতি' : 'চলমান'}</span></td>
      </tr>`;
    }).join("") + `<tr><th colspan="2">মোট</th><th>${fmt(T)}</th><th>${fmt(R)}</th><th>${fmt(rem)}</th><th>${P.toFixed(1)}%</th><th>-</th></tr>` : `<tr><td colspan="7">Data পাওয়া যায়নি</td></tr>`;
  }

  const recent = rowWorkData.slice().sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)).slice(0, 5);
  if ($("recentList")) $("recentList").innerHTML = recent.length ? recent.map((r, i) => { const o = rowOffices.find(x => x.id === r.office_id); return `<div class="recentItem"><div class="rIcon" style="background:${i % 3 === 0 ? '#08a55b' : i % 3 === 1 ? '#1685e8' : '#f5a000'}">${i % 3 === 0 ? '✓' : i % 3 === 1 ? '↗' : '◷'}</div><div><b>${o?.office_name || '-'}</b><small>ROW কাজ ${fmt(r.row_km)} KM · Labour ${r.labour_count}</small></div><time>${r.work_date}</time></div>`; }).join("") : "<p>সাম্প্রতিক data নেই</p>";

  const rr = rowWorkData.slice().sort((a, b) => b.work_date.localeCompare(a.work_date)).slice(0, 5);
  if ($("rowMini")) $("rowMini").innerHTML = rr.length ? rr.map((r, i) => { const o = rowOffices.find(x => x.id === r.office_id); return `<tr><td>${i + 1}</td><td>${r.work_date}</td><td>${o?.office_name || '-'}</td><td>ROW কাজ</td><td>${fmt(r.row_km)} KM</td><td>${r.labour_count}</td><td>চলমান</td></tr>`; }).join("") : `<tr><td colspan="7">No data</td></tr>`;
  if ($("labMini")) $("labMini").innerHTML = rr.length ? rr.map((r, i) => { const o = rowOffices.find(x => x.id === r.office_id); return `<tr><td>${i + 1}</td><td>${r.work_date}</td><td>${o?.office_name || '-'}</td><td>ROW কাজ</td><td>${r.labour_count}</td><td>${fmt(r.row_km)} KM</td><td>চলমান</td></tr>`; }).join("") : `<tr><td colspan="7">No data</td></tr>`;

  if ($("officeTable")) {
    const totalTarget = os.reduce((sum, o) => sum + num(o.target_km), 0);
    const totalCompleted = os.reduce((sum, o) => sum + o.row, 0);
    const totalLabour = os.reduce((sum, o) => sum + o.lab, 0);
    const totalProgress = pct(totalCompleted, totalTarget).toFixed(1);

    $("officeTable").innerHTML = os.map((o, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${o.area}</td>
        <td>${o.office_name}</td>
        <td>${fmt(o.target_km)}</td>
        <td>${fmt(o.row)}</td>
        <td>${fmt(o.lab)}</td>
        <td>${pct(o.row, o.target_km).toFixed(1)}%</td>
      </tr>
    `).join("") + `
      <tr style="background-color: #eef4f9; font-weight: bold; border-top: 2px solid #205493;">
        <td colspan="3" style="text-align: right;">মোট :</td>
        <td>${fmt(totalTarget)}</td>
        <td>${fmt(totalCompleted)}</td>
        <td>${fmt(totalLabour)}</td>
        <td>${totalProgress}%</td>
      </tr>
    `;
  }

  populateSelects();
  renderDateTable(today);
  if (typeof renderTopAndLowestPerformers === 'function') renderTopAndLowestPerformers();
  if (typeof renderTopAndLowestPerformers === 'function') renderTopAndLowestPerformers();
  if (rowAccessToken) renderAdmin();
}

function populateSelects() {
  const opts = '<option value="">অভিযোগ কেন্দ্র নির্বাচন করুন</option>' + rowOffices.map(o => `<option value="${o.id}">${o.office_name} — ${getArea(o.office_name)}</option>`).join("");
  if ($("dOffice")) $("dOffice").innerHTML = opts;
}

function renderDateTable(d) {
  const rr = rowWorkData.filter(r => r.work_date === d);
  if ($("rowTable")) $("rowTable").innerHTML = rr.map(r => { const o = rowOffices.find(x => x.id === r.office_id); return `<tr><td>${r.work_date}</td><td>${getArea(o?.office_name)}</td><td>${o?.office_name || '-'}</td><td>${fmt(r.row_km)}</td><td>${r.labour_count}</td></tr>`; }).join("") || '<tr><td colspan="5">No data</td></tr>';
}

async function saveRow() {
  const d = $("dDate") ? $("dDate").value : today,
        o = $("dOffice") ? +$("dOffice").value : 0,
        r = $("dRow") ? num($("dRow").value) : 0,
        l = $("dLab") ? Math.max(0, Math.floor(num($("dLab").value))) : 0;
  if (d !== today) return $("rowMsg") && ($("rowMsg").textContent = "সাধারণ user শুধু আজকের data edit করতে পারবেন। Admin Panel থেকে যেকোনো দিনের data edit করা যাবে।");
  if (!o || r < 0 || l < 0) return $("rowMsg") && ($("rowMsg").textContent = "অভিযোগ কেন্দ্র, ROW এবং শ্রমিক সংখ্যা দিন।");
  try {
    const ex = rowWorkData.find(x => x.work_date === d && x.office_id === o);
    const body = { work_date: d, office_id: o, row_km: r, labour_count: l, updated_at: new Date().toISOString() };
    await rowApi(ex ? `daily_row_work?id=eq.${ex.id}` : "daily_row_work", { method: ex ? "PATCH" : "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(body) });
    if ($("rowMsg")) $("rowMsg").textContent = "ROW ও শ্রমিক সংখ্যা সফলভাবে সংরক্ষণ হয়েছে।";
    await loadRow();
  } catch (e) { if ($("rowMsg")) $("rowMsg").textContent = "Save failed: " + e.message; }
}

function exportExcel() {
  if (!window.XLSX) { alert("Excel library load হয়নি। Internet connection check করুন।"); return; }
  const os = officeStats();
  const s1 = [["Area", "Office", "Target KM", "Completed KM", "Remaining KM", "Progress %", "Labour"], ...os.map(o => [o.area, o.office_name, num(o.target_km), +o.row.toFixed(2), +Math.max(0, num(o.target_km) - o.row).toFixed(2), +pct(o.row, o.target_km).toFixed(2), o.lab])];
  const s2 = [["Date", "Area", "Office", "Daily ROW KM", "Daily Labour"], ...rowWorkData.map(r => { const o = rowOffices.find(x => x.id === r.office_id); return [r.work_date, getArea(o?.office_name), o?.office_name || "", num(r.row_km), num(r.labour_count)]; })];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s1), "Progress Summary");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s2), "Daily ROW + Labour");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "ROW_Report_" + today + ".xlsx";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

async function loadRow() {
  try {
    let rawOffices = await rowApi("offices?select=id,office_name,target_km,active"); rowAllOffices = sortOfficesByUserSequence(rawOffices);
    rowOffices = sortOfficesByUserSequence(rowAllOffices.filter(o => o.active));
    rowWorkData = await rowApi("daily_row_work?select=id,work_date,office_id,row_km,labour_count,created_at,updated_at&order=work_date.desc");
    ["dDate", "lDate", "aDate"].forEach(id => { if ($(id) && !$(id).value) $(id).value = today; });
    renderRow();
  } catch (e) {
    console.error("loadRow error:", e);
  }
}

async function adminLogin() {
  const email = $("adminEmail") ? $("adminEmail").value.trim() : "", password = $("adminPass") ? $("adminPass").value : "";
  if (!email || !password) return $("adminMsg") && ($("adminMsg").textContent = "Email ও Password দিন।");
  if ($("adminMsg")) $("adminMsg").textContent = "Login হচ্ছে...";
  try {
    const r = await fetch(ROW_SUPABASE_URL + "/auth/v1/token?grant_type=password", { method: "POST", headers: { apikey: ROW_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const d = await r.json();
    if (!r.ok) { throw Error(d.error_description || d.msg || "Email বা Password সঠিক নয়।"); }
    
    // Strict Admin check
    const loggedInEmail = d.user?.email || email;
    const allowedAdmin = "parvezhossain89@gmail.com";
    if (loggedInEmail.toLowerCase() !== allowedAdmin.toLowerCase() && !d.user?.app_metadata?.role === 'admin') {
      throw Error("অনুমতি অস্বীকৃত! শুধুমাত্র অনুমোদিত Admin (Parvez Hossain) এই প্যানেলে প্রবেশ করতে পারবেন।");
    }

    rowAccessToken = d.access_token; rowCurrentUser = d.user;
    if ($("adminLogin")) $("adminLogin").style.display = "none";
    if ($("adminContent")) $("adminContent").style.display = "block";
    if ($("adminMsg")) $("adminMsg").textContent = "";
    renderAdmin();
    toast("Admin login successful!");
  } catch (e) {
    rowAccessToken = null; rowCurrentUser = null;
    if ($("adminMsg")) $("adminMsg").textContent = e.message;
  }
}

function renderAdmin() {
  if (!rowAccessToken) return;
  const list = (rowAllOffices.length ? rowAllOffices : rowOffices).map(o => ({ ...o, area: getArea(o.office_name) }));
  if ($("adminOfficeBody")) {
    $("adminOfficeBody").innerHTML = list.map((o, i) => `<tr>
      <td>${i + 1}</td>
      <td>${o.area}</td>
      <td>${o.office_name}</td>
      <td><input class="targetEdit" data-id="${o.id}" type="number" min="0" step=".01" value="${num(o.target_km)}" style="width:110px;height:34px;border:1px solid #bdd9ee;border-radius:5px;padding:0 6px"></td>
      <td><input class="activeEdit" data-id="${o.id}" type="checkbox" ${o.active ? "checked" : ""}></td>
      <td><button class="greenBtn saveTarget" data-id="${o.id}">Save</button></td>
    </tr>`).join("");
  }

  const selectedDate = $("aDate") ? ($("aDate").value || today) : today;
  if ($("adminDailyBody")) {
    const dailyRows = rowWorkData.filter(r => r.work_date === selectedDate);
    const targetOffices = rowAllOffices.length ? rowAllOffices : rowOffices;

    $("adminDailyBody").innerHTML = targetOffices.map((o, i) => {
      const rowData = dailyRows.find(r => r.office_id === o.id);
      const rowKm = rowData ? rowData.row_km : 0;
      const labourCount = rowData ? rowData.labour_count : 0;

      return `<tr>
        <td>${i + 1}</td>
        <td>${getArea(o.office_name)}</td>
        <td><b>${o.office_name}</b></td>
        <td><input class="adminRowEdit" data-office-id="${o.id}" type="number" min="0" step=".01" value="${rowKm}" style="width:100px;height:34px;border:1px solid #bdd9ee;border-radius:5px;padding:0 6px"></td>
        <td><input class="adminLabEdit" data-office-id="${o.id}" type="number" min="0" step="1" value="${labourCount}" style="width:90px;height:34px;border:1px solid #bdd9ee;border-radius:5px;padding:0 6px"></td>
        <td><button class="greenBtn saveAdminDailyRow" data-office-id="${o.id}">Save</button></td>
      </tr>`;
    }).join("");
  }
}

async function saveTarget(id) {
  try {
    const target = num(document.querySelector(`.targetEdit[data-id="${id}"]`).value);
    const active = document.querySelector(`.activeEdit[data-id="${id}"]`).checked;
    await rowApi(`offices?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ target_km: target, active }) });
    if ($("adminMsg")) $("adminMsg").textContent = "Target সফলভাবে সংরক্ষণ হয়েছে।";
    await loadRow();
  } catch (e) { if ($("adminMsg")) $("adminMsg").textContent = "Target save failed: " + e.message; }
}

async function saveAdminDailyRow(officeId) {
  if (!rowAccessToken) return;
  const d = $("aDate").value || today;
  const rowInput = document.querySelector(`.adminRowEdit[data-office-id="${officeId}"]`);
  const labInput = document.querySelector(`.adminLabEdit[data-office-id="${officeId}"]`);
  const r = num(rowInput ? rowInput.value : 0);
  const l = Math.max(0, Math.floor(num(labInput ? labInput.value : 0)));
  try {
    const ex = rowWorkData.find(x => x.work_date === d && x.office_id === +officeId);
    const body = { work_date: d, office_id: +officeId, row_km: r, labour_count: l, updated_at: new Date().toISOString() };
    await rowApi(ex ? `daily_row_work?id=eq.${ex.id}` : "daily_row_work", { method: ex ? "PATCH" : "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(body) });
    if ($("adminDailyMsg")) $("adminDailyMsg").textContent = "ডাটা সফলভাবে আপডেট হয়েছে।";
    await loadRow();
  } catch (e) { if ($("adminDailyMsg")) $("adminDailyMsg").textContent = "Save failed: " + e.message; }
}

async function saveAllAdminDailyRows() {
  if (!rowAccessToken) return;
  const d = $("aDate").value || today;
  const rowInputs = document.querySelectorAll(".adminRowEdit");
  if ($("adminDailyMsg")) $("adminDailyMsg").textContent = "সকল অফিসের ডাটা সেভ হচ্ছে...";
  try {
    for (let rowInput of rowInputs) {
      const officeId = +rowInput.dataset.officeId;
      const labInput = document.querySelector(`.adminLabEdit[data-office-id="${officeId}"]`);
      const r = num(rowInput.value);
      const l = Math.max(0, Math.floor(num(labInput ? labInput.value : 0)));
      const ex = rowWorkData.find(x => x.work_date === d && x.office_id === officeId);
      const body = { work_date: d, office_id: officeId, row_km: r, labour_count: l, updated_at: new Date().toISOString() };
      await rowApi(ex ? `daily_row_work?id=eq.${ex.id}` : "daily_row_work", { method: ex ? "PATCH" : "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(body) });
    }
    if ($("adminDailyMsg")) $("adminDailyMsg").textContent = "সকল অফিসের ডাটা একসাথে সফলভাবে সংরক্ষণ হয়েছে!";
    await loadRow();
  } catch (e) { if ($("adminDailyMsg")) $("adminDailyMsg").textContent = "Save All failed: " + e.message; }
}

function adminLogout() {
  rowAccessToken = null; rowCurrentUser = null;
  if ($('adminLogin')) $('adminLogin').style.display = 'block';
  if ($('adminContent')) $('adminContent').style.display = 'none';
}

function toggleMobileMenu() {
  const mainSidebar = $("mainSidebar");
  const techSidebar = $("techSidebar");
  const overlay = $("sidebarOverlay");
  if (mainSidebar) mainSidebar.classList.toggle("active");
  if (techSidebar) techSidebar.classList.toggle("active");
  if (overlay) overlay.classList.toggle("active");
}
function closeMobileMenu() {
  const mainSidebar = $("mainSidebar");
  const techSidebar = $("techSidebar");
  const overlay = $("sidebarOverlay");
  if (mainSidebar) mainSidebar.classList.remove("active");
  if (techSidebar) techSidebar.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
}


// ================= MODULE 2: দৈনিক কাজের প্রতিবেদন (TWIN DASHBOARD CONTROLLER) =================
const MONTHLY_ITEMS = [{"id": 1, "sl": "1", "title": "অভিযোগ সমাধান (টি)", "sub": ""}, {"id": 2, "sl": "2", "title": "নতুন মিটার স্থাপন", "sub": "আবাসিক (টি)"}, {"id": 3, "sl": "", "title": "", "sub": "বানিজ্যিক (টি)"}, {"id": 4, "sl": "", "title": "", "sub": "শিল্প (টি)"}, {"id": 5, "sl": "", "title": "", "sub": "দাতব্য (টি)"}, {"id": 6, "sl": "", "title": "", "sub": "সেচ (টি)"}, {"id": 7, "sl": "3", "title": "পরিবর্তন সিএমও কাজ সম্পাদন (টি)", "sub": ""}, {"id": 8, "sl": "4", "title": "পুনঃসংযোগ সিএমও কাজ সম্পাদন (টি)", "sub": ""}, {"id": 9, "sl": "5", "title": "বিচ্ছিন্ন/রিমুভ সিএমও কাজ সম্পাদন (টি)", "sub": ""}, {"id": 10, "sl": "6", "title": "মিটার রির্পোট তদন্ত (টি)", "sub": ""}, {"id": 11, "sl": "7", "title": "মিটার টেস্ট (টি)", "sub": ""}, {"id": 12, "sl": "8", "title": "নতুন ট্রান্সফরমার স্থাপন (টি)", "sub": "5 KVA"}, {"id": 13, "sl": "", "title": "", "sub": "10 KVA"}, {"id": 14, "sl": "", "title": "", "sub": "15 KVA"}, {"id": 15, "sl": "", "title": "", "sub": "25 KVA"}, {"id": 16, "sl": "", "title": "", "sub": "37.5 KVA"}, {"id": 17, "sl": "", "title": "", "sub": "50 KVA"}, {"id": 18, "sl": "", "title": "", "sub": "75 KVA"}, {"id": 19, "sl": "", "title": "", "sub": "100 KVA"}, {"id": 20, "sl": "9", "title": "বিনষ্ট ট্রান্সফরমার প্রতিস্থাপন (টি)", "sub": "5 KVA"}, {"id": 21, "sl": "", "title": "", "sub": "10 KVA"}, {"id": 22, "sl": "", "title": "", "sub": "15 KVA"}, {"id": 23, "sl": "", "title": "", "sub": "25 KVA"}, {"id": 24, "sl": "", "title": "", "sub": "37.5 KVA"}, {"id": 25, "sl": "", "title": "", "sub": "50 KVA"}, {"id": 26, "sl": "", "title": "", "sub": "75 KVA"}, {"id": 27, "sl": "", "title": "", "sub": "100 KVA"}, {"id": 28, "sl": "10", "title": "ওভারলোড ট্রান্সফরমার পরিবর্তন (টি)", "sub": "5 KVA"}, {"id": 29, "sl": "", "title": "", "sub": "10 KVA"}, {"id": 30, "sl": "", "title": "", "sub": "15 KVA"}, {"id": 31, "sl": "", "title": "", "sub": "25 KVA"}, {"id": 32, "sl": "", "title": "", "sub": "37.5 KVA"}, {"id": 33, "sl": "", "title": "", "sub": "50 KVA"}, {"id": 34, "sl": "", "title": "", "sub": "75 KVA"}, {"id": 35, "sl": "", "title": "", "sub": "100 KVA"}, {"id": 36, "sl": "11", "title": "ট্রান্সফরমার লোড বিভাজন (টি)", "sub": "5 KVA"}, {"id": 37, "sl": "", "title": "", "sub": "10 KVA"}, {"id": 38, "sl": "", "title": "", "sub": "15 KVA"}, {"id": 39, "sl": "", "title": "", "sub": "25 KVA"}, {"id": 40, "sl": "", "title": "", "sub": "37.5 KVA"}, {"id": 41, "sl": "", "title": "", "sub": "50 KVA"}, {"id": 42, "sl": "", "title": "", "sub": "75 KVA"}, {"id": 43, "sl": "", "title": "", "sub": "100 KVA"}, {"id": 44, "sl": "12", "title": "ট্রান্সফরমার চুরি (টি)", "sub": "5 KVA"}, {"id": 45, "sl": "", "title": "", "sub": "10 KVA"}, {"id": 46, "sl": "", "title": "", "sub": "15 KVA"}, {"id": 47, "sl": "", "title": "", "sub": "25 KVA"}, {"id": 48, "sl": "", "title": "", "sub": "37.5 KVA"}, {"id": 49, "sl": "", "title": "", "sub": "50 KVA"}, {"id": 50, "sl": "", "title": "", "sub": "75 KVA"}, {"id": 51, "sl": "", "title": "", "sub": "100 KVA"}, {"id": 52, "sl": "13", "title": "ওর্য়াকশপে ট্রান্সফরমার মেরামত (টি)", "sub": ""}, {"id": 53, "sl": "14", "title": "ট্রান্সফরমার প্রিভেনটিভ করন (টি)", "sub": ""}, {"id": 54, "sl": "15", "title": "লাইন পরিদর্শন (কিঃমিঃ)", "sub": ""}, {"id": 55, "sl": "16", "title": "রা্ইট অব ওয়ে করন (কিঃমিঃ)", "sub": ""}, {"id": 56, "sl": "17", "title": "লাইন রক্ষনাবেক্ষন(কিঃমিঃ)", "sub": ""}, {"id": 57, "sl": "18", "title": "লাইন নির্মাণ (কিঃমিঃ)", "sub": ""}, {"id": 58, "sl": "19", "title": "জিআইএস করন (কিঃমিঃ)", "sub": ""}, {"id": 59, "sl": "20", "title": "ইআরসি করন (টি)", "sub": ""}, {"id": 60, "sl": "21", "title": "মিটার চেকিং (টি)", "sub": ""}, {"id": 61, "sl": "22", "title": "কানেক্টর স্থাপন (টি)", "sub": ""}, {"id": 62, "sl": "23", "title": "বিনষ্ট লাইটিং এরেস্টার পরিবর্তন (টি)", "sub": ""}, {"id": 63, "sl": "24", "title": "বিনষ্ট ফিউজ কাটআউট পরিবর্তন (টি)", "sub": ""}, {"id": 64, "sl": "25", "title": "ন্যাকেট ফিউজ অপসারন (টি)", "sub": ""}, {"id": 65, "sl": "26", "title": "ট্রান্সফরমার ওয়্যারিং করন (টি)", "sub": ""}, {"id": 66, "sl": "27", "title": "ট্রান্সফরমার গ্রাউন্ডিং করন (টি)", "sub": ""}, {"id": 67, "sl": "28", "title": "ক্রসআর্ম পরিবর্তন (টি)", "sub": ""}, {"id": 68, "sl": "29", "title": "জাম্পার নবায়ন করন (টি)", "sub": ""}, {"id": 69, "sl": "30", "title": "আন্ডার সাইজ তার পরিবর্তন (স্প্যান)", "sub": ""}, {"id": 70, "sl": "31", "title": "লাইনম্যান/লাইন টুলস পরিষ্কার (বার)", "sub": ""}, {"id": 71, "sl": "32", "title": "ডে/নাইট অপারেশন (টি)", "sub": ""}, {"id": 72, "sl": "33", "title": "বিনষ্ট পোল পরিবর্তন (টি)", "sub": ""}, {"id": 73, "sl": "34", "title": "স্টেকিং শীট তৈরী স্পট সংখ্যা (টি)", "sub": ""}, {"id": 74, "sl": "35", "title": "১১ কেভি ফিডারের ফেজ ব্যালেন্সিং পর্যালোচনা (বার)", "sub": ""}, {"id": 75, "sl": "36", "title": "৩৩ কেভি ফিডারের পাওয়ার ফ্যাক্টর পর্যালোচনা (বার)", "sub": ""}, {"id": 76, "sl": "37", "title": "SAIDI", "sub": ""}, {"id": 77, "sl": "38", "title": "SAIFI", "sub": ""}, {"id": 78, "sl": "39", "title": "মাসিক নিরাপত্তা সভা (টি)", "sub": ""}, {"id": 79, "sl": "40", "title": "পোল সোজা করণ/গাই তার পুনঃস্থাপন (টি)", "sub": ""}];;
let techOffices = [];
let dailyTechDataStore = {};
let monthlyDataStore = {};
let officeTargetsStore = {};

const AREA_TO_COL = {
  "বরিশাল সদর": "sadar",
  "বাকেরগঞ্জ": "bakerganj",
  "মুলাদী": "muladi",
  "মেহেন্দিগঞ্জ": "mehendiganj",
  "হিজলা": "hizla"
};

window.switchTechNav = function(pageId) {
  document.querySelectorAll("#techSidebar nav button").forEach(b => {
    b.classList.toggle("active", b.dataset.techPage === pageId);
  });
  document.querySelectorAll("#techMain .tech-page").forEach(p => {
    p.style.display = (p.id === pageId) ? "block" : "none";
  });

  if (pageId === "tech_dash") {
    renderTechDashboard();
  } else if (pageId === "tech_office") {
    renderTechOfficeProgress();
  } else if (pageId === "tech_daily") {
    populateDailyOffices();
    loadDailyTechData();
  } else if (pageId === "tech_reports") {
    populateFiscalMonths();
    loadMonthlyFromCloud();
  } else if (pageId === "tech_admin") {
    // Keep login form or content as is
  }
};

// ----------------- ADMIN TARGETS SETTING -----------------
function populateAdminTargetOffices() {
  const sel = document.getElementById("adminTargetOffice");
  if (!sel) return;
  const currentVal = sel.value;
  const targetOffices = (rowOffices && rowOffices.length ? rowOffices : rowAllOffices);
  
  sel.innerHTML = '<option value="">অভিযোগ কেন্দ্র নির্বাচন করুন</option>' + targetOffices.map(o => 
    `<option value="${o.id}">${o.office_name} — ${getArea(o.office_name)}</option>`
  ).join("");

  if (currentVal) sel.value = currentVal;
  else if (targetOffices.length) sel.value = targetOffices[0].id;
}

function renderAdminTargetTable(targets = {}) {
  const tbody = document.getElementById("adminTargetTableBody");
  if (!tbody) return;

  tbody.innerHTML = MONTHLY_ITEMS.map(item => {
    const val = targets[item.id] !== undefined ? targets[item.id] : "";
    return `
      <tr data-id="${item.id}">
        <td>${item.sl || ''}</td>
        <td class="td-title" style="text-align:left; padding-left:12px;">${item.title || ''}</td>
        <td class="td-sub">${item.sub || ''}</td>
        <td>
          <input type="number" step="any" min="0" class="m-input admin-target-inp" data-id="${item.id}" value="${val}" placeholder="0" style="font-size:14px; height:36px;">
        </td>
      </tr>
    `;
  }).join("");
}

async function loadOfficeTargets() {
  const selOffice = document.getElementById("adminTargetOffice");
  const selYear = document.getElementById("adminTargetYear");
  const officeId = selOffice ? selOffice.value : "";
  const fiscalYear = selYear ? selYear.value : "2026-2027";
  if (!officeId) {
    renderAdminTargetTable({});
    return;
  }

  const key = `${officeId}_${fiscalYear}`;
  let targets = officeTargetsStore[key] || null;

  try {
    const res = await rowApi(`technical_office_targets?office_id=eq.${officeId}&fiscal_year=eq.${encodeURIComponent(fiscalYear)}`);
    if (res && res.length && res[0].targets) {
      targets = res[0].targets;
      officeTargetsStore[key] = targets;
      localStorage.setItem("office_targets_store", JSON.stringify(officeTargetsStore));
    }
  } catch (e) {
    console.warn("Target load error:", e.message);
  }

  const local = localStorage.getItem("office_targets_store");
  if (!targets && local) {
    try {
      const parsed = JSON.parse(local);
      targets = parsed[key] || {};
    } catch (_) {}
  }

  const targetOffices = (rowOffices && rowOffices.length ? rowOffices : rowAllOffices);
  const offObj = targetOffices.find(o => String(o.id) === String(officeId));
  const titleEl = document.getElementById("adminTargetHeaderTitle");
  if (titleEl) {
    titleEl.textContent = `${offObj ? offObj.office_name : ''} (${fiscalYear}) - ৪০টি পয়েন্টের টার্গেট টেবিল`;
  }

  renderAdminTargetTable(targets || {});
}

async function saveOfficeTargets() {
  const selOffice = document.getElementById("adminTargetOffice");
  const selYear = document.getElementById("adminTargetYear");
  const officeId = selOffice ? selOffice.value : "";
  const fiscalYear = selYear ? selYear.value : "2026-2027";
  const msg = document.getElementById("adminTargetMsg");

  if (!officeId) {
    if (msg) { msg.textContent = "অনুগ্রহ করে অভিযোগ কেন্দ্র নির্বাচন করুন।"; msg.style.color = "#d92334"; }
    return;
  }

  const targetOffices = (rowOffices && rowOffices.length ? rowOffices : rowAllOffices);
  const offObj = targetOffices.find(o => String(o.id) === String(officeId));
  const offName = offObj ? offObj.office_name : "";

  const targets = {};
  document.querySelectorAll(".admin-target-inp").forEach(inp => {
    const id = inp.dataset.id;
    const v = inp.value.trim();
    if (v !== "") targets[id] = Number(v);
  });

  const key = `${officeId}_${fiscalYear}`;
  officeTargetsStore[key] = targets;
  localStorage.setItem("office_targets_store", JSON.stringify(officeTargetsStore));

  if (msg) {
    msg.textContent = "টার্গেট সংরক্ষণ হচ্ছে...";
    msg.style.color = "#0758a8";
  }

  try {
    const body = {
      office_id: Number(officeId),
      office_name: offName,
      fiscal_year: fiscalYear,
      targets: targets,
      updated_at: new Date().toISOString()
    };

    const existing = await rowApi(`technical_office_targets?office_id=eq.${officeId}&fiscal_year=eq.${encodeURIComponent(fiscalYear)}`);
    if (existing && existing.length) {
      await rowApi(`technical_office_targets?id=eq.${existing[0].id}`, { method: "PATCH", body: JSON.stringify(body) });
    } else {
      await rowApi("technical_office_targets", { method: "POST", body: JSON.stringify(body) });
    }

    if (msg) {
      msg.textContent = `✓ ${offName} এর জন্য ${fiscalYear} অর্থ বছরের ৪০টি পয়েন্টের টার্গেট সফলভাবে সংরক্ষিত হয়েছে!`;
      msg.style.color = "#0b8e4e";
      setTimeout(() => { if (msg) msg.textContent = ""; }, 4000);
    }
    toast("টার্গেট সফলভাবে সংরক্ষণ হয়েছে!");
  } catch (e) {
    if (msg) {
      msg.textContent = `✓ ${offName} এর টার্গেট লোকাল মেমরিতে সংরক্ষিত হয়েছে।`;
      msg.style.color = "#0b8e4e";
      setTimeout(() => { if (msg) msg.textContent = ""; }, 4000);
    }
  }
}

// ----------------- DAILY TECHNICAL REPORT ENTRY -----------------
function populateDailyOffices() {
  const sel = document.getElementById("mDailyOffice");
  if (!sel) return;
  const currentVal = sel.value;
  const targetOffices = (rowOffices && rowOffices.length ? rowOffices : rowAllOffices);
  
  sel.innerHTML = '<option value="">অভিযোগ কেন্দ্র নির্বাচন করুন</option>' + targetOffices.map(o => 
    `<option value="${o.id}">${o.office_name} — ${getArea(o.office_name)}</option>`
  ).join("");

  if (currentVal) sel.value = currentVal;
  else if (targetOffices.length) sel.value = targetOffices[0].id;
}

function getDailyTechKey(date, officeId) {
  const d = date || (document.getElementById("mDailyDate") ? document.getElementById("mDailyDate").value : today);
  const o = officeId || (document.getElementById("mDailyOffice") ? document.getElementById("mDailyOffice").value : "");
  return `${d}_${o}`;
}

function renderDailyTechTable() {
  const tbody = document.getElementById("dailyTechTableBody");
  if (!tbody) return;

  const key = getDailyTechKey();
  const dayData = dailyTechDataStore[key] || {};

  // Check if meter sub-meters should be shown
  let showSubMeters = false;
  [2, 3, 4, 5, 6].forEach(id => {
    if (Number(dayData[id] || 0) > 0) showSubMeters = true;
  });

  // Check transformer groups
  const transGroups = {
    12: [13, 14, 15, 16, 17, 18, 19],
    20: [21, 22, 23, 24, 25, 26, 27],
    28: [29, 30, 31, 32, 33, 34, 35],
    36: [37, 38, 39, 40, 41, 42, 43],
    44: [45, 46, 47, 48, 49, 50, 51]
  };

  let showTrans = {};
  Object.keys(transGroups).forEach(parentId => {
    const pId = Number(parentId);
    const subs = transGroups[pId];
    let show = Number(dayData[pId] || 0) > 0;
    subs.forEach(sId => {
      if (Number(dayData[sId] || 0) > 0) show = true;
    });
    showTrans[pId] = show;
  });

  tbody.innerHTML = MONTHLY_ITEMS.map(item => {
    const val = dayData[item.id] !== undefined ? dayData[item.id] : "";
    const isSubMeter = [3, 4, 5, 6].includes(item.id);
    const meterStyle = isSubMeter && !showSubMeters ? 'style="display:none;"' : '';
    const meterClass = isSubMeter ? 'class="meter-sub-row"' : '';

    let transStyle = '';
    let transClass = '';
    Object.entries(transGroups).forEach(([pId, subs]) => {
      if (subs.includes(item.id)) {
        transClass = `class="trans-sub-row-${pId}"`;
        if (!showTrans[pId]) {
          transStyle = 'style="display:none;"';
        }
      }
    });

    const combinedStyle = meterStyle || transStyle;
    const combinedClass = meterClass || transClass;

    return `
      <tr data-id="${item.id}" ${combinedClass} ${combinedStyle}>
        <td>${item.sl || ''}</td>
        <td class="td-title" style="text-align:left; padding-left:12px;">${item.title || ''}</td>
        <td class="td-sub">${item.sub || ''}</td>
        <td>
          <input type="number" step="any" min="0" class="m-input daily-tech-inp" data-id="${item.id}" value="${val}" placeholder="0" style="font-size:14px; height:36px;" oninput="handleTechInput(this)" onfocus="handleTechFocus(this)">
        </td>
      </tr>
    `;
  }).join("");
}

window.handleTechInput = function(inp) {
  const id = Number(inp.dataset.id);
  const val = Number(inp.value || 0);

  // Meter sub-rows handling
  if ([2, 3, 4, 5, 6].includes(id)) {
    const subRows = document.querySelectorAll(".meter-sub-row");
    if (id === 2 || val > 0) {
      subRows.forEach(r => r.style.display = "table-row");
    } else {
      let hasVal = false;
      document.querySelectorAll(".daily-tech-inp").forEach(i => {
        if ([2,3,4,5,6].includes(Number(i.dataset.id)) && Number(i.value || 0) > 0) hasVal = true;
      });
      if (!hasVal && document.querySelector('.daily-tech-inp[data-id="2"]')?.value === "") {
        subRows.forEach(r => r.style.display = "none");
      }
    }
  }

  // Transformer sub-rows handling (parents: 12, 20, 28, 36, 44)
  const transParents = [12, 20, 28, 36, 44];
  transParents.forEach(pId => {
    const subs = {
      12: [13, 14, 15, 16, 17, 18, 19],
      20: [21, 22, 23, 24, 25, 26, 27],
      28: [29, 30, 31, 32, 33, 34, 35],
      36: [37, 38, 39, 40, 41, 42, 43],
      44: [45, 46, 47, 48, 49, 50, 51]
    }[pId];

    if (id === pId || subs.includes(id)) {
      const subRows = document.querySelectorAll(`.trans-sub-row-${pId}`);
      if (id === pId || val > 0) {
        subRows.forEach(r => r.style.display = "table-row");
      } else {
        let hasVal = false;
        document.querySelectorAll(".daily-tech-inp").forEach(i => {
          const iId = Number(i.dataset.id);
          if ((iId === pId || subs.includes(iId)) && Number(i.value || 0) > 0) hasVal = true;
        });
        if (!hasVal && document.querySelector(`.daily-tech-inp[data-id="${pId}"]`)?.value === "") {
          subRows.forEach(r => r.style.display = "none");
        }
      }
    }
  });
};

window.handleTechFocus = function(inp) {
  const id = Number(inp.dataset.id);
  if ([2, 12, 20, 28, 36, 44].includes(id)) {
    if (id === 2) {
      document.querySelectorAll(".meter-sub-row").forEach(r => r.style.display = "table-row");
    } else {
      document.querySelectorAll(`.trans-sub-row-${id}`).forEach(r => r.style.display = "table-row");
    }
  }
};


async function loadDailyTechData() {
  const dateInp = document.getElementById("mDailyDate");
  const offInp = document.getElementById("mDailyOffice");
  const date = dateInp ? dateInp.value : today;
  const officeId = offInp ? offInp.value : "";
  if (!officeId) {
    renderDailyTechTable();
    return;
  }

  const key = `${date}_${officeId}`;
  const local = localStorage.getItem("daily_tech_store");
  if (local) {
    try { dailyTechDataStore = JSON.parse(local); } catch (_) {}
  }

  try {
    const rows = await rowApi(`daily_technical_reports?work_date=eq.${date}&office_id=eq.${officeId}`);
    if (rows && rows.length > 0 && rows[0].report_data) {
      dailyTechDataStore[key] = rows[0].report_data;
      localStorage.setItem("daily_tech_store", JSON.stringify(dailyTechDataStore));
    }
  } catch (e) {
    console.warn("daily_technical_reports fetch note:", e.message);
  }

  const targetOffices = (rowOffices && rowOffices.length ? rowOffices : rowAllOffices);
  const offObj = targetOffices.find(o => String(o.id) === String(officeId));
  const hTitle = document.getElementById("techDailyHeaderTitle");
  if (hTitle) {
    hTitle.textContent = `${offObj ? offObj.office_name : ''} (${date}) - দৈনিক ৪০টি পয়েন্টের তথ্য`;
  }

  renderDailyTechTable();
}

async function saveDailyTechData() {
  const dateInp = document.getElementById("mDailyDate");
  const offInp = document.getElementById("mDailyOffice");
  const date = dateInp ? dateInp.value : today;
  const officeId = offInp ? offInp.value : "";
  const msg = document.getElementById("mDailyStatusMsg");

  if (!officeId) {
    if (msg) { msg.textContent = "অনুগ্রহ করে একটি অভিযোগ কেন্দ্র নির্বাচন করুন।"; msg.style.color = "#d92334"; }
    return;
  }

  const targetOffices = (rowOffices && rowOffices.length ? rowOffices : rowAllOffices);
  const offObj = targetOffices.find(o => String(o.id) === String(officeId));
  const offName = offObj ? offObj.office_name : "";
  const areaName = offObj ? getArea(offObj.office_name) : "সদর দপ্তর";

  const inputs = document.querySelectorAll("#dailyTechTableBody .daily-tech-inp");
  const reportObj = {};
  inputs.forEach(inp => {
    const id = inp.dataset.id;
    const v = inp.value.trim();
    if (v !== "") reportObj[id] = Number(v);
  });

  const key = `${date}_${officeId}`;
  dailyTechDataStore[key] = reportObj;
  localStorage.setItem("daily_tech_store", JSON.stringify(dailyTechDataStore));

  if (msg) {
    msg.textContent = "সংরক্ষণ হচ্ছে...";
    msg.style.color = "#0758a8";
  }

  try {
    const existing = await rowApi(`daily_technical_reports?work_date=eq.${date}&office_id=eq.${officeId}`);
    const body = {
      work_date: date,
      office_id: Number(officeId),
      office_name: offName,
      area_name: areaName,
      report_data: reportObj,
      updated_at: new Date().toISOString()
    };

    if (existing && existing.length > 0) {
      await rowApi(`daily_technical_reports?id=eq.${existing[0].id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(body)
      });
    } else {
      await rowApi("daily_technical_reports", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(body)
      });
    }

    if (msg) {
      msg.textContent = `✓ ${offName} এর ${date} তারিখের ৪০টি পয়েন্টের তথ্য সফলভাবে ক্লাউড ও লোকাল ডেটাবেজে সংরক্ষিত হয়েছে!`;
      msg.style.color = "#0b8e4e";
      setTimeout(() => { if (msg) msg.textContent = ""; }, 4000);
    }
    toast("তথ্য সফলভাবে সংরক্ষিত হয়েছে!");
  } catch (e) {
    if (msg) {
      msg.textContent = `✓ ${offName} এর তথ্য লোকাল মেমরিতে সংরক্ষিত হয়েছে।`;
      msg.style.color = "#0b8e4e";
      setTimeout(() => { if (msg) msg.textContent = ""; }, 4000);
    }
  }
}

// ----------------- DASHBOARD & PROGRESS RENDERING (Twin of ROW) -----------------
async function renderTechDashboard() {
  const targetOffices = (rowOffices && rowOffices.length ? rowOffices : rowAllOffices);
  const kOff = document.getElementById("techKOff");
  if (kOff) kOff.textContent = targetOffices.length || 28;

  const currentYear = getFiscalYear();

  let targetMap = {};
  try {
    const tRows = await rowApi(`technical_office_targets?fiscal_year=eq.${encodeURIComponent(currentYear)}`);
    if (tRows && tRows.length) {
      tRows.forEach(tr => {
        targetMap[tr.office_id] = tr.targets || {};
      });
    }
  } catch (_) {}

  let dailyRecords = [];
  try {
    dailyRecords = await rowApi(`daily_technical_reports?order=work_date.desc&limit=250`);
  } catch (_) {}

  // Merge local storage data if Supabase sync failed
  const localDaily = localStorage.getItem("daily_tech_store");
  if (localDaily) {
    try {
      const localMap = JSON.parse(localDaily);
      Object.entries(localMap).forEach(([key, rObj]) => {
        const [dStr, oId] = key.split("_");
        if (dStr === today && !dailyRecords.some(r => r.work_date === dStr && String(r.office_id) === String(oId))) {
          const offObj = targetOffices.find(o => String(o.id) === String(oId));
          dailyRecords.push({
            work_date: dStr,
            office_id: Number(oId),
            office_name: offObj ? offObj.office_name : "",
            area_name: offObj ? getArea(offObj.office_name) : "বরিশাল সদর",
            report_data: rObj
          });
        }
      });
    } catch(e) {}
  }

  let totalTargetSum = 0;
  let totalDoneSum = 0;
  let totalMetersSum = 0;

  let areaStats = {
    "বরিশাল সদর": { target: 0, done: 0 },
    "মুলাদী": { target: 0, done: 0 },
    "বাকেরগঞ্জ": { target: 0, done: 0 },
    "মেহেন্দিগঞ্জ": { target: 0, done: 0 },
    "হিজলা": { target: 0, done: 0 }
  };

  let officeSummary = {};
  targetOffices.forEach(o => {
    const tgts = targetMap[o.id] || {};
    const officeTarget = Object.values(tgts).reduce((s, v) => s + Number(v || 0), 0);
    totalTargetSum += officeTarget;
    const a = getArea(o.office_name);
    if (areaStats[a]) areaStats[a].target += officeTarget;

    officeSummary[o.id] = {
      id: o.id,
      name: o.office_name,
      area: a,
      target: officeTarget,
      done: 0,
      meters: 0,
      complaints: 0,
      trans: 0
    };
  });

  dailyRecords.forEach(rec => {
    const r = rec.report_data || {};
    const oId = rec.office_id;
    const itemTotal = Object.values(r).reduce((s, v) => s + Number(v || 0), 0);
    totalDoneSum += itemTotal;

    let m = 0;
    for (let i = 2; i <= 6; i++) m += Number(r[i] || 0);
    totalMetersSum += m;

    const a = rec.area_name || (officeSummary[oId] ? officeSummary[oId].area : "বরিশাল সদর");
    if (areaStats[a]) areaStats[a].done += itemTotal;

    if (officeSummary[oId]) {
      officeSummary[oId].done += itemTotal;
      officeSummary[oId].meters += m;
      officeSummary[oId].complaints += Number(r[1] || 0);
      let tr = 0;
      for (let i = 12; i <= 27; i++) tr += Number(r[i] || 0);
      officeSummary[oId].trans += tr;
    }
  });

  const remainSum = Math.max(0, totalTargetSum - totalDoneSum);
  const overallPct = totalTargetSum > 0 ? Math.min(100, (totalDoneSum / totalTargetSum) * 100) : (totalDoneSum > 0 ? 100 : 0);

  const kTarget = document.getElementById("techKTarget");
  const kDone = document.getElementById("techKDone");
  const kRemain = document.getElementById("techKRemain");
  const kMeters = document.getElementById("techKMeters");
  const doneBar = document.getElementById("techDoneBar");
  const remainBar = document.getElementById("techRemainBar");
  const donePct = document.getElementById("techDonePct");
  const remainPct = document.getElementById("techRemainPct");
  const donutPct = document.getElementById("techDonutPct");
  const donutEl = document.getElementById("techDonut");

  if (kTarget) kTarget.textContent = totalTargetSum > 0 ? fmt(totalTargetSum) : "—";
  if (kDone) kDone.textContent = fmt(totalDoneSum);
  if (kRemain) kRemain.textContent = fmt(remainSum);
  if (kMeters) kMeters.textContent = fmt(totalMetersSum);

  if (doneBar) doneBar.style.width = overallPct.toFixed(1) + "%";
  if (remainBar) remainBar.style.width = (100 - overallPct).toFixed(1) + "%";
  if (donePct) donePct.textContent = overallPct.toFixed(1) + "% সম্পন্ন";
  if (remainPct) remainPct.textContent = (100 - overallPct).toFixed(1) + "% অবশিষ্ট";

  if (donutPct) donutPct.textContent = overallPct.toFixed(1) + "%";
  if (donutEl) donutEl.style.background = `conic-gradient(#159b55 0 ${overallPct * 3.6}deg, #e4ebf2 ${overallPct * 3.6}deg 360deg)`;

  const maxVal = Math.max(...Object.values(areaStats).map(x => Math.max(x.target, x.done)), 10);
  const barsEl = document.getElementById("techBars");
  if (barsEl) {
    barsEl.innerHTML = Object.entries(areaStats).map(([area, x]) => {
      const hT = Math.max(8, (x.target / maxVal) * 150);
      const hD = Math.max(8, (x.done / maxVal) * 150);
      return `
        <div class="barGroup">
          <div class="target" style="height:${hT}px; background:#087ae9;">
            <span>${fmt(x.target)}</span>
          </div>
          <div class="done" style="height:${hD}px; background:#1aa866;">
            <span>${fmt(x.done)}</span>
          </div>
          <label>${area}</label>
        </div>
      `;
    }).join("");
  }

  if (typeof renderTechTopAndLowestPerformers === "function") { renderTechTopAndLowestPerformers(); }
  const areaBody = document.getElementById("techAreaBody");
  if (areaBody) {
    const list = Object.values(officeSummary);
    areaBody.innerHTML = list.map((o, idx) => {
      const p = o.target > 0 ? ((o.done / o.target) * 100).toFixed(1) : (o.done > 0 ? '100' : '0.0');
      const rem = Math.max(0, o.target - o.done);
      return `
        <tr>
          <td>${idx + 1}</td>
          <td><b>${o.name}</b><br><small style="color:#666">${o.area}</small></td>
          <td>${o.target > 0 ? fmt(o.target) : '—'}</td>
          <td>${fmt(o.done)}</td>
          <td>${fmt(rem)}</td>
          <td>${p}%</td>
          <td><span class="status ${Number(p) < 65 ? 'warn' : ''}">${Number(p) >= 65 ? 'চলমান' : 'অগ্রগতি'}</span></td>
        </tr>
      `;
    }).join("") + `
      <tr style="background:#eef4f9; font-weight:bold; border-top:2px solid #205493;">
        <td colspan="2" style="text-align:right;">মোট :</td>
        <td>${fmt(totalTargetSum)}</td>
        <td>${fmt(totalDoneSum)}</td>
        <td>${fmt(remainSum)}</td>
        <td>${overallPct.toFixed(1)}%</td>
        <td>-</td>
      </tr>
    `;
  }

  const recentList = document.getElementById("techRecentList");
  if (recentList) {
    recentList.innerHTML = dailyRecords.slice(0, 5).map((r, i) => `
      <div class="recentItem">
        <div class="rIcon" style="background:${i % 3 === 0 ? '#08a55b' : i % 3 === 1 ? '#1685e8' : '#f5a000'}">
          ${i % 3 === 0 ? '✓' : i % 3 === 1 ? '↗' : '◷'}
        </div>
        <div>
          <b>${r.office_name}</b>
          <small>${r.area_name} · দৈনিক কাজ সম্পন্ন</small>
        </div>
        <time>${r.work_date}</time>
      </div>
    `).join("") || '<p style="color:#8fa0b5; padding:15px 0;">কোনো সাম্প্রতিক ডাটা পাওয়া যায়নি</p>';
  }

  const miniC = document.getElementById("techMiniComplaints");
  if (miniC) {
    miniC.innerHTML = dailyRecords.slice(0, 5).map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.work_date}</td>
        <td>${r.office_name}</td>
        <td>অভিযোগ সমাধান</td>
        <td>${Number(r.report_data[1] || 0)} টি</td>
        <td>চলমান</td>
      </tr>
    `).join("") || '<tr><td colspan="6">No data</td></tr>';
  }

  const miniM = document.getElementById("techMiniMeters");
  if (miniM) {
    miniM.innerHTML = dailyRecords.slice(0, 5).map((r, i) => {
      let m = 0;
      for (let k = 2; k <= 6; k++) m += Number(r.report_data[k] || 0);
      let tr = 0;
      for (let k = 12; k <= 27; k++) tr += Number(r.report_data[k] || 0);
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${r.work_date}</td>
          <td>${r.office_name}</td>
          <td>${m} টি</td>
          <td>${tr} টি</td>
          <td>চলমান</td>
        </tr>
      `;
    }).join("") || '<tr><td colspan="6">No data</td></tr>';
  }
}

function renderTechOfficeProgress() {
  const targetOffices = (rowOffices && rowOffices.length ? rowOffices : rowAllOffices);
  const tbody = document.getElementById("techOfficeTableBody");
  if (!tbody) return;

  const currentYear = getFiscalYear();
  let targetMap = {};
  const local = localStorage.getItem("office_targets_store");
  if (local) {
    try {
      const parsed = JSON.parse(local);
      targetOffices.forEach(o => {
        const k = `${o.id}_${currentYear}`;
        if (parsed[k]) targetMap[o.id] = parsed[k];
      });
    } catch (_) {}
  }

  tbody.innerHTML = targetOffices.map((o, idx) => {
    const tgts = targetMap[o.id] || {};
    const officeTarget = Object.values(tgts).reduce((s, v) => s + Number(v || 0), 0);
    return `
      <tr>
        <td>${idx + 1}</td>
        <td>${getArea(o.office_name)}</td>
        <td><b>${o.office_name}</b></td>
        <td>${officeTarget > 0 ? fmt(officeTarget) : '—'}</td>
        <td>—</td>
        <td>—</td>
        <td>—</td>
        <td><span class="status">সক্রিয়</span></td>
      </tr>
    `;
  }).join("");
}

// ----------------- MONTHLY ROLLUP & CUMULATIVE CALCULATION -----------------
function getFiscalYear() {
  const el = document.getElementById("mSelectYear") || document.getElementById("adminTargetYear");
  return el ? el.value : "2026-2027";
}

function getSelectedMonth() {
  const el = document.getElementById("mSelectMonth");
  return el ? el.value : "10-2026";
}

function getMonthlyKey(month, year) {
  const m = month || getSelectedMonth();
  const y = year || getFiscalYear();
  return m + "_" + y;
}

function getFiscalMonthSequence(fiscalYear) {
  const parts = fiscalYear.split("-");
  const y1 = parts[0].trim();
  const y2 = parts[1] ? parts[1].trim() : String(Number(y1) + 1);

  return [
    { code: `07-${y1}`, monthNum: "07", year: y1, name: `জুলাই ${y1}` },
    { code: `08-${y1}`, monthNum: "08", year: y1, name: `আগস্ট ${y1}` },
    { code: `09-${y1}`, monthNum: "09", year: y1, name: `সেপ্টেম্বর ${y1}` },
    { code: `10-${y1}`, monthNum: "10", year: y1, name: `অক্টোবর ${y1}` },
    { code: `11-${y1}`, monthNum: "11", year: y1, name: `নভেম্বর ${y1}` },
    { code: `12-${y1}`, monthNum: "12", year: y1, name: `ডিসেম্বর ${y1}` },
    { code: `01-${y2}`, monthNum: "01", year: y2, name: `জানুয়ারি ${y2}` },
    { code: `02-${y2}`, monthNum: "02", year: y2, name: `ফেব্রুয়ারি ${y2}` },
    { code: `03-${y2}`, monthNum: "03", year: y2, name: `মার্চ ${y2}` },
    { code: `04-${y2}`, monthNum: "04", year: y2, name: `এপ্রিল ${y2}` },
    { code: `05-${y2}`, monthNum: "05", year: y2, name: `মে ${y2}` },
    { code: `06-${y2}`, monthNum: "06", year: y2, name: `জুন ${y2}` }
  ];
}

function populateFiscalMonths() {
  const selYear = getFiscalYear();
  const selMonthEl = document.getElementById("mSelectMonth");
  if (!selMonthEl) return;

  const currentVal = selMonthEl.value;
  const seq = getFiscalMonthSequence(selYear);

  selMonthEl.innerHTML = seq.map(m => `<option value="${m.code}">${m.name}</option>`).join("");

  const exists = seq.some(m => m.code === currentVal);
  if (exists) {
    selMonthEl.value = currentVal;
  } else {
    const oct = seq.find(m => m.monthNum === "10");
    selMonthEl.value = oct ? oct.code : seq[0].code;
  }
}

async function rollupDailyIntoMonthly(selectedMonth, fiscalYear) { /* Now handled inside loadMonthlyFromCloud */ }

function getRowMonthTotal(monthCode, fiscalYear, itemId) {
  const key = getMonthlyKey(monthCode, fiscalYear);
  const monthData = monthlyDataStore[key];
  if (!monthData || !monthData[itemId]) return 0;
  const row = monthData[itemId];
  const s = Number(row.sadar || 0);
  const b = Number(row.bakerganj || 0);
  const m = Number(row.muladi || 0);
  const me = Number(row.mehendiganj || 0);
  const h = Number(row.hizla || 0);
  return (s + b + m + me + h);
}

function calculateCumulative(itemId, currentMonthTotal = null) {
  const fiscalYear = getFiscalYear();
  const selectedMonth = getSelectedMonth();
  const seq = getFiscalMonthSequence(fiscalYear);

  let cumulative = 0;
  let hasAnyData = false;

  for (const m of seq) {
    if (m.code === selectedMonth) {
      if (currentMonthTotal !== null) {
        cumulative += Number(currentMonthTotal || 0);
        hasAnyData = true;
      } else {
        const rowTot = getRowMonthTotal(m.code, fiscalYear, itemId);
        cumulative += rowTot;
        if (rowTot > 0) hasAnyData = true;
      }
      break;
    } else {
      const rowTot = getRowMonthTotal(m.code, fiscalYear, itemId);
      cumulative += rowTot;
      if (rowTot > 0) hasAnyData = true;
    }
  }

  return { cumulative, hasAnyData };
}

function renderMonthlyTable() {
  const tbody = document.getElementById("monthlyTableBody");
  if (!tbody) return;

  const currentKey = getMonthlyKey();
  const currentMonthData = monthlyDataStore[currentKey] || {};

  tbody.innerHTML = MONTHLY_ITEMS.map((item) => {
    const rowData = currentMonthData[item.id] || { sadar: '', bakerganj: '', muladi: '', mehendiganj: '', hizla: '', fiscal: '' };
    const sadar = Number(rowData.sadar || 0);
    const baker = Number(rowData.bakerganj || 0);
    const muladi = Number(rowData.muladi || 0);
    const mehendi = Number(rowData.mehendiganj || 0);
    const hizla = Number(rowData.hizla || 0);
    const total = (sadar + baker + muladi + mehendi + hizla);
    const hasCurrentInput = (rowData.sadar !== '' || rowData.bakerganj !== '' || rowData.muladi !== '' || rowData.mehendiganj !== '' || rowData.hizla !== '');
    const totalStr = hasCurrentInput ? fmt(total) : '';

    const cumObj = calculateCumulative(item.id, hasCurrentInput ? total : 0);
    let fiscalVal = (hasCurrentInput || cumObj.hasAnyData) ? cumObj.cumulative : '';
    
    if (rowData.fiscal !== undefined && rowData.fiscal !== '' && Number(rowData.fiscal) !== cumObj.cumulative) {
      fiscalVal = fmt(rowData.fiscal);
    }

    return `
      <tr data-id="${item.id}">
        <td>${item.sl || ''}</td>
        <td class="td-title">${item.title || ''}</td>
        <td class="td-sub">${item.sub || ''}</td>
        <td>${rowData.sadar !== undefined && rowData.sadar !== '' ? rowData.sadar : '—'}</td>
        <td>${rowData.bakerganj !== undefined && rowData.bakerganj !== '' ? rowData.bakerganj : '—'}</td>
        <td>${rowData.muladi !== undefined && rowData.muladi !== '' ? rowData.muladi : '—'}</td>
        <td>${rowData.mehendiganj !== undefined && rowData.mehendiganj !== '' ? rowData.mehendiganj : '—'}</td>
        <td>${rowData.hizla !== undefined && rowData.hizla !== '' ? rowData.hizla : '—'}</td>
        <td class="td-total-val" id="mTotal_${item.id}">${totalStr || '0'}</td>
        <td class="td-fiscal-wrap" style="font-weight:bold; color:#087ae9; background:#edf5fc;">
          ${fiscalVal !== '' ? fmt(fiscalVal) : '0'}
        </td>
      </tr>
    `;
  }).join("");
}

async function loadMonthlyFromCloud() {
  try {
    const year = getFiscalYear();
    const parts = year.split("-");
    const y1 = parts[0].trim();
    const y2 = parts[1] ? parts[1].trim() : String(Number(y1) + 1);
    const startDate = `${y1}-07-01`;
    const endDate = `${y2}-06-30`;

    let dailyRecords = [];
    try {
      dailyRecords = await rowApi(`daily_technical_reports?work_date=gte.${startDate}&work_date=lte.${endDate}&limit=5000`);
    } catch (e) {}

    const localDaily = localStorage.getItem("daily_tech_store");
    if (localDaily) {
      try {
        const localMap = JSON.parse(localDaily);
        Object.entries(localMap).forEach(([key, rObj]) => {
          const [dStr, oId] = key.split("_");
          if (dStr === today && dStr >= startDate && dStr <= endDate && !dailyRecords.some(r => r.work_date === dStr && String(r.office_id) === String(oId))) {
            const targetOffices = (rowOffices && rowOffices.length ? rowOffices : rowAllOffices);
            const offObj = targetOffices.find(o => String(o.id) === String(oId));
            dailyRecords.push({
              work_date: dStr,
              office_id: Number(oId),
              office_name: offObj ? offObj.office_name : "",
              area_name: offObj ? getArea(offObj.office_name) : "বরিশাল সদর",
              report_data: rObj
            });
          }
        });
      } catch(e) {}
    }

    let tempStore = {};
    if (dailyRecords && dailyRecords.length > 0) {
      dailyRecords.forEach(rec => {
        const [rYear, rMonth, rDay] = rec.work_date.split("-");
        const monthKey = `${rMonth}-${rYear}_${year}`;
        
        if (!tempStore[monthKey]) tempStore[monthKey] = {};
        const monthData = tempStore[monthKey];
        
        const areaCol = AREA_TO_COL[rec.area_name] || "sadar";
        const repData = rec.report_data || {};
        
        Object.entries(repData).forEach(([itemId, val]) => {
          if (!monthData[itemId]) monthData[itemId] = { sadar: 0, bakerganj: 0, muladi: 0, mehendiganj: 0, hizla: 0 };
          monthData[itemId][areaCol] = (Number(monthData[itemId][areaCol]) || 0) + Number(val || 0);
        });
      });
    }

    monthlyDataStore = tempStore;
  } catch (e) {
    console.warn(e);
  }

  renderMonthlyTable();
}

function exportMonthlyExcel() {
  if (!window.XLSX) { alert("Excel library load হয়নি। Internet connection check করুন।"); return; }
  
  const mSel = document.getElementById("mSelectMonth");
  const monthText = mSel ? mSel.options[mSel.selectedIndex].text : "Report";
  const yearText = getFiscalYear();

  const rows = [
    ["বরিশাল পল্লী বিদ্যুৎ সমিতি-১"],
    ["রূপাতলী, বরিশাল।"],
    [`বিষয়ঃ কারিগরী বিভাগের সকল অফিসের মাসিক কাজের প্রতিবেদন (${monthText}, অর্থ বছর: ${yearText})`],
    ["ক্রঃনং", "কাজের বিবরন", "ক্যাটাগরি / সাইজ", "সদর দপ্তর", "বাকেরগঞ্জ", "মুলাদী", "মেহেন্দীগঞ্জ", "হিজলা", "মোট", "অর্থ বছর (ক্রমপুঞ্জিত)"]
  ];

  const trs = document.querySelectorAll("#monthlyTableBody tr");
  trs.forEach(tr => {
    const tds = tr.querySelectorAll("td");
    const sl = tds[0].textContent.trim();
    const title = tds[1].textContent.trim();
    const sub = tds[2].textContent.trim();
    const sadar = Number(tds[3].textContent.trim()) || 0;
    const baker = Number(tds[4].textContent.trim()) || 0;
    const muladi = Number(tds[5].textContent.trim()) || 0;
    const mehendi = Number(tds[6].textContent.trim()) || 0;
    const hizla = Number(tds[7].textContent.trim()) || 0;
    const tot = Number(tds[8].textContent.trim()) || 0;
    const fiscal = Number(tds[9].textContent.trim()) || 0;

    rows.push([sl, title, sub, sadar, baker, muladi, mehendi, hizla, tot, fiscal]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "কারিগরী রিপোর্ট");

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `দৈনিক_কাজের_প্রতিবেদন_${getMonthlyKey()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}


window.exportOfficeWiseExcel = async function() {
  if (!window.XLSX) {
    alert("Excel library load হয়নি। ইন্টারনেট সংযোগ চেক করে পেজটি রিলোড দিন।");
    return;
  }

  try {
    const selectedMonth = getSelectedMonth();
    const fiscalYear = getFiscalYear();
    const mSel = document.getElementById("mSelectMonth");
    let monthText = selectedMonth;
    if (mSel && mSel.selectedIndex >= 0 && mSel.options[mSel.selectedIndex]) {
      monthText = mSel.options[mSel.selectedIndex].text;
    }

    // নিশ্চিত ২৮টি অভিযোগ কেন্দ্রের তালিকা লোড (ফলব্যাক সহ)
    let targetOffices = (rowOffices && rowOffices.length ? rowOffices : rowAllOffices);
    targetOffices = sortOfficesByUserSequence(targetOffices);
    if (!targetOffices || targetOffices.length === 0) {
      targetOffices = [
        { id: 1, office_name: "সদর দপ্তর অ/কে", area: "বরিশাল সদর" },
        { id: 2, office_name: "সাহেবেরহাট এরিয়া অফিস", area: "বরিশাল সদর" },
        { id: 3, office_name: "চরামদ্দী এরিয়া অফিস", area: "বরিশাল সদর" },
        { id: 4, office_name: "চরমোনাই এরিয়া অফিস", area: "বরিশাল সদর" },
        { id: 5, office_name: "কড়াপুর অ/কে", area: "বরিশাল সদর" },
        { id: 6, office_name: "ছয়মাইল অ/কে", area: "বরিশাল সদর" },
        { id: 7, office_name: "চরবাড়ীয়া অ/কে", area: "বরিশাল সদর" },
        { id: 8, office_name: "বুখাইনগর অ/কে", area: "বরিশাল সদর" },
        { id: 9, office_name: "চরকাউয়া অ/কে", area: "বরিশাল সদর" },
        { id: 10, office_name: "কামারখালী অ/কে", area: "বরিশাল সদর" },
        { id: 11, office_name: "মুলাদী সদর অ/কে", area: "মুলাদী" },
        { id: 12, office_name: "কাজীরহাট অ/কে", area: "মুলাদী" },
        { id: 13, office_name: "সোনামদ্দিন বন্দর অ/কে", area: "মুলাদী" },
        { id: 14, office_name: "চরপদ্মা অ/কে", area: "মুলাদী" },
        { id: 15, office_name: "নাজিরপুর অ/কে", area: "মুলাদী" },
        { id: 16, office_name: "রহমানেরহাট অ/কে", area: "মুলাদী" },
        { id: 17, office_name: "বাকেরগঞ্জ সদর অ/কে", area: "বাকেরগঞ্জ" },
        { id: 18, office_name: "কলসকাঠী অ/কে", area: "বাকেরগঞ্জ" },
        { id: 19, office_name: "পেয়ারপুর অ/কে", area: "বাকেরগঞ্জ" },
        { id: 20, office_name: "পাদ্রীশিবপুর অ/কে", area: "বাকেরগঞ্জ" },
        { id: 21, office_name: "সেনেরহাট অ/কে", area: "বাকেরগঞ্জ" },
        { id: 22, office_name: "নলুয়া অ/কে", area: "বাকেরগঞ্জ" },
        { id: 23, office_name: "মেহেন্দীগঞ্জ সদর অ/কে", area: "মেহেন্দিগঞ্জ" },
        { id: 24, office_name: "জাঙ্গালিয়া অ/কে", area: "মেহেন্দিগঞ্জ" },
        { id: 25, office_name: "মাষ্টারহাট অ/কে", area: "মেহেন্দিগঞ্জ" },
        { id: 26, office_name: "হিজলা সদর অ/কে", area: "হিজলা" },
        { id: 27, office_name: "কাউরিয়া অ/কে", area: "হিজলা" },
        { id: 28, office_name: "মেমানিয়া অ/কে", area: "হিজলা" }
      ];
    }

    // এলাকাভিত্তিক গ্রুপিং
    const areaGroups = {
      "বরিশাল সদর": [],
      "মুলাদী": [],
      "বাকেরগঞ্জ": [],
      "মেহেন্দিগঞ্জ": [],
      "হিজলা": []
    };

    targetOffices.forEach(o => {
      const a = getArea(o.office_name);
      if (!areaGroups[a]) areaGroups[a] = [];
      areaGroups[a].push(o);
    });

    // তারিখ হিসাব
    const [mStr, yStr] = selectedMonth.split("-");
    const monthStart = `${yStr}-${mStr}-01`;
    const lastDay = new Date(Number(yStr), Number(mStr), 0).getDate();
    const monthEnd = `${yStr}-${mStr}-${String(lastDay).padStart(2, '0')}`;

    const seq = getFiscalMonthSequence(fiscalYear);
    const precedingMonthCodes = [];
    for (const m of seq) {
      precedingMonthCodes.push(m.code);
      if (m.code === selectedMonth) break;
    }

    // দৈনিক রেকর্ড সংগ্রহ
    let dailyRecords = [];
    try {
      dailyRecords = await rowApi(`daily_technical_reports?order=work_date.asc&limit=5000`);
    } catch (_) {}

    const localDaily = localStorage.getItem("daily_tech_store");
    let localDailyMap = {};
    if (localDaily) {
      try { localDailyMap = JSON.parse(localDaily); } catch (_) {}
    }

    // টার্গেট ডেটা লোড (From Supabase + Local Fallback)
    let targetMap = {};
    try {
      const tRows = await rowApi(`technical_office_targets?fiscal_year=eq.${encodeURIComponent(fiscalYear)}`);
      if (tRows && tRows.length) {
        tRows.forEach(tr => { targetMap[tr.office_id] = tr.targets || {}; });
      }
    } catch (_) {}

    const localTgt = localStorage.getItem("office_targets_store");
    if (localTgt) {
      try {
        const p = JSON.parse(localTgt);
        targetOffices.forEach(o => {
          const k = `${o.id}_${fiscalYear}`;
          if (p[k] && !targetMap[o.id]) targetMap[o.id] = p[k];
        });
      } catch (_) {}
    }

    // এক্সেল শিটের ডেটা প্রস্তুত
    const rowsSheet1 = [
      ["বরিশাল পল্লী বিদ্যুৎ সমিতি-১"],
      ["রূপাতলী, বরিশাল।"],
      [`বিষয়ঃ এলাকাভিত্তিক ২৮টি অভিযোগ কেন্দ্রের মাসিক ও অর্থ বছর ক্রমপুঞ্জিত কারিগরি কাজের প্রতিবেদন`],
      [`প্রতিবেদন মাস: ${monthText}  |  অর্থ বছর: ${fiscalYear}`],
      [],
      ["ক্রমিক", "এলাকা (Area)", "অভিযোগ কেন্দ্রের নাম", "নির্ধারিত বাৎসরিক টার্গেট", "চলতি মাসের সম্পন্ন কাজ", "অর্থ বছর ক্রমপুঞ্জিত সম্পন্ন", "অবশিষ্ট কাজ", "সার্বিক অগ্রগতি (%)", "স্ট্যাটাস"]
    ];

    let grandTarget = 0, grandMonthly = 0, grandCumulative = 0, grandRemaining = 0, sl = 1;

    Object.entries(areaGroups).forEach(([areaName, offices]) => {
      let areaTarget = 0, areaMonthly = 0, areaCumulative = 0;

      offices.forEach(o => {
        const tgts = targetMap[o.id] || {};
        const officeTarget = Object.values(tgts).reduce((s, v) => s + Number(v || 0), 0);

        let mDone = 0, cumDone = 0;

        dailyRecords.forEach(rec => {
          if (rec.office_id === o.id) {
            const recDate = rec.work_date;
            const rObj = rec.report_data || {};
            const sumVals = Object.values(rObj).reduce((s, v) => s + Number(v || 0), 0);
            if (recDate >= monthStart && recDate <= monthEnd) mDone += sumVals;
            const dParts = recDate.split("-");
            if (precedingMonthCodes.includes(`${dParts[1]}-${dParts[0]}`)) cumDone += sumVals;
          }
        });

        Object.entries(localDailyMap).forEach(([k, rObj]) => {
          const [dStr, oId] = k.split("_");
          if (String(oId) === String(o.id)) {
            const dParts = dStr.split("-");
            const sumVals = Object.values(rObj).reduce((s, v) => s + Number(v || 0), 0);
            if (dStr >= monthStart && dStr <= monthEnd && !dailyRecords.some(r => r.work_date === dStr && r.office_id === o.id)) {
              mDone += sumVals;
            }
            if (precedingMonthCodes.includes(`${dParts[1]}-${dParts[0]}`) && !dailyRecords.some(r => r.work_date === dStr && r.office_id === o.id)) {
              cumDone += sumVals;
            }
          }
        });

        const rem = Math.max(0, officeTarget - cumDone);
        const pctVal = officeTarget > 0 ? ((cumDone / officeTarget) * 100).toFixed(1) : (cumDone > 0 ? "100.0" : "0.0");
        const statusText = Number(pctVal) >= 65 ? "চলমান" : "অগ্রগতি";

        areaTarget += officeTarget;
        areaMonthly += mDone;
        areaCumulative += cumDone;

        rowsSheet1.push([
          sl++,
          areaName,
          o.office_name,
          officeTarget > 0 ? officeTarget : 0,
          mDone,
          cumDone,
          rem,
          pctVal + "%",
          statusText
        ]);
      });

      const areaRem = Math.max(0, areaTarget - areaCumulative);
      const areaPct = areaTarget > 0 ? ((areaCumulative / areaTarget) * 100).toFixed(1) : (areaCumulative > 0 ? "100.0" : "0.0");

      rowsSheet1.push([
        "",
        `উপ-মোট (${areaName})`,
        `${offices.length}টি কেন্দ্র`,
        areaTarget,
        areaMonthly,
        areaCumulative,
        areaRem,
        areaPct + "%",
        "-"
      ]);

      grandTarget += areaTarget;
      grandMonthly += areaMonthly;
      grandCumulative += areaCumulative;
      grandRemaining += areaRem;
    });

    const grandPct = grandTarget > 0 ? ((grandCumulative / grandTarget) * 100).toFixed(1) : (grandCumulative > 0 ? "100.0" : "0.0");

    rowsSheet1.push([
      "★",
      "সর্বমোট (সমিতি)",
      `${targetOffices.length}টি কেন্দ্র`,
      grandTarget,
      grandMonthly,
      grandCumulative,
      grandRemaining,
      grandPct + "%",
      "-"
    ]);

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(rowsSheet1);
    XLSX.utils.book_append_sheet(wb, ws1, "২৮ কেন্দ্রের সারাংশ");

    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const createUrl = window.URL || window.webkitURL;
    const a = document.createElement("a");
    a.href = createUrl.createObjectURL(blob);
    a.download = `এলাকাভিত্তিক_২৮_কেন্দ্রের_প্রতিবেদন_${selectedMonth}_${fiscalYear}.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { createUrl.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast("২৮টি অভিযোগ কেন্দ্রের Excel ফাইল ডাউনলোড হচ্ছে...");
  } catch (error) {
    console.error("Export Error:", error);
    alert("এক্সেল এক্সপোর্টে সমস্যা হয়েছে: " + error.message);
  }
};
var exportOfficeWiseExcel = window.exportOfficeWiseExcel;


function initMonthlyReport() {
  const dDate = document.getElementById("mDailyDate");
  const dOffice = document.getElementById("mDailyOffice");
  const sBtn = document.getElementById("mSaveDailyBtn");
  const sBtnB = document.getElementById("mSaveDailyBtnBottom");

  if (dDate && !dDate.value) dDate.value = today;
  if (dDate) dDate.onchange = loadDailyTechData;
  if (dOffice) dOffice.onchange = loadDailyTechData;
  if (sBtn) sBtn.onclick = saveDailyTechData;
  if (sBtnB) sBtnB.onclick = saveDailyTechData;

  const aOff = document.getElementById("adminTargetOffice");
  const aYear = document.getElementById("adminTargetYear");
  const aSave = document.getElementById("adminSaveTargetBtn");
  const aSaveB = document.getElementById("adminSaveTargetBtnBottom");

  if (aOff) aOff.onchange = loadOfficeTargets;
  if (aYear) aYear.onchange = loadOfficeTargets;
  if (aSave) aSave.onclick = saveOfficeTargets;
  if (aSaveB) aSaveB.onclick = saveOfficeTargets;

  populateFiscalMonths();
  const mYear = document.getElementById("mSelectYear");
  const mMonth = document.getElementById("mSelectMonth");
  const expBtn = document.getElementById("mExportBtn");
  const techExpBtn = document.getElementById("techExcelBtn");

  if (mYear) {
    mYear.onchange = () => {
      populateFiscalMonths();
      loadMonthlyFromCloud();
    };
  }
  if (mMonth) {
    mMonth.onchange = () => {
      loadMonthlyFromCloud();
    };
  }
  if (expBtn) expBtn.onclick = exportMonthlyExcel;
  if (techExpBtn) techExpBtn.onclick = exportMonthlyExcel;
  const offExpBtn = document.getElementById("mOfficeExportBtn");
  const techOffExpBtn = document.getElementById("techOfficeExcelBtn");
  if (offExpBtn) offExpBtn.onclick = exportOfficeWiseExcel;
  if (techOffExpBtn) techOffExpBtn.onclick = exportOfficeWiseExcel;

  document.querySelectorAll("#techSidebar nav button").forEach(b => {
    b.onclick = () => {
      const pageId = b.dataset.techPage;
      if (!pageId || pageId === "tech_logout") {
        showPortal();
        return;
      }
      switchTechNav(pageId);
    };
  });

  switchTechNav('tech_dash');
}


// ================= MODULE 3: GIS LOCATION FINDER =================
const GIS_URL = "https://zagnttuftlkdrhyrwabx.supabase.co";
const GIS_KEY = "sb_publishable_4rr4OPiyCkCFXp05EgViUg_aC38LFqd";

let gisCoords = null;
let gisLoaded = false;
let gisAccessToken = sessionStorage.getItem("gis_access_token") || null;
let gisAdminEmail = sessionStorage.getItem("gis_admin_email") || null;

function setGisStatus(msg, type = "") {
  const el = $("gisStatus");
  if (!el) return;
  el.textContent = msg;
  el.className = "status" + (type ? ` ${type}` : "");
}

function setGisUpstatus(msg, type = "") {
  const el = $("gisUpstatus");
  if (!el) return;
  el.textContent = msg;
  el.className = "status" + (type ? ` ${type}` : "");
}

function setGisAdminStatus(msg, type = "") {
  const el = $("adminStatus");
  if (!el) return;
  el.textContent = msg;
  el.className = "status" + (type ? ` ${type}` : "");
}

function toast(msg) {
  const t = $("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => t.classList.remove("show"), 2400);
}

async function gisApi(path, opt = {}, token = GIS_KEY) {
  const r = await fetch(`${GIS_URL}/rest/v1/${path}`, {
    ...opt,
    headers: {
      apikey: GIS_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opt.headers || {})
    }
  });
  const t = await r.text();
  if (!r.ok) throw Error(t || `HTTP ${r.status}`);
  return t ? JSON.parse(t) : [];
}

async function loadGisBooks() {
  const b = $("book");
  if (!b) return;
  setGisStatus("Loading Book No…");
  b.disabled = true;
  try {
    const d = await gisApi('locations?select=%22Book%20No%22');
    const v = [...new Set(d.map(x => String(x['Book No'] ?? '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    b.innerHTML = '<option value="">Select Book No</option>';
    v.forEach(x => b.appendChild(new Option(x, x)));
    b.disabled = false;
    if ($("publicBookCount")) $("publicBookCount").textContent = v.length.toLocaleString();
    if ($("kmlCount")) $("kmlCount").textContent = v.length.toLocaleString();
    setGisStatus(v.length ? `${v.length.toLocaleString()} Book No available.` : "No Book No available.", v.length ? "success" : "");
  } catch (e) {
    console.error("GIS load books error:", e);
    b.value = '';
    b.disabled = true;
    setGisStatus("Unable to load Book No. Please refresh and try again.", "error");
  }
}

async function loadGisAccounts() {
  const b = $("book") ? $("book").value.trim() : "";
  const a = $("account");
  if (!a) return;
  a.innerHTML = '<option value="">Select Book No first</option>';
  a.disabled = true;
  hideGisResult();
  if (!b) return;
  a.innerHTML = '<option value="">Loading Account No…</option>';
  try {
    const d = await gisApi(`locations?select=%22Account%20No%22&%22Book%20No%22=eq.${encodeURIComponent(b)}`);
    const v = [...new Set(d.map(x => String(x['Account No'] ?? '').trim()).filter(Boolean))].sort((x, y) => x.localeCompare(y, undefined, { numeric: true }));
    a.innerHTML = '<option value="">Select Account No</option>';
    v.forEach(x => a.appendChild(new Option(x, x)));
    a.disabled = false;
    setGisStatus(`${v.length} Account No available.`, v.length ? "success" : "error");
  } catch (e) {
    console.error("GIS load accounts error:", e);
    a.value = '';
    a.disabled = true;
    setGisStatus("Unable to load Account No. Please try again.", "error");
  }
}

function hideGisResult() {
  if ($("resultCard")) $("resultCard").hidden = true;
  if ($("detailsCard")) $("detailsCard").hidden = true;
  if ($("mapEmpty")) $("mapEmpty").hidden = false;
  if ($("mapPin")) $("mapPin").hidden = true;
  if ($("mapLabel")) $("mapLabel").hidden = true;
  if ($("mapCoords")) $("mapCoords").textContent = "No location selected";
}

async function searchGisLocation() {
  const b = $("book") ? $("book").value.trim() : "";
  const a = $("account") ? $("account").value.trim() : "";
  if (!b || !a) {
    setGisStatus("Please select Book No and Account No.", "error");
    return;
  }
  setGisStatus("Searching location…");
  hideGisResult();
  try {
    const d = await gisApi(`locations?select=%22Latitude%22,%22Longitude%22&%22Book%20No%22=eq.${encodeURIComponent(b)}&%22Account%20No%22=eq.${encodeURIComponent(a)}&limit=1`);
    if (!d.length) throw Error("Location not found");
    gisCoords = { lat: Number(d[0]["Latitude"]), lon: Number(d[0]["Longitude"]) };
    if ($("resultText")) $("resultText").textContent = `Book No: ${b}  |  Account No: ${a}`;
    if ($("detailBook")) $("detailBook").textContent = b;
    if ($("detailAccount")) $("detailAccount").textContent = a;
    if ($("detailLat")) $("detailLat").textContent = gisCoords.lat.toFixed(8);
    if ($("detailLon")) $("detailLon").textContent = gisCoords.lon.toFixed(8);
    if ($("mapCoords")) $("mapCoords").textContent = `Latitude ${gisCoords.lat.toFixed(8)}   •   Longitude ${gisCoords.lon.toFixed(8)}`;
    if ($("mapEmpty")) $("mapEmpty").hidden = true;
    if ($("mapPin")) $("mapPin").hidden = false;
    if ($("mapLabel")) { $("mapLabel").hidden = false; $("mapLabel").textContent = `Book ${b} · Acc ${a}`; }
    if ($("resultCard")) $("resultCard").hidden = false;
    if ($("detailsCard")) $("detailsCard").hidden = false;
    if ($("foundCount")) $("foundCount").textContent = (Number($("foundCount").textContent) || 0) + 1;
    setGisStatus("Location found successfully. Opening Google Maps…", "success");
    saveGisHistory(b, a);
    toast("Opening Google Maps");
    openGisMap();
  } catch (e) {
    setGisStatus("Location not found. Please check your selection.", "error");
    toast("Location not found");
  }
}

function openGisMap() {
  if (gisCoords) window.open(`https://www.google.com/maps/search/?api=1&query=${gisCoords.lat},${gisCoords.lon}`, "_blank");
}

function saveGisHistory(b, a) {
  let h = JSON.parse(localStorage.getItem("gis_history") || "[]");
  h = h.filter(x => !(x.b === b && x.a === a));
  h.unshift({ b, a, t: Date.now() });
  localStorage.setItem("gis_history", JSON.stringify(h.slice(0, 8)));
  renderGisHistory();
}

function renderGisHistory() {
  const h = JSON.parse(localStorage.getItem("gis_history") || "[]");
  const box = $("historyList");
  if (box) {
    box.innerHTML = h.length
      ? h.map(x => `<div class="history-item" onclick="useGisSearch('${x.b}','${x.a}')"><div class="history-pin">⌖</div><div class="history-main"><b>${x.b} - ${x.a}</b></div><span>›</span></div>`).join("")
      : '<div class="empty-history">No searches yet</div>';
  }
  const quick = $("quickSearches");
  if (quick) {
    quick.innerHTML = h.length
      ? h.slice(0, 5).map(x => `<span class="chip" onclick="useGisSearch('${x.b}','${x.a}')">${x.b}-${x.a}</span>`).join("")
      : '<span class="chip muted">No recent searches</span>';
  }
}

window.useGisSearch = async function(b, a) {
  if ($("book")) $("book").value = b;
  await loadGisAccounts();
  if ($("account")) $("account").value = a;
  await searchGisLocation();
};

function showGisAdminUI(isLoggedIn) {
  const loginBox = $("gisLoginBox");
  const adminBox = $("gisAdminBox");
  if (loginBox) loginBox.hidden = isLoggedIn;
  if (adminBox) adminBox.hidden = !isLoggedIn;
  if (isLoggedIn) {
    if ($("gisWho")) $("gisWho").textContent = `Logged in as: ${gisAdminEmail}`;
    loadGisAdminData();
  }
}

async function loginGisAdmin() {
  const emailEl = $("gisEmail");
  const passEl = $("gisPass");
  if (!emailEl || !passEl) return;
  const email = emailEl.value.trim();
  const password = passEl.value;
  if (!email || !password) {
    setGisUpstatus("Email ও Password দিন।", "error");
    return;
  }
  setGisUpstatus("লগইন হচ্ছে...", "");
  try {
    const r = await fetch(`${GIS_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: GIS_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const d = await r.json();
    if (!r.ok) throw Error(d.error_description || d.msg || "Login failed. Email বা Password সঠিক নয়।");
    gisAccessToken = d.access_token;
    gisAdminEmail = email;
    sessionStorage.setItem("gis_access_token", gisAccessToken);
    sessionStorage.setItem("gis_admin_email", gisAdminEmail);
    showGisAdminUI(true);
    setGisUpstatus("লগইন সফল হয়েছে!", "success");
    toast("Admin login successful");
  } catch (e) {
    setGisUpstatus(e.message, "error");
  }
}

function logoutGisAdmin() {
  gisAccessToken = null;
  gisAdminEmail = null;
  sessionStorage.removeItem("gis_access_token");
  sessionStorage.removeItem("gis_admin_email");
  showGisAdminUI(false);
  setGisUpstatus("Logged out", "success");
  toast("Logged out");
}

function parseKmlFile(t, b) {
  const x = new DOMParser().parseFromString(t, "application/xml"), o = [];
  if (x.querySelector("parsererror")) throw Error("Invalid KML/XML format");
  [...x.getElementsByTagName("Placemark")].forEach(p => {
    let a = "";
    [...p.getElementsByTagName("SimpleData")].some(n => {
      let k = (n.getAttribute("name") || "").toLowerCase(), v = n.textContent.trim();
      if (/account|consumer|customer|acct|acc/.test(k) && v) {
        a = v;
        return true;
      }
      return false;
    });
    if (!a) a = (p.getElementsByTagName("name")[0]?.textContent || "").trim();
    let c = p.getElementsByTagName("coordinates")[0]?.textContent.trim().split(/\s+/)[0];
    if (a && c) {
      let q = c.split(","), lon = +q[0], lat = +q[1];
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        o.push({ "Book No": b, "Account No": a, "Latitude": lat, "Longitude": lon });
      }
    }
  });
  return o;
}

async function loadGisAdminData() {
  const delBook = $("deleteBook");
  if (!delBook) return;
  try {
    const d = await gisApi('locations?select=%22Book%20No%22&order=%22Book%20No%22.asc', {}, gisAccessToken || GIS_KEY);
    const v = [...new Set(d.map(x => x["Book No"]).filter(Boolean))];
    delBook.innerHTML = '<option value="">Select Book No</option>';
    v.forEach(x => delBook.add(new Option(x, x)));
    if ($("bookCount")) $("bookCount").textContent = v.length.toLocaleString();
    if ($("locationCount")) {
      const cr = await fetch(`${GIS_URL}/rest/v1/locations?select=id`, {
        headers: { apikey: GIS_KEY, Authorization: `Bearer ${gisAccessToken || GIS_KEY}`, Prefer: "count=exact", Range: "0-0" }
      });
      const range = cr.headers.get("content-range") || "";
      const m = range.match(/\/(\d+)$/);
      $("locationCount").textContent = m ? Number(m[1]).toLocaleString() : "—";
    }
  } catch (e) {
    console.error("loadGisAdminData error:", e);
  }
}

async function uploadGisKml() {
  const f = $("gisFile")?.files[0];
  if (!f) return setGisAdminStatus("Select a KML file first.", "error");
  if (!gisAccessToken) return setGisAdminStatus("Please login as Admin first.", "error");
  try {
    let b = f.name.replace(/\.[^.]+$/g, "").trim();
    setGisAdminStatus(`Reading KML file for Book ${b}…`);
    let rows = parseKmlFile(await f.text(), b);
    if (!rows.length) throw Error("No valid locations found in KML");
    
    setGisAdminStatus(`Replacing existing Book No ${b} data…`);
    await gisApi(`locations?%22Book%20No%22=eq.${encodeURIComponent(b)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }, gisAccessToken);
    
    const path = encodeURIComponent(f.name);
    try {
      await fetch(`${GIS_URL}/storage/v1/object/kml-files/${path}`, {
        method: "DELETE",
        headers: { apikey: GIS_KEY, Authorization: `Bearer ${gisAccessToken}` }
      });
    } catch (_) {}
    
    await fetch(`${GIS_URL}/storage/v1/object/kml-files/${path}`, {
      method: "POST",
      headers: { apikey: GIS_KEY, Authorization: `Bearer ${gisAccessToken}`, "Content-Type": f.type || "application/vnd.google-earth.kml+xml", "x-upsert": "true" },
      body: f
    });
    
    setGisAdminStatus(`Saving ${rows.length} locations to database…`);
    for (let i = 0; i < rows.length; i += 200) {
      await gisApi("locations", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(rows.slice(i, i + 200)) }, gisAccessToken);
    }
    
    if ($("gisFile")) $("gisFile").value = "";
    setGisAdminStatus(`Book No ${b} সফলভাবে সেভ হয়েছে! (${rows.length} লোকেশন)`, "success");
    toast(`Book ${b} uploaded successfully`);
    await loadGisBooks();
    await loadGisAdminData();
  } catch (e) {
    setGisAdminStatus("Upload failed: " + e.message, "error");
  }
}

async function deleteGisBook() {
  const delBook = $("deleteBook");
  const delStatus = $("deleteStatus");
  if (!delBook || !delBook.value) {
    if (delStatus) delStatus.textContent = "Select Book No first.";
    return;
  }
  const b = delBook.value;
  if (!confirm(`Book No ${b} ডিলিট করতে চান?`)) return;
  if (delStatus) delStatus.textContent = "Deleting…";
  try {
    await gisApi(`locations?%22Book%20No%22=eq.${encodeURIComponent(b)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }, gisAccessToken);
    const path = encodeURIComponent(b + ".kml");
    try {
      await fetch(`${GIS_URL}/storage/v1/object/kml-files/${path}`, {
        method: "DELETE",
        headers: { apikey: GIS_KEY, Authorization: `Bearer ${gisAccessToken}` }
      });
    } catch (_) {}
    if (delStatus) delStatus.textContent = `Book No ${b} deleted successfully.`;
    toast(`Book ${b} deleted`);
    await loadGisBooks();
    await loadGisAdminData();
  } catch (e) {
    if (delStatus) delStatus.textContent = "Delete failed: " + e.message;
  }
}

function initGis() {
  if (gisLoaded) return;
  gisLoaded = true;

  if ($("book")) $("book").onchange = loadGisAccounts;
  if ($("account")) $("account").onchange = () => {
    if ($("account").value.trim()) setGisStatus(`Account No ${$("account").value.trim()} selected.`, "success");
  };
  if ($("search")) $("search").onclick = searchGisLocation;
  if ($("mapBtn")) $("mapBtn").onclick = openGisMap;
  if ($("mapBtn2")) $("mapBtn2").onclick = openGisMap;
  if ($("fullMapBtn")) $("fullMapBtn").onclick = openGisMap;
  if ($("copyBtn")) {
    $("copyBtn").onclick = async () => {
      if (!gisCoords) return;
      await navigator.clipboard.writeText(`${gisCoords.lat}, ${gisCoords.lon}`);
      toast("Coordinates copied");
    };
  }
  if ($("clearHistory")) {
    $("clearHistory").onclick = () => {
      localStorage.removeItem("gis_history");
      renderGisHistory();
      toast("Search history cleared");
    };
  }
  if ($("settingsBtn")) $("settingsBtn").onclick = () => { if ($("settingsPanel")) $("settingsPanel").hidden = false; };
  if ($("closeSettings")) $("closeSettings").onclick = () => { if ($("settingsPanel")) $("settingsPanel").hidden = true; };
  if ($("gisThemeToggle")) {
    $("gisThemeToggle").onclick = () => {
      document.body.classList.toggle("dark");
    };
  }

  if ($("gisLoginBtn")) $("gisLoginBtn").onclick = loginGisAdmin;
  if ($("gisLogout")) $("gisLogout").onclick = logoutGisAdmin;
  if ($("upload")) $("upload").onclick = uploadGisKml;
  if ($("deleteBtn")) $("deleteBtn").onclick = deleteGisBook;

  renderGisHistory();
  loadGisBooks();
  showGisAdminUI(!!gisAccessToken);
}


// ================= INITIALIZE ON PAGE LOAD =================
document.addEventListener("DOMContentLoaded", () => {
  const currentHash = window.location.hash.replace('#', '');
  if (['row', 'monthly', 'gis', 'line'].includes(currentHash)) {
    openModule(currentHash);
  } else {
    showPortal();
  }

  if ($("headDate")) $("headDate").textContent = today.split("-").reverse().join("-");
  if ($("gisYear")) $("gisYear").textContent = new Date().getFullYear();

  document.querySelectorAll("nav button,[data-page]").forEach(b => {
    b.addEventListener("click", () => {
      const p = b.dataset.page;
      if (!p || p === 'logout') return;
      document.querySelectorAll(".page").forEach(x => x.classList.remove("active"));
      if ($(p)) $(p).classList.add("active");
      document.querySelectorAll("nav button").forEach(x => x.classList.remove("active"));
      const n = document.querySelector(`nav button[data-page="${p}"]`);
      if (n) n.classList.add("active");
      closeMobileMenu();
    });
  });

  if ($("menuToggle")) $("menuToggle").onclick = toggleMobileMenu;
  if ($("sidebarOverlay")) $("sidebarOverlay").onclick = closeMobileMenu;
  if ($("saveRow")) $("saveRow").onclick = saveRow;
  if ($("excel")) $("excel").onclick = exportExcel;
  if ($("excel2")) $("excel2").onclick = exportExcel;
  if ($("adminLoginBtn")) $("adminLoginBtn").onclick = adminLogin;
  if ($("adminLogout")) $("adminLogout").onclick = adminLogout;
  if ($("adminRefresh")) $("adminRefresh").onclick = () => renderAdmin();
  if ($("aDate")) $("aDate").addEventListener("change", () => renderAdmin());
  if ($("saveAllAdminBtn")) $("saveAllAdminBtn").onclick = saveAllAdminDailyRows;

  if ($("adminOfficeBody")) {
    $("adminOfficeBody").addEventListener("click", e => {
      const b = e.target.closest(".saveTarget");
      if (b) saveTarget(b.dataset.id);
    });
  }
  if ($("adminDailyBody")) {
    $("adminDailyBody").addEventListener("click", e => {
      const b = e.target.closest(".saveAdminDailyRow");
      if (b) saveAdminDailyRow(b.dataset.officeId);
    });
  }

  loadRow();
});



window.exportTargetVsAchievementExcel = async function() {
  if (!window.XLSX) {
    alert("Excel library load হয়নি। ইন্টারনেট সংযোগ চেক করে পেজটি রিলোড দিন।");
    return;
  }

  try {
    const selectedMonth = getSelectedMonth();
    const fiscalYear = getFiscalYear();
    const mSel = document.getElementById("mSelectMonth");
    let monthText = selectedMonth;
    if (mSel && mSel.selectedIndex >= 0 && mSel.options[mSel.selectedIndex]) {
      monthText = mSel.options[mSel.selectedIndex].text;
    }

    let targetOffices = (rowOffices && rowOffices.length ? rowOffices : rowAllOffices);
    targetOffices = sortOfficesByUserSequence(targetOffices);
    if (!targetOffices || targetOffices.length === 0) {
      targetOffices = [
        { id: 1, office_name: "সদর দপ্তর অ/কে", area: "বরিশাল সদর" },
        { id: 2, office_name: "সাহেবেরহাট এরিয়া অফিস", area: "বরিশাল সদর" },
        { id: 3, office_name: "চরামদ্দী এরিয়া অফিস", area: "বরিশাল সদর" },
        { id: 4, office_name: "চরমোনাই এরিয়া অফিস", area: "বরিশাল সদর" },
        { id: 5, office_name: "কড়াপুর অ/কে", area: "বরিশাল সদর" },
        { id: 6, office_name: "ছয়মাইল অ/কে", area: "বরিশাল সদর" },
        { id: 7, office_name: "চরবাড়ীয়া অ/কে", area: "বরিশাল সদর" },
        { id: 8, office_name: "বুখাইনগর অ/কে", area: "বরিশাল সদর" },
        { id: 9, office_name: "চরকাউয়া অ/কে", area: "বরিশাল সদর" },
        { id: 10, office_name: "কামারখালী অ/কে", area: "বরিশাল সদর" },
        { id: 11, office_name: "মুলাদী সদর অ/কে", area: "মুলাদী" },
        { id: 12, office_name: "কাজীরহাট অ/কে", area: "মুলাদী" },
        { id: 13, office_name: "সোনামদ্দিন বন্দর অ/কে", area: "মুলাদী" },
        { id: 14, office_name: "চরপদ্মা অ/কে", area: "মুলাদী" },
        { id: 15, office_name: "নাজিরপুর অ/কে", area: "মুলাদী" },
        { id: 16, office_name: "রহমানেরহাট অ/কে", area: "মুলাদী" },
        { id: 17, office_name: "বাকেরগঞ্জ সদর অ/কে", area: "বাকেরগঞ্জ" },
        { id: 18, office_name: "কলসকাঠী অ/কে", area: "বাকেরগঞ্জ" },
        { id: 19, office_name: "পেয়ারপুর অ/কে", area: "বাকেরগঞ্জ" },
        { id: 20, office_name: "পাদ্রীশিবপুর অ/কে", area: "বাকেরগঞ্জ" },
        { id: 21, office_name: "সেনেরহাট অ/কে", area: "বাকেরগঞ্জ" },
        { id: 22, office_name: "নলুয়া অ/কে", area: "বাকেরগঞ্জ" },
        { id: 23, office_name: "মেহেন্দীগঞ্জ সদর অ/কে", area: "মেহেন্দিগঞ্জ" },
        { id: 24, office_name: "জাঙ্গালিয়া অ/কে", area: "মেহেন্দিগঞ্জ" },
        { id: 25, office_name: "মাষ্টারহাট অ/কে", area: "মেহেন্দিগঞ্জ" },
        { id: 26, office_name: "হিজলা সদর অ/কে", area: "হিজলা" },
        { id: 27, office_name: "কাউরিয়া অ/কে", area: "হিজলা" },
        { id: 28, office_name: "মেমানিয়া অ/কে", area: "হিজলা" }
      ];
    }

    // Area groups
    const areaGroups = {
      "বরিশাল সদর": [],
      "মুলাদী": [],
      "বাকেরগঞ্জ": [],
      "মেহেন্দিগঞ্জ": [],
      "হিজলা": []
    };
    targetOffices.forEach(o => {
      const a = getArea(o.office_name);
      if (!areaGroups[a]) areaGroups[a] = [];
      areaGroups[a].push(o);
    });

    // Load targets (From Supabase + Local Fallback)
    let targetMap = {};
    try {
      const tRows = await rowApi(`technical_office_targets?fiscal_year=eq.${encodeURIComponent(fiscalYear)}`);
      if (tRows && tRows.length) {
        tRows.forEach(tr => { targetMap[tr.office_id] = tr.targets || {}; });
      }
    } catch (_) {}

    const localTgt = localStorage.getItem("office_targets_store");
    if (localTgt) {
      try {
        const p = JSON.parse(localTgt);
        targetOffices.forEach(o => {
          const k = `${o.id}_${fiscalYear}`;
          if (p[k] && !targetMap[o.id]) targetMap[o.id] = p[k];
        });
      } catch (_) {}
    }

    // Load daily records for achievements
    let dailyRecords = [];
    try {
      dailyRecords = await rowApi(`daily_technical_reports?order=work_date.asc&limit=5000`);
    } catch (_) {}

    const localDaily = localStorage.getItem("daily_tech_store");
    let localDailyMap = {};
    if (localDaily) {
      try { localDailyMap = JSON.parse(localDaily); } catch (_) {}
    }

    const [mStr, yStr] = selectedMonth.split("-");
    const monthStart = `${yStr}-${mStr}-01`;
    const lastDay = new Date(Number(yStr), Number(mStr), 0).getDate();
    const monthEnd = `${yStr}-${mStr}-${String(lastDay).padStart(2, '0')}`;

    // Build header row 1 & row 2 for Capture3 style
    // Row 0: Title
    // Row 1: Area headers spanning target & achievement columns
    // Row 2: Center headers
    // Row 3: Sub headers (লক্ষ্যমাত্রা | অর্জন)

    const r1 = ["বরিশাল পল্লী বিদ্যুৎ সমিতি-১", "", ""];
    const r2 = ["ক্রঃনং", "কাজের বিবরন", "ক্যাটাগরি / সাইজ"];
    const r3 = ["", "", ""];

    let flatOffices = [];
    Object.entries(areaGroups).forEach(([areaName, offices]) => {
      offices.forEach(o => {
        r1.push(areaName, "");
        r2.push(o.office_name, "");
        r3.push("লক্ষ্যমাত্রা", "অর্জন");
        flatOffices.push(o);
      });
      // Area subtotal columns
      r1.push(`${areaName} (উপ-মোট)`, "");
      r2.push("উপ-মোট", "");
      r3.push("লক্ষ্যমাত্রা", "অর্জন");
    });

    // Grand total columns
    r1.push("সর্বমোট (সমিতি)", "");
    r2.push("সর্বমোট", "");
    r3.push("লক্ষ্যমাত্রা", "অর্জন");

    const excelRows = [
      ["বরিশাল পল্লী বিদ্যুৎ সমিতি-১"],
      [`অভিযোগ কেন্দ্রভিত্তিক টার্গেট বনাম অর্জন প্রতিবেদন (${monthText}, অর্থ বছর: ${fiscalYear})`],
      [],
      r1,
      r2,
      r3
    ];

    // For each of the 39 items (78 rows)
    MONTHLY_ITEMS.forEach((item, index) => {
      const rowData = [item.id, item.title, item.sub];

      let itemGrandTarget = 0;
      let itemGrandAch = 0;

      Object.entries(areaGroups).forEach(([areaName, offices]) => {
        let areaTgtSum = 0;
        let areaAchSum = 0;

        offices.forEach(o => {
          const tgts = targetMap[o.id] || {};
          const tVal = Number(tgts[item.id] || 0);

          let aVal = 0;
          dailyRecords.forEach(rec => {
            if (rec.office_id === o.id && rec.work_date >= monthStart && rec.work_date <= monthEnd) {
              const rObj = rec.report_data || {};
              aVal += Number(rObj[item.id] || 0);
            }
          });

          Object.entries(localDailyMap).forEach(([k, rObj]) => {
            const [dStr, oId] = k.split("_");
            if (String(oId) === String(o.id) && dStr >= monthStart && dStr <= monthEnd) {
              if (dStr === today && !dailyRecords.some(r => r.work_date === dStr && r.office_id === o.id)) {
                aVal += Number(rObj[item.id] || 0);
              }
            }
          });

          areaTgtSum += tVal;
          areaAchSum += aVal;

          rowData.push(tVal > 0 ? tVal : 0, aVal > 0 ? aVal : 0);
        });

        // Area Subtotal
        rowData.push(areaTgtSum, areaAchSum);
        itemGrandTarget += areaTgtSum;
        itemGrandAch += areaAchSum;
      });

      // Grand Total
      rowData.push(itemGrandTarget, itemGrandAch);

      excelRows.push(rowData);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelRows);
    XLSX.utils.book_append_sheet(wb, ws, "টার্গেট বনাম অর্জন");

    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const createUrl = window.URL || window.webkitURL;
    const a = document.createElement("a");
    a.href = createUrl.createObjectURL(blob);
    a.download = `টার্গেট_বনাম_অর্জন_প্রতিবেদন_${selectedMonth}_${fiscalYear}.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { createUrl.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast("টার্গেট বনাম অর্জন Excel ফাইল ডাউনলোড হচ্ছে...");
  } catch (error) {
    console.error("Target vs Ach Export Error:", error);
    alert("এক্সেল এক্সপোর্টে সমস্যা হয়েছে: " + error.message);
  }
};
window.exportTargetVsAchievementExcel = exportTargetVsAchievementExcel;



async function techAdminLogin() {
  const email = $("techAdminEmail") ? $("techAdminEmail").value.trim() : "", password = $("techAdminPass") ? $("techAdminPass").value : "";
  const msg = $("techAdminLoginMsg");
  if (!email || !password) {
    if (msg) { msg.textContent = "Email ও Password দিন।"; msg.style.color = "#d92334"; }
    return;
  }
  if (msg) { msg.textContent = "লগইন হচ্ছে..."; msg.style.color = "#0758a8"; }

  try {
    const r = await fetch(ROW_SUPABASE_URL + "/auth/v1/token?grant_type=password", { 
      method: "POST", 
      headers: { apikey: ROW_KEY, "Content-Type": "application/json" }, 
      body: JSON.stringify({ email, password }) 
    });
    const d = await r.json();
    if (!r.ok) { throw Error(d.error_description || d.msg || "Email বা Password সঠিক নয়।"); }

    const loggedInEmail = d.user?.email || email;
    const allowedAdmin = "parvezhossain89@gmail.com";
    if (loggedInEmail.toLowerCase() !== allowedAdmin.toLowerCase()) {
      throw Error("অনুমতি অস্বীকৃত! শুধুমাত্র অনুমোদিত Admin (Parvez Hossain) এই প্যানেলে প্রবেশ করতে পারবেন।");
    }

    if ($("techAdminLogin")) $("techAdminLogin").style.display = "none";
    if ($("techAdminContent")) $("techAdminContent").style.display = "block";
    if (msg) msg.textContent = "";
    populateAdminTargetOffices();
    loadOfficeTargets();
    toast("Admin login successful!");
  } catch (e) {
    if (msg) { msg.textContent = e.message; msg.style.color = "#d92334"; }
  }
}

function techAdminLogout() {
  if ($("techAdminLogin")) $("techAdminLogin").style.display = "block";
  if ($("techAdminContent")) $("techAdminContent").style.display = "none";
  if ($("techAdminEmail")) $("techAdminEmail").value = "";
  if ($("techAdminPass")) $("techAdminPass").value = "";
  toast("Logged out successfully");
}



  const tLoginBtn = document.getElementById("techAdminLoginBtn");
  const tLogoutBtn = document.getElementById("techAdminLogoutBtn");
  if (tLoginBtn) tLoginBtn.onclick = techAdminLogin;
  if (tLogoutBtn) tLogoutBtn.onclick = techAdminLogout;



window.exportRowDetailedExcel = function() {
  if (!window.XLSX) { alert("Excel library load হয়নি। Internet connection check করুন।"); return; }
  const os = officeStats();
  const T = rowOffices.reduce((s, o) => s + num(o.target_km), 0);
  const R = os.reduce((s, o) => s + o.row, 0);
  const L = os.reduce((s, o) => s + o.lab, 0);

  const rows = [
    ["বরিশাল পল্লী বিদ্যুৎ সমিতি-১"],
    ["রূপাতলী, বরিশাল।"],
    ["দৈনিক রাইট অব ওয়ে (ROW) কাজ ও শ্রমিকের কাজের অগ্রগতি প্রতিবেদন"],
    [`তারিখ: ${today}`],
    [],
    ["ক্রমিক", "এলাকা (Area)", "অভিযোগ কেন্দ্রের নাম", "বাৎসরিক টার্গেট (KM)", "কার্যসম্পাদিত ROW (KM)", "অবশিষ্ট ROW (KM)", "অগ্রগতি (%)", "শ্রমিক সংখ্যা (জন)"]
  ];

  os.forEach((o, idx) => {
    const t = num(o.target_km);
    const r = o.row;
    const rem = Math.max(0, t - r);
    const p = t > 0 ? (r / t * 100).toFixed(1) : (r > 0 ? "100.0" : "0.0");
    rows.push([idx + 1, o.area, o.office_name, t, +r.toFixed(2), +rem.toFixed(2), p + "%", o.lab]);
  });

  const totalRem = Math.max(0, T - R);
  const totalP = T > 0 ? (R / T * 100).toFixed(1) : "0.0";
  rows.push(["", "সর্বমোট", "", T, +R.toFixed(2), +totalRem.toFixed(2), totalP + "%", L]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "ROW_Report");

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `দৈনিক_ROW_প্রতিবেদন_${today}.xlsx`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast("ROW এক্সেল ফাইল ডাউনলোড হচ্ছে...");
};



window.exportRowDailyDetailedReportExcel = function() {
  if (!window.XLSX) { alert("Excel library load হয়নি। Internet connection check করুন।"); return; }
  
  let dates = [...new Set(rowWorkData.map(r => r.work_date))].sort();
  if (dates.length === 0) {
    dates = [today];
  }

  let rawList = (rowAllOffices.length ? rowAllOffices : rowOffices);
  const offices = sortOfficesByUserSequence(rawList);

  const row1 = ["বরিশাল পল্লী বিদ্যুৎ সমিতি-১", ""];
  const row2 = ["তারিখ", "Office"];
  const row3 = ["Office", "Labour"];

  dates.forEach(d => {
    row1.push(d, "");
    row2.push(d, "");
    row3.push("Labour", "KM");
  });

  const excelRows = [
    row1,
    row2,
    row3
  ];

  offices.forEach(o => {
    const oName = o.office_name;
    const rData = [oName, ""];
    
    dates.forEach(d => {
      const rec = rowWorkData.find(x => x.work_date === d && x.office_id === o.id);
      const lab = rec ? Number(rec.labour_count || 0) : "";
      const km = rec ? Number(rec.row_km || 0) : "";
      rData.push(lab, km);
    });

    excelRows.push(rData);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(excelRows);
  XLSX.utils.book_append_sheet(wb, ws, "Progress Summary");

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `দৈনিক_ROW_রিপোর্ট_${today}.xlsx`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast("হুবহু ফরম্যাটের এক্সেল ফাইল ডাউনলোড হচ্ছে...");
};
window.exportRowDailyDetailedReportExcel = window.exportRowDailyDetailedReportExcel;














function sortOfficesByUserSequence(offices) {
  const seq = [
    "সদর দপ্তর",
    "কড়াপুর",
    "কামারখালী",
    "চরকাউয়া",
    "ছয়মাইল",
    "বুখাইনগর",
    "সাহেবেরহাট",
    "চরবাড়ীয়া",
    "চরামদ্দী",
    "বাকেরগঞ্জ সদর",
    "কলসকাঠী",
    "নলুয়া",
    "পাদ্রীশিবপুর",
    "পেয়ারপুর",
    "মহেশপুর",
    "সেনেরহাট",
    "মুলাদী সদর",
    "সোনামদ্দিন",
    "নাজিরপুর",
    "কাজীরহাট",
    "চরপদ্মা",
    "রহমানেরহাট",
    "মেহেন্দিগঞ্জ সদর", "মেহেন্দীগঞ্জ সদর",
    "মাষ্টারহাট", "মাস্টারহাট",
    "জাঙ্গালিয়া", "ডাঙ্গালিয়া",
    "হিজলা সদর",
    "কাউরিয়া",
    "মেমানিয়া"
  ];

  return offices.slice().sort((a, b) => {
    let nameA = cleanStr(a.office_name);
    let nameB = cleanStr(b.office_name);
    
    let idxA = seq.findIndex(s => nameA.includes(cleanStr(s)) || cleanStr(s).includes(nameA));
    let idxB = seq.findIndex(s => nameB.includes(cleanStr(s)) || cleanStr(s).includes(nameB));
    
    if (idxA === -1) idxA = 999;
    if (idxB === -1) idxB = 999;
    return idxA - idxB;
  });
}














function renderTopAndLowestPerformers() {
  const os = officeStats();
  if (!os || os.length === 0) return;
  const sorted = [...os].sort((a, b) => b.row - a.row);
  const top = sorted[0];
  const lowest = sorted[sorted.length - 1];

  const topBox = document.getElementById("topOfficeBox");
  const lowBox = document.getElementById("lowOfficeBox");

  if (topBox) {
    topBox.innerHTML = `<b>${top.office_name}</b> (${top.area})<br><span style="color:#0b8e4e; font-size:18px;">${fmt(top.row)} KM</span> সম্পন্ন`;
  }
  if (lowBox) {
    lowBox.innerHTML = `<b>${lowest.office_name}</b> (${lowest.area})<br><span style="color:#d92334; font-size:18px;">${fmt(lowest.row)} KM</span> সম্পন্ন`;
  }
}



async function renderTechTopAndLowestPerformers() {
  const dateEl = document.getElementById("techPerfDate");
  const selectedDate = dateEl && dateEl.value ? dateEl.value : today;
  if (dateEl && !dateEl.value) dateEl.value = today;

  const topBox = document.getElementById("techTopOfficeBox");
  const lowBox = document.getElementById("techLowOfficeBox");
  
  if (topBox) topBox.innerHTML = "তথ্য বিশ্লেষণ হচ্ছে...";
  if (lowBox) lowBox.innerHTML = "তথ্য বিশ্লেষণ হচ্ছে...";

  let dateRecords = [];
  try {
    dateRecords = await rowApi(`daily_technical_reports?work_date=eq.${selectedDate}`);
  } catch (e) {
    console.warn("Could not fetch date records", e);
  }

  const targetOffices = (rowOffices && rowOffices.length ? rowOffices : rowAllOffices);
  let summary = [];

  targetOffices.forEach(o => {
    let doneSum = 0;
    const rec = dateRecords.find(r => r.office_id === o.id);
    if (rec && rec.report_data) {
      doneSum = Object.values(rec.report_data).reduce((acc, val) => acc + Number(val || 0), 0);
    } else {
      // check local storage fallback
      const key = `${selectedDate}_${o.id}`;
      const localStr = localStorage.getItem("daily_tech_store");
      if (localStr) {
        try {
          const lData = JSON.parse(localStr);
          if (lData[key]) {
            doneSum = Object.values(lData[key]).reduce((acc, val) => acc + Number(val || 0), 0);
          }
        } catch (_) {}
      }
    }
    summary.push({
      name: o.office_name,
      area: getArea(o.office_name),
      done: doneSum
    });
  });

  if (summary.length === 0) {
    if (topBox) topBox.innerHTML = "কোনো তথ্য পাওয়া যায়নি।";
    if (lowBox) lowBox.innerHTML = "কোনো তথ্য পাওয়া যায়নি।";
    return;
  }

  const sorted = summary.sort((a, b) => b.done - a.done);
  const top = sorted[0];
  const lowest = sorted[sorted.length - 1];

  if (topBox) {
    topBox.innerHTML = `<b>${top.name}</b> (${top.area})<br><span style="color:#0b8e4e; font-size:18px;">${fmt(top.done)} টি</span> কাজ সম্পন্ন`;
  }
  if (lowBox) {
    lowBox.innerHTML = `<b>${lowest.name}</b> (${lowest.area})<br><span style="color:#d92334; font-size:18px;">${fmt(lowest.done)} টি</span> কাজ সম্পন্ন`;
  }
}


window.addEventListener("hashchange", () => {
  if (!window.location.hash || window.location.hash === "" || window.location.hash === "#") {
    showPortal();
  }
});
