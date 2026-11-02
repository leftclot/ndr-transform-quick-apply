// Panel logic. Talks to host.jsx through CEP's built-in evalScript (no CSInterface.js needed).

var FIELDS = ["useScale", "scale", "usePos", "posX", "posY", "useRot", "rot"];
var STATE_KEY = "transformPresets.fields";
var PRESETS_KEY = "transformPresets.presets";

function $(id) { return document.getElementById(id); }

function readFields() {
  var v = {};
  FIELDS.forEach(function (id) {
    var el = $(id);
    v[id] = el.type === "checkbox" ? el.checked : el.value;
  });
  return v;
}

function writeFields(v) {
  FIELDS.forEach(function (id) {
    if (!(id in v)) return;
    var el = $(id);
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
  sel.innerHTML = '<option value="">Presets...</option>';
  Object.keys(presets).sort().forEach(function (name) {
    var opt = document.createElement("option");
    opt.value = opt.textContent = name;
    sel.appendChild(opt);
  });
  sel.value = selected || "";
}

function num(id) { return Number($(id).value) || 0; }

function apply() {
  var v = readFields();
  if (!v.useScale && !v.usePos && !v.useRot) { setStatus("Tick at least one property.", true); return; }
  save(STATE_KEY, v);
  var call = "applyTransform(" + [
    v.useScale, num("scale"), v.usePos, num("posX"), num("posY"), v.useRot, num("rot")
  ].join(",") + ")";
  window.__adobe_cep__.evalScript(call, function (result) {
    // host.jsx returns "OK|message" or "ERR|message"
    var parts = String(result).split("|");
    if (parts[0] === "OK") setStatus(parts.slice(1).join("|"));
    else setStatus(parts.length > 1 ? parts.slice(1).join("|") : "Script error: " + result, true);
  });
}

$("apply").onclick = apply;

$("presets").onchange = function () {
  var p = load(PRESETS_KEY, {})[this.value];
  if (p) { writeFields(p); $("presetName").value = this.value; setStatus("Loaded \"" + this.value + "\"."); }
};

$("save").onclick = function () {
  var name = $("presetName").value.trim();
  if (!name) { setStatus("Type a preset name first.", true); return; }
  var presets = load(PRESETS_KEY, {});
  presets[name] = readFields();
  save(PRESETS_KEY, presets);
  refreshPresetList(name);
  setStatus("Saved \"" + name + "\".");
};

$("delete").onclick = function () {
  var name = $("presets").value;
  if (!name) { setStatus("Pick a preset to delete.", true); return; }
  var presets = load(PRESETS_KEY, {});
  delete presets[name];
  save(PRESETS_KEY, presets);
  refreshPresetList();
  $("presetName").value = "";
  setStatus("Deleted \"" + name + "\".");
};

writeFields(load(STATE_KEY, {}));
refreshPresetList();
