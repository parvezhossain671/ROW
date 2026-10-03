const SUPABASE_URL = "https://zagnttuftlkdrhyrwabx.supabase.co";
const KEY = "sb_publishable_4rr4OPiyCkCFXp05EgViUg_aC38LFqd";
const ADMIN_UID = "4be17fa6-a067-43f1-98c5-d62862bbbf1c";
const ADMIN_EMAIL = "parvezhossain89@gmail.com";

const MAP = {
  "বরিশাল সদর": ["সদর দপ্তর অ/কে", "সাহেবেরহাট এরিয়া অফিস", "সাহেবেরহাট এরিয়া অফিস", "চরামদ্দী এরিয়া অফিস", "চরমোনাই এরিয়া অফিস", "কড়াপুর অ/কে", "কড়াপুর অ/কে", "ছয়মাইল অ/কে", "ছামাইল অ/কে", "চরবাড়ীয়া অ/কে", "চরবাড়ীয়া অ/কে", "বুখাইনগর অ/কে", "বুধাইনগর অ/কে", "চরকাউয়া অ/কে", "চরকাউয়া অ/কে", "কামারখালী অ/কে", "কমরখালী অ/কে"],
  "মুলাদী": ["মুলাদী সদর অ/কে", "কাজীরহাট এ/কে", "কাজীরহাট অ/কে", "কাজিরহাট অ/কে", "সোনামদ্দিন বন্দর অ/কে", "চরপদ্মা অ/কে", "নাজিরপুর অ/কে", "রহমানেরহাট অ/কে", "রহমানপুরহাট অ/কে"],
  "বাকেরগঞ্জ": ["বাকেরগঞ্জ সদর অ/কে", "কলসকাঠী অ/কে", "পেয়ারপুর অ/কে", "পেয়ারাপুর অ/কে", "পেয়ারপুর অ/কে", "পাদ্রীশিবপুর অ/কে", "সেনেরহাট অ/কে", "নলুয়া অ/কে", "নলুয়া অ/কে", "নন্দুয়ালী অ/কে", "মহেশপুর অ/কে"],
  "মেহেন্দিগঞ্জ": ["মেহেন্দিগঞ্জ সদর অ/কে", "জাঙ্গালিয়া অ/কে", "জাঙ্গালিয়া অ/কে", "ডাঙ্গালিয়া অ/কে", "মাষ্টারহাট অ/কে", "মাষ্টার হাট অ/কে"],
  "হিজলা": ["হিজলা সদর অ/কে", "কাউরিয়া অ/কে", "কাউরিয়া অ/কে", "মেমানিয়া অ/কে", "মেমানিয়া অ/কে"]
};

const cleanStr = str => str ? str.replace(/য়/g, 'য়').replace(/ড়/g, 'ড়').trim() : "";

const AREA = {};
Object.entries(MAP).forEach(([a, x]) => x.forEach(o => AREA[cleanStr(o)] = a));

let offices = [], allOffices = [], rows = [],
  today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
  accessToken = null, currentUser = null;

const $ = id => document.getElementById(id);
const num = x => Number(x || 0);
const fmt = x => num(x).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const pct = (r, t) => t ? Math.min(100, r / t * 100) : 0;

const area = o => {
  if (!o) return "বরিশাল সদর";
  const norm = cleanStr(o);
  if (AREA[norm]) return AREA[norm];
  if (norm.includes("পেয়ারপুর") || norm.includes("পেয়ারাপুর") || norm.includes("নলুয়া") || norm.includes("বাকেরগঞ্জ") || norm.includes("কলসকাঠী") || norm.includes("পাদ্রীশিবপুর") || norm.includes("সেনেরহাট")) return "বাকেরগঞ্জ";
  if (norm.includes("জাঙ্গালিয়া") || norm.includes("মেহেন্দিগঞ্জ") || norm.includes("মাষ্টারহাট")) return "মেহেন্দিগঞ্জ";
  if (norm.includes("কড়াপুর") || norm.includes("সাহেবেরহাট") || norm.includes("চরকাউয়া") || norm.includes("চরমোনাই") || norm.includes("চরামদ্দী") || norm.includes("ছয়মাইল") || norm.includes("চরবাড়ীয়া") || norm.includes("বুখাইনগর") || norm.includes("কামারখালী")) return "বরিশাল সদর";
  if (norm.includes("মুলাদী") || norm.includes("কাজীরহাট") || norm.includes("সোনামদ্দিন")) return "মুলাদী";
  if (norm.includes("হিজলা") || norm.includes("কাউরিয়া") || norm.includes("মেমানিয়া")) return "হিজলা";
  for (const [a, arr] of Object.entries(MAP)) {
    if (arr.some(item => norm.includes(cleanStr(item)) || cleanStr(item).includes(norm))) return a;
  }
  return "বরিশাল সদর";
};

