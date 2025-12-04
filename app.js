/* ============================================
   GLOBAL CONFIG
   (patched full app.js)
   Source base: original app.js in project. 3
============================================ */

/* ============================================
   GLOBAL CONFIG
============================================ */
const API_BASE = "https://api.bigmotor.biz.id";

/* ============================================
   LOADING WRAPPER (Spinner)
============================================ */
async function fetchWithLoading(url, options){
  if (window.showLoading) window.showLoading();
  try {
    return await fetch(url, options);
  } finally {
    if (window.hideLoading) window.hideLoading();
  }
}

/* ============================================
   API HELPERS
============================================ */
async function apiGET(path){
  const r = await fetchWithLoading(API_BASE + path);
  return await r.json();
}

async function apiPOST(path, body){
  const r = await fetchWithLoading(API_BASE + path, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body)
  });
  // try to parse JSON robustly
  try {
    return await r.json();
  } catch(e){
    // fallback: return text
    try { return { rawText: await r.text() }; } catch(e2){ return {}; }
  }
}

async function apiPUT(path, body){
  const r = await fetchWithLoading(API_BASE + path, {
    method: "PUT",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body)
  });
  try {
    return await r.json();
  } catch(e){
    try { return { rawText: await r.text() }; } catch(e2){ return {}; }
  }
}

async function apiDELETE(path){
  const r = await fetchWithLoading(API_BASE + path, {method:"DELETE"});
  try {
    return await r.json();
  } catch(e){
    try { return { rawText: await r.text() }; } catch(e2){ return {}; }
  }
}

/* ============================================
   SETTINGS (Custom Message)
============================================ */
async function getSettings(){
  try{
    const r = await apiGET("/api/settings");
    return r.settings || r || {};
  }catch(e){
    return {};
  }
}

/* ============================================
   BARANG
============================================ */
async function getBarang(){
  const r = await apiGET("/api/barang");
  return r.items || [];
}
async function getBarangById(id){
  const r = await apiGET(`/api/barang/${id}`);
  return r.item || null;
}
/* original update helper (kept) */
async function addBarang_original(item){
  return await apiPOST("/api/barang", item);
}
async function updateBarangAPI(id, updateObj){
  return await apiPUT(`/api/barang/${id}`, updateObj);
}
async function deleteBarangAPI(id){
  return await apiDELETE(`/api/barang/${id}`);
}

/* ============================================
   Robust addBarang (PATCH)
   - returns parsed response and ALWAYS sets _newId (string|null)
============================================ */

/**
 * Extract candidate id from various backend response shapes
 * @param {object} jr  parsed JSON response
 * @returns {string|null}
 */
function extractCreatedId(jr){
  if(!jr) return null;

  // if primitive number/string
  if(typeof jr === "number") return String(jr);
  if(typeof jr === "string" && /^\d+$/.test(jr)) return jr;

  // direct fields
  if(jr.id) return String(jr.id);
  if(jr.insertId) return String(jr.insertId);
  if(jr.insert_id) return String(jr.insert_id);
  if(jr.newId) return String(jr.newId);
  if(jr.new_id) return String(jr.new_id);

  // nested common shapes
  if(jr.data){
    if(jr.data.id) return String(jr.data.id);
    if(jr.data.insertId) return String(jr.data.insertId);
    if(jr.data.newId) return String(jr.data.newId);
  }
  if(jr.item){
    if(jr.item.id) return String(jr.item.id);
    if(jr.item.insertId) return String(jr.item.insertId);
  }
  if(jr.created){
    if(jr.created.id) return String(jr.created.id);
    if(jr.created.insertId) return String(jr.created.insertId);
  }
  // arrays
  if(Array.isArray(jr) && jr.length){
    const first = jr[0];
    if(first && (first.id || first.insertId || first.insert_id)) return String(first.id || first.insertId || first.insert_id);
  }

  // try to find numeric-looking value in top-level keys (safe fallback)
  for(const k of Object.keys(jr)){
    const v = jr[k];
    if((typeof v === "number" || typeof v === "string") && String(v).match(/^\d+$/)) return String(v);
  }

  return null;
}

/**
 * addBarang: post to /api/barang and return parsed response,
 * but always include _newId (string|null) so callers can use it reliably.
 */
async function addBarang(item){
  const jr = await apiPOST("/api/barang", item);
  const newid = extractCreatedId(jr);
  try{ jr._newId = newid; }catch(e){}
  return jr;
}

/* ============================================
   KATEGORI
============================================ */
async function getKategori(){
  const r = await apiGET("/api/kategori");
  return r.categories || [];
}

/* ============================================
   DUCK IMAGE (opsional)
============================================ */
async function fetchDuckImageAPI(keyword){
  const r = await apiGET(`/api/duckimg?q=${encodeURIComponent(keyword)}`);
  return r.image || "";
}

/* ============================================
   KODE BARANG AUTO
============================================ */
async function generateKodeBarang(){
  const items = await getBarang();
  const maxId = items.length
    ? Math.max(...items.map(i => Number(i.kode_barang || 0)))
    : 0;
  const next = maxId + 1;
  return String(next).padStart(5, "0");
}

/* ============================================
   TOAST
============================================ */
function showToast(msg, ms = 2000){
  let t = document.getElementById("__gm_toast");
  if(!t){
    t = document.createElement("div");
    t.id = "__gm_toast";
    Object.assign(t.style, {
      position:"fixed",
      left:"50%", transform:"translateX(-50%)",
      bottom:"90px",
      padding:"10px 14px",
      borderRadius:"10px",
      background:"#111", color:"#fff",
      zIndex:9999, opacity:0.95,
      fontWeight:"700"
    });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(()=> t.style.display="none", ms);
}

/* ============================================
   NAVIGATION GUARD
============================================ */
window.guardedNavigate = function(url){
  if(window.unsavedChanges){
    if(!confirm("Ada perubahan belum disimpan. Lanjutkan?")) return;
    window.unsavedChanges = false;
  }
  window.location.href = url;
};

window.unsavedChanges = false;
window.addEventListener("beforeunload", e=>{
  if(window.unsavedChanges){
    e.preventDefault();
    e.returnValue = '';
  }
});

/* ============================================
   AUDIT: helper to submit audit log to API
   - this is used by audit.html (when saving) to ensure
     audit entries are sent to backend so riwayat can show them.
============================================ */
async function submitAuditLog(id_barang, stok_lama, stok_baru, dibuat_oleh="Admin", meta = {}){
  // meta optional: allow passing keterangan or other fields
  const payload = Object.assign({
    id_barang,
    stok_lama,
    stok_baru,
    dibuat_oleh,
    created_at: new Date().toISOString()
  }, meta);

  // We post to /api/audit — backend should record audit row and/or write into riwayat table.
  try{
    const res = await apiPOST("/api/audit", payload);
    // return parsed response
    return res;
  }catch(e){
    // swallow but return error shape
    return { ok:false, error: String(e) };
  }
}

/* ============================================
   END OF FILE
============================================ */