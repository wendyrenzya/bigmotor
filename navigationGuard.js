/* ===========================
   navigationGuard.js (FINAL)
   =========================== */

/*
 Tujuan versi ini:
 - Tidak auto-set UNSAVED untuk setiap input/DOM.
 - Hanya berubah jika halaman memanggil markUnsaved() manual.
 - guardReset() membersihkan status perubahan.
 - Modal konfirmasi tetap ada bila UNSAVED=true.
*/

let UNSAVED = false;

/* ===== API PUBLIC ===== */
window.guardReset = function () {
  UNSAVED = false;
};

window.markUnsaved = function () {
  UNSAVED = true;
};

/* ===== Modal ===== */
function createConfirmModal() {
  if (document.getElementById("confirmOverlay")) return;

  const html =
    '<div id="confirmOverlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:999999;visibility:hidden;opacity:0;transition:opacity .18s;">' +
      '<div style="background:#fff;width:88%;max-width:380px;padding:18px;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,0.22);text-align:center;">' +
        '<div style="font-size:16px;font-weight:700;color:#222;margin-bottom:8px">Perubahan belum disimpan</div>' +
        '<div style="font-size:14px;color:#666;margin-bottom:18px">Yakin ingin keluar dari halaman ini?</div>' +
        '<div style="display:flex;gap:10px;">' +
          '<button id="btnCancelNav" style="flex:1;padding:10px;border-radius:10px;border:none;background:#e6e6e6;color:#222;font-weight:700;">Batalkan</button>' +
          '<button id="btnConfirmNav" style="flex:1;padding:10px;border-radius:10px;border:none;background:#ff8a00;color:#fff;font-weight:700;">Keluar</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  document.body.insertAdjacentHTML("beforeend", html);
}

createConfirmModal();

/* Show modal */
function showConfirm(callback) {
  const ov = document.getElementById("confirmOverlay");
  ov.style.visibility = "visible";
  ov.style.opacity = "1";

  document.getElementById("btnCancelNav").onclick = function () {
    ov.style.opacity = "0";
    setTimeout(() => ov.style.visibility = "hidden", 180);
  };

  document.getElementById("btnConfirmNav").onclick = function () {
    ov.style.opacity = "0";
    setTimeout(() => ov.style.visibility = "hidden", 180);
    UNSAVED = false;
    if (callback) callback();
  };
}

/* ===== Navigation ===== */
function guardedNavigate(url) {
  if (!url) return;
  if (!UNSAVED) {
    location.href = url;
    return;
  }
  showConfirm(() => location.href = url);
}

window.guardedNavigate = guardedNavigate;

/* ===== Read target helper ===== */
function extractTarget(el) {
  const oc = el.getAttribute("onclick") || "";

  const m1 = oc.match(/navTo\('(.+?)'/);
  if (m1) return m1[1];

  const m2 = oc.match(/go\('(.+?)'/);
  if (m2) return m2[1];

  if (el.dataset && el.dataset.target) return el.dataset.target;

  return null;
}

/* ===== Navbar ===== */
function hookNavbar() {
  const items = document.querySelectorAll(".nav-item");
  items.forEach(item => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const t = extractTarget(item);
      if (t) guardedNavigate(t);
    });
  });
}

/* ===== FAB ===== */
function hookFAB() {
  const fab = document.querySelector(".fab-home");
  if (!fab) return;

  fab.addEventListener("click", function (e) {
    e.preventDefault();
    const t = extractTarget(fab);
    if (t) guardedNavigate(t);
  });
}

/* ===== Back button ===== */
window.addEventListener("popstate", function (e) {
  if (UNSAVED) {
    e.preventDefault();
    showConfirm(() => history.back());
    history.pushState(null, "", location.href);
  }
});

/* ===== Init ===== */
document.addEventListener("DOMContentLoaded", function () {
  history.pushState(null, "", location.href);
  hookFAB();
  hookNavbar();
});  var t = extractTarget(fab);
    if (t) guardedNavigate(t);
  });
}

/* Navbar */
function hookNavbar() {
  var items = document.querySelectorAll(".nav-item");
  items.forEach(function(item){
    item.addEventListener("click", function(e){
      e.preventDefault();
      var t = extractTarget(item);
      if (t) guardedNavigate(t);
    });
  });
}

/* Popstate (back button) */
window.addEventListener("popstate", function(e){
  if (UNSAVED) {
    e.preventDefault();
    showConfirm(() => history.back());
    history.pushState(null, "", location.href);
  }
});

/* Init */
document.addEventListener("DOMContentLoaded", function(){
  history.pushState(null, "", location.href);
  hookFAB();
  hookNavbar();
});