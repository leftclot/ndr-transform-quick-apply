// Panel logic. Talks to host.jsx through CEP's built-in evalScript (no CSInterface.js needed).

var FIELDS = ["useScale", "scale", "usePos", "posX", "posY", "useRot", "rot"];
var OLD_STATE_KEY = "transformPresets.fields"; // v1 last-used values, loaded into Set A
var STATE_KEY = "transformPresets.sets";
var PRESETS_KEY = "transformPresets.presets";

function $(id) { return document.getElementById(id); }

// A set is stored without its A/B suffix, so a preset can load into either set.
function readSet(s) {
  var v = {};
  FIELDS.forEach(function (id) {
    var el = $(id + s);
    v[id] = el.type === "checkbox" ? el.checked : el.value;
  });
  return v;
}

function writeSet(s, v) {
  FIELDS.forEach(function (id) {
    if (!(id in v)) return;
    var el = $(id + s);
    if (el.type === "checkbox") el.checked = v[id]; else el.value = v[id];
  });
}

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

function setStatus(msg, isError) {
  $("status").textContent = msg;
  $("status").className = isError ? "err" : "";
}

function refreshPresetList(selected) {
  var presets = load(PRESETS_KEY, {});
  var sel = $("presets");
  sel.innerHTML = '<option value="">Load Preset...</option>';
  Object.keys(presets).sort().forEach(function (name) {
    var opt = document.createElement("option");
    opt.value = opt.textContent = name;
    sel.appendChild(opt);
  });
  sel.value = selected || "";
}

function apply(s) {
  var v = readSet(s);
  if (!v.useScale && !v.usePos && !v.useRot) { setStatus("Tick at least one property in Set " + s + ".", true); return; }
  save(STATE_KEY, { A: readSet("A"), B: readSet("B") });
  var call = "applyTransform(" + [
    v.useScale, Number(v.scale) || 0, v.usePos, Number(v.posX) || 0, Number(v.posY) || 0, v.useRot, Number(v.rot) || 0
  ].join(",") + ")";
  window.__adobe_cep__.evalScript(call, function (result) {
    // host.jsx returns "OK|message" or "ERR|message"
    var parts = String(result).split("|");
    if (parts[0] === "OK") setStatus("Set " + s + ": " + parts.slice(1).join("|"));
    else setStatus(parts.length > 1 ? parts.slice(1).join("|") : "Script error: " + result, true);
  });
}

function savePreset(s) {
  var name = $("presetName").value.trim();
  if (!name) { setStatus("Type a preset name first.", true); return; }
  var presets = load(PRESETS_KEY, {});
  presets[name] = readSet(s);
  save(PRESETS_KEY, presets);
  refreshPresetList(name);
  $("presetName").value = "";
  setStatus("Saved Set " + s + " as \"" + name + "\".");
}

function loadPreset(s) {
  var name = $("presets").value;
  if (!name) { setStatus("Pick a preset to load.", true); return; }
  writeSet(s, load(PRESETS_KEY, {})[name]);
  setStatus("Loaded \"" + name + "\" to Set " + s + ".");
}

// Drag left/right to change a value (Shift = x10); a click without a drag lets you type.
function makeScrubbable(el) {
  el.addEventListener("pointerdown", function (e) {
    if (document.activeElement === el) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    var startX = e.clientX, last = e.clientX, value = Number(el.value) || 0, moved = false;

    function onMove(m) {
      if (Math.abs(m.clientX - startX) > 2) moved = true;
      if (!moved) return;
      value += (m.clientX - last) * (m.shiftKey ? 10 : 1);
      last = m.clientX;
      el.value = Math.round(value * 100) / 100;
    }
    function onUp() {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      if (!moved) { el.focus(); el.select(); }
    }
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
  });
  el.addEventListener("keydown", function (e) { if (e.key === "Enter") el.blur(); });
}

["A", "B"].forEach(function (s) {
  $("apply" + s).onclick = function () { apply(s); };
  $("save" + s).onclick = function () { savePreset(s); };
  $("to" + s).onclick = function () { loadPreset(s); };
});

$("delete").onclick = function () {
  var name = $("presets").value;
  if (!name) { setStatus("Pick a preset to delete.", true); return; }
  var presets = load(PRESETS_KEY, {});
  delete presets[name];
  save(PRESETS_KEY, presets);
  refreshPresetList();
  setStatus("Deleted \"" + name + "\".");
};

Array.prototype.forEach.call(document.querySelectorAll(".val"), makeScrubbable);

var sets = load(STATE_KEY, { A: load(OLD_STATE_KEY, {}), B: {} });
writeSet("A", sets.A);
writeSet("B", sets.B);
refreshPresetList();
