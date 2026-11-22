const CONFIG = {
  WEBHOOK_URL: "https://hashirm.app.n8n.cloud/webhook/interview-request",
  COMPANY: " MW Software House"
};
const $ = id => document.getElementById(id);
$("companyName").textContent = CONFIG.COMPANY;
$("logoMark").textContent = CONFIG.COMPANY.trim().charAt(0).toUpperCase();
document.title = "Book your interview | " + CONFIG.COMPANY;
const demo = CONFIG.WEBHOOK_URL.indexOf("PASTE_") === 0;
const form = $("form"), btn = $("btn"), banner = $("banner");
$("notes").addEventListener("input", e => { $("cnt").textContent = e.target.value.length; });
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneOk = v => { const d = v.replace(/\D/g, ""); return d.length >= 10 && d.length <= 15 && /^[+\d\s\-()]+$/.test(v); };
const urlOk = v => v === "" || /^https?:\/\/\S+\.\S+/i.test(v);
const rules = {
  fullName: v => v.trim().length >= 2,
  email: v => emailOk(v.trim()),
  phone: v => phoneOk(v.trim()),
  position: v => v !== "",
  experience: v => v !== "",
  resume: v => urlOk(v.trim()),
  linkedin: v => urlOk(v.trim())
};
function check(id) {
  const el = $(id), ok = rules[id](el.value);
  el.closest(".field").classList.toggle("bad", !ok);
  el.setAttribute("aria-invalid", String(!ok));
  return ok;
}
Object.keys(rules).forEach(id => {
  $(id).addEventListener("blur", () => check(id));
  $(id).addEventListener("input", () => { if ($(id).closest(".field").classList.contains("bad")) check(id); });
});
$("consent").addEventListener("change", () => { $("consentErr").style.display = $("consent").checked ? "none" : "block"; });
function setLoading(on) {
  btn.disabled = on; btn.classList.toggle("loading", on);
  $("btnText").textContent = on ? "Sending..." : "Get my interview times";
}
function showError(msg) { banner.className = "banner error"; banner.textContent = msg; }
form.addEventListener("submit", async e => {
  e.preventDefault();
  banner.className = "banner"; banner.textContent = "";
  const results = Object.keys(rules).map(check);
  const consent = $("consent").checked;
  $("consentErr").style.display = consent ? "none" : "block";
  if (!results.every(Boolean) || !consent) {
    const first = document.querySelector(".field.bad input, .field.bad select");
    if (first) first.focus();
    return;
  }
  const payload = {
    fullName: $("fullName").value.trim(), email: $("email").value.trim(), phone: $("phone").value.trim(),
    position: $("position").value, experience: $("experience").value,
    resume: $("resume").value.trim(), linkedin: $("linkedin").value.trim(), notes: $("notes").value.trim(),
    consent: true, website: $("website").value, submittedAt: new Date().toISOString()
  };
  setLoading(true);
  try {
    if (demo) { await new Promise(r => setTimeout(r, 900)); }
    else {
      const res = await fetch(CONFIG.WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Server replied " + res.status);
    }
    $("doneEmail").textContent = payload.email;
    $("shell").classList.add("show-done");
    if (demo) console.info("Demo mode: set CONFIG.WEBHOOK_URL to send real requests.");
  } catch (err) {
    showError("Sorry, something went wrong. Please check your internet connection and try again.");
    console.error(err);
  } finally { setLoading(false); }
});
$("again").addEventListener("click", () => { form.reset(); $("cnt").textContent = "0"; $("shell").classList.remove("show-done"); });