async function api(path, opt = {}) {
  const h = { apikey: KEY, "Content-Type": "application/json", ...(opt.headers || {}) };
  if (accessToken) h.Authorization = `Bearer ${accessToken}`;
  const r = await fetch(SUPABASE_URL + "/rest/v1/" + path, { ...opt, headers: h });
  const t = await r.text();
  if (!r.ok) throw Error(t || `HTTP ${r.status}`);
  return t ? JSON.parse(t) : [];
}

function officeStats() {
  return offices.map(o => {
    const rs = rows.filter(r => r.office_id === o.id);
    return { ...o, area: area(o.office_name), row: rs.reduce((s, r) => s + num(r.row_km), 0), lab: rs.reduce((s, r) => s + num(r.labour_count), 0) };
  });
}

function render() {
  const os = officeStats();
  const T = offices.reduce((s, o) => s + num(o.target_km), 0);
  const R = os.reduce((s, o) => s + o.row, 0);
  const L = os.reduce((s, o) => s + o.lab, 0); // মোট লেবার
  const rem = Math.max(0, T - R);
  const P = pct(R, T);

  if ($("headDate")) $("headDate").textContent = today.split("-").reverse().join("-");
  if ($("kOff")) $("kOff").textContent = offices.length;
  if ($("kTarget")) $("kTarget").textContent = fmt(T);
  if ($("kDone")) $("kDone").textContent = fmt(R);
  if ($("kRemain")) $("kRemain").textContent = fmt(rem);
  if ($("kLabour")) $("kLabour").textContent = fmt(L); // ড্যাশবোর্ডে মোট লেবার আপডেট
  if ($("doneBar")) $("doneBar").style.width = P + "%";
  if ($("remainBar")) $("remainBar").style.width = (100 - P) + "%";
  if ($("donePct")) $("donePct").textContent = P.toFixed(1) + "% সম্পন্ন";
  if ($("remainPct")) $("remainPct").textContent = (100 - P) + "% অবশিষ্ট";
  if ($("donutPct")) $("donutPct").textContent = P.toFixed(1) + "%";
  if (document.querySelector(".donut")) document.querySelector(".donut").style.background = `conic-gradient(#159b55 0 ${P * 3.6}deg,#e4ebf2 ${P * 3.6}deg 360deg)`;

  let am = {};
  Object.keys(MAP).forEach(a => am[a] = { t: 0, r: 0, l: 0 });
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

  const recent = rows.slice().sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)).slice(0, 5);
  if ($("recentList")) $("recentList").innerHTML = recent.length ? recent.map((r, i) => { const o = offices.find(x => x.id === r.office_id); return `<div class="recentItem"><div class="rIcon" style="background:${i % 3 === 0 ? '#08a55b' : i % 3 === 1 ? '#1685e8' : '#f5a000'}">${i % 3 === 0 ? '✓' : i % 3 === 1 ? '↗' : '◷'}</div><div><b>${o?.office_name || '-'}</b><small>ROW কাজ ${fmt(r.row_km)} KM · Labour ${r.labour_count}</small></div><time>${r.work_date}</time></div>`; }).join("") : "<p>সাম্প্রতিক data নেই</p>";

  const rr = rows.slice().sort((a, b) => b.work_date.localeCompare(a.work_date)).slice(0, 5);
  if ($("rowMini")) $("rowMini").innerHTML = rr.length ? rr.map((r, i) => { const o = offices.find(x => x.id === r.office_id); return `<tr><td>${i + 1}</td><td>${r.work_date}</td><td>${o?.office_name || '-'}</td><td>ROW কাজ</td><td>${fmt(r.row_km)} KM</td><td>${r.labour_count}</td><td>চলমান</td></tr>`; }).join("") : `<tr><td colspan="7">No data</td></tr>`;
  if ($("labMini")) $("labMini").innerHTML = rr.length ? rr.map((r, i) => { const o = offices.find(x => x.id === r.office_id); return `<tr><td>${i + 1}</td><td>${r.work_date}</td><td>${o?.office_name || '-'}</td><td>ROW কাজ</td><td>${r.labour_count}</td><td>${fmt(r.row_km)} KM</td><td>চলমান</td></tr>`; }).join("") : `<tr><td colspan="7">No data</td></tr>`;

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
  if (accessToken) renderAdmin();
}

function populateSelects() {
  const opts = '<option value="">অভিযোগ কেন্দ্র নির্বাচন করুন</option>' + offices.map(o => `<option value="${o.id}">${o.office_name} — ${area(o.office_name)}</option>`).join("");
  if ($("dOffice")) $("dOffice").innerHTML = opts;
}

