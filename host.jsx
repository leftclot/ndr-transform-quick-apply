// ExtendScript (ES3) side. Loaded by the manifest's ScriptPath; called from main.js.
// Returns "OK|message" or "ERR|message".

function findByName(collection, name) {
    for (var i = 0; i < collection.numItems; i++) {
        if (collection[i].displayName === name) return collection[i];
    }
    return null;
}

function applyTransform(useScale, scale, usePos, x, y, useRot, rot) {
    try {
        var seq = app.project.activeSequence;
        if (!seq) return "ERR|No active sequence.";

        var selection = seq.getSelection();
        var clips = [];
        for (var i = 0; i < selection.length; i++) {
            if (selection[i].mediaType === "Video") clips.push(selection[i]);
        }
        if (clips.length === 0) return "ERR|Select one or more video clips in the timeline.";

        // Premiere stores Position as a fraction of the frame size.
        var pos = [x / seq.frameSizeHorizontal, y / seq.frameSizeVertical];
        var changes = [];
        if (useScale) changes.push({ name: "Scale", value: scale });
        if (usePos) changes.push({ name: "Position", value: pos });
        if (useRot) changes.push({ name: "Rotation", value: rot });

        var applied = 0, skipped = [];
        for (var c = 0; c < clips.length; c++) {
            var motion = findByName(clips[c].components, "Motion");
            if (!motion) { skipped.push(clips[c].name + " (no Motion)"); continue; }
            for (var k = 0; k < changes.length; k++) {
                var prop = findByName(motion.properties, changes[k].name);
                if (!prop) { skipped.push(clips[c].name + " " + changes[k].name + " (not found)"); continue; }
                // Don't overwrite animation: keyframed properties are skipped.
                if (prop.isTimeVarying()) { skipped.push(clips[c].name + " " + changes[k].name + " (keyframed)"); continue; }
                prop.setValue(changes[k].value, true);
            }
            applied++;
        }

        var msg = "Applied to " + applied + " clip" + (applied === 1 ? "" : "s") + ".";
        if (skipped.length) msg += " Skipped: " + skipped.join(", ");
        return "OK|" + msg;
    } catch (e) {
        return "ERR|" + e.toString();
    }
}