function renderDateTable(d) {
  const rr = rows.filter(r => r.work_date === d);
  if ($("rowTable")) $("rowTable").innerHTML = rr.map(r => { const o = offices.find(x => x.id === r.office_id); return `<tr><td>${r.work_date}</td><td>${area(o?.office_name)}</td><td>${o?.office_name || '-'}</td><td>${fmt(r.row_km)}</td><td>${r.labour_count}</td></tr>`; }).join("") || '<tr><td colspan="5">No data</td></tr>';
}

async function saveRow() {
  const d = $("dDate").value, o = +$('dOffice').value, r = num($("dRow").value), l = Math.max(0, Math.floor(num($("dLab").value)));
  if (d !== today) return $("rowMsg").textContent = "সাধারণ user শুধু আজকের data edit করতে পারবেন। Admin Panel থেকে যেকোনো দিনের data edit করা যাবে।";
  if (!o || r < 0 || l < 0) return $("rowMsg").textContent = "অভিযোগ কেন্দ্র, ROW এবং শ্রমিক সংখ্যা দিন।";
  try {
    const ex = rows.find(x => x.work_date === d && x.office_id === o);
    const body = { work_date: d, office_id: o, row_km: r, labour_count: l, updated_at: new Date().toISOString() };
    await api(ex ? `daily_row_work?id=eq.${ex.id}` : "daily_row_work", { method: ex ? "PATCH" : "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(body) });
    $("rowMsg").textContent = "ROW ও শ্রমিক সংখ্যা সফলভাবে সংরক্ষণ হয়েছে।";
    await load();
  } catch (e) { $("rowMsg").textContent = "Save failed: " + e.message; }
}

function exportExcel() {
  if (!window.XLSX) { alert("Excel library load হয়নি। Internet connection check করুন।"); return; }
  const os = officeStats();
  const s1 = [["Area", "Office", "Target KM", "Completed KM", "Remaining KM", "Progress %", "Labour"], ...os.map(o => [o.area, o.office_name, num(o.target_km), +o.row.toFixed(2), +Math.max(0, num(o.target_km) - o.row).toFixed(2), +pct(o.row, o.target_km).toFixed(2), o.lab])];
  const s2 = [["Date", "Area", "Office", "Daily ROW KM", "Daily Labour"], ...rows.map(r => { const o = offices.find(x => x.id === r.office_id); return [r.work_date, area(o?.office_name), o?.office_name || "", num(r.row_km), num(r.labour_count)]; })];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s1), "Progress Summary");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s2), "Daily ROW + Labour");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
  const createUrl = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL : webkitURL.createObjectURL;
  const revokeUrl = (window.URL && window.URL.revokeObjectURL) ? window.URL.revokeObjectURL : webkitURL.revokeObjectURL;
  
  const a = document.createElement("a");
  a.href = createUrl(blob);
  a.download = "ROW_Report_" + today + ".xlsx";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { revokeUrl(a.href); a.remove(); }, 1000);
}

async function load() {
  try {
    allOffices = await api("offices?select=id,office_name,target_km,active&order=office_name.asc");
    offices = allOffices.filter(o => o.active);
    rows = await api("daily_row_work?select=id,work_date,office_id,row_km,labour_count,created_at,updated_at&order=work_date.desc");
    ["dDate", "lDate", "aDate"].forEach(id => { if ($(id) && !$(id).value)$(id).value = today; });
    render();
  } catch (e) {
    console.error(e);
  }
}

async function adminLogin() {
  const email = $("adminEmail").value.trim(), password = $("adminPass").value;
  if (!email || !password) return $("adminMsg").textContent = "Email ও Password দিন।";
  $("adminMsg").textContent = "Login হচ্ছে...";
  try {
    const r = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", { method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const d = await r.json();
    if (!r.ok) { throw Error(d.error_description || d.msg || "Email বা Password সঠিক নয়।"); }
    accessToken = d.access_token; currentUser = d.user;
    if ($("adminLogin")) $("adminLogin").style.display = "none";
    if ($("adminContent")) $("adminContent").style.display = "block";
    if ($("adminMsg")) $("adminMsg").textContent = "";
    renderAdmin();
  } catch (e) {
    accessToken = null; currentUser = null;
    if ($("adminMsg")) $("adminMsg").textContent = e.message;
  }
}

function renderAdmin() {
  if (!accessToken) return;
  
  const list = (allOffices.length ? allOffices : offices).map(o => ({ ...o, area: area(o.office_name) }));
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
    const dailyRows = rows.filter(r => r.work_date === selectedDate);
    const targetOffices = allOffices.length ? allOffices : offices;

    $("adminDailyBody").innerHTML = targetOffices.map((o, i) => {
      const rowData = dailyRows.find(r => r.office_id === o.id);
      const rowKm = rowData ? rowData.row_km : 0;
      const labourCount = rowData ? rowData.labour_count : 0;

      return `<tr>
        <td>${i + 1}</td>
        <td>${area(o.office_name)}</td>
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
    await api(`offices?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ target_km: target, active }) });
    if ($("adminMsg")) $("adminMsg").textContent = "Target সফলভাবে সংরক্ষণ হয়েছে।";
    await load();
  } catch (e) { if ($("adminMsg")) $("adminMsg").textContent = "Target save failed: " + e.message; }
}

async function saveAdminDailyRow(officeId) {
  if (!accessToken) return;
  const d = $("aDate").value || today;
  const rowInput = document.querySelector(`.adminRowEdit[data-office-id="${officeId}"]`);
  const labInput = document.querySelector(`.adminLabEdit[data-office-id="${officeId}"]`);
  
  const r = num(rowInput ? rowInput.value : 0);
  const l = Math.max(0, Math.floor(num(labInput ? labInput.value : 0)));

  try {
    const ex = rows.find(x => x.work_date === d && x.office_id === +officeId);
    const body = { work_date: d, office_id: +officeId, row_km: r, labour_count: l, updated_at: new Date().toISOString() };
    await api(ex ? `daily_row_work?id=eq.${ex.id}` : "daily_row_work", { method: ex ? "PATCH" : "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(body) });
    if ($("adminDailyMsg")) $("adminDailyMsg").textContent = "ডাটা সফলভাবে আপডেট হয়েছে।";
    await load();
  } catch (e) { 
    if ($("adminDailyMsg")) $("adminDailyMsg").textContent = "Save failed: " + e.message; 
  }
}

async function saveAllAdminDailyRows() {
  if (!accessToken) return;
  const d = $("aDate").value || today;
  const rowInputs = document.querySelectorAll(".adminRowEdit");
  
  if ($("adminDailyMsg")) $("adminDailyMsg").textContent = "সকল অফিসের ডাটা সেভ হচ্ছে...";

  try {
    for (let rowInput of rowInputs) {
      const officeId = +rowInput.dataset.officeId;
      const labInput = document.querySelector(`.adminLabEdit[data-office-id="${officeId}"]`);
      
      const r = num(rowInput.value);
      const l = Math.max(0, Math.floor(num(labInput ? labInput.value : 0)));

      const ex = rows.find(x => x.work_date === d && x.office_id === officeId);
      const body = { work_date: d, office_id: officeId, row_km: r, labour_count: l, updated_at: new Date().toISOString() };
      
      await api(ex ? `daily_row_work?id=eq.${ex.id}` : "daily_row_work", { method: ex ? "PATCH" : "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(body) });
    }
    if ($("adminDailyMsg")) $("adminDailyMsg").textContent = "সকল অফিসের ডাটা একসাথে সফলভাবে সংরক্ষণ হয়েছে!";
    await load();
  } catch (e) {
    if ($("adminDailyMsg")) $("adminDailyMsg").textContent = "Save All failed: " + e.message;
  }
}

function adminLogout() {
  accessToken = null; currentUser = null;
  if ($('adminLogin'))$('adminLogin').style.display = 'block';
  if ($('adminContent'))$('adminContent').style.display = 'none';
}

document.querySelectorAll("nav button,[data-page]").forEach(b => b.addEventListener("click", e => {
  const p = b.dataset.page;
  if (!p || p === 'logout') return;
  document.querySelectorAll(".page").forEach(x => x.classList.remove("active"));
  if ($(p))$(p).classList.add("active");
  document.querySelectorAll("nav button").forEach(x => x.classList.remove("active"));
  const n = document.querySelector(`nav button[data-page="${p}"]`);
  if (n) n.classList.add("active");
}));

if ($("saveRow")) $("saveRow").onclick = saveRow;
if ($("excel")) $("excel").onclick = exportExcel;
if ($("excel2")) $("excel2").onclick = exportExcel;
if ($("adminLoginBtn")) $("adminLoginBtn").onclick = adminLogin;
if ($("adminLogout")) $("adminLogout").onclick = adminLogout;
if ($("adminRefresh")) $("adminRefresh").onclick = () => renderAdmin();

if ($("aDate")) $("aDate").addEventListener("change", () => renderAdmin());
if ($("saveAllAdminBtn")) $("saveAllAdminBtn").onclick = saveAllAdminDailyRows;

if ($("adminOfficeBody")) $("adminOfficeBody").addEventListener("click", e => {
  const b = e.target.closest(".saveTarget");
  if (b) saveTarget(b.dataset.id);
});

if ($("adminDailyBody")) $("adminDailyBody").addEventListener("click", e => {
  const b = e.target.closest(".saveAdminDailyRow");
  if (b) saveAdminDailyRow(b.dataset.officeId);
});

load();