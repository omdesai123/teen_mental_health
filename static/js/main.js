/* ── Range slider live output ────────────────────────────────────────────── */
document.querySelectorAll("input[type=range]").forEach(slider => {
  const out = document.getElementById(slider.id + "_out");
  if (out) {
    slider.addEventListener("input", () => { out.value = slider.value; });
  }
});

/* ── Toggle button groups ────────────────────────────────────────────────── */
document.querySelectorAll(".btn-group").forEach(group => {
  const hiddenInput = document.getElementById(group.id.replace("_group", ""));
  group.querySelectorAll(".tog").forEach(btn => {
    btn.addEventListener("click", () => {
      group.querySelectorAll(".tog").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (hiddenInput) hiddenInput.value = btn.dataset.val;
    });
  });
});

/* ── Multi-step navigation ───────────────────────────────────────────────── */
function goTo(step) {
  document.querySelectorAll(".form-section").forEach((s, i) => {
    s.classList.toggle("active", i + 1 === step);
  });
  document.querySelectorAll(".step").forEach((s, i) => {
    s.classList.toggle("active", i + 1 === step);
  });
}

/* ── Collect form values ─────────────────────────────────────────────────── */
function collectFormData() {
  const get = id => parseFloat(document.getElementById(id).value);
  return {
    age:                      get("age"),
    gender:                   get("gender"),
    daily_social_media_hours: get("daily_social_media_hours"),
    platform_usage:           get("platform_usage"),
    sleep_hours:              get("sleep_hours"),
    screen_time_before_sleep: get("screen_time_before_sleep"),
    academic_performance:     get("academic_performance"),
    physical_activity:        get("physical_activity"),
    social_interaction_level: get("social_interaction_level"),
    anxiety_level:            get("anxiety_level"),
    addiction_level:          get("addiction_level"),
    depression_label:         get("depression_label"),
  };
}

/* ── Animate SVG ring ────────────────────────────────────────────────────── */
const CIRCUMFERENCE = 515.2; // 2π × 82

function animateRing(score, colour) {
  const ring = document.getElementById("ringFill");
  const fraction = score / 10;
  const offset = CIRCUMFERENCE * (1 - fraction);
  ring.style.stroke = colour;
  // Force reflow so transition fires
  ring.style.strokeDashoffset = CIRCUMFERENCE;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ring.style.strokeDashoffset = offset;
    });
  });
}

/* ── Render probability bars ─────────────────────────────────────────────── */
const SCORE_COLOURS = {
  1: "#22c55e", 2: "#4ade80", 3: "#86efac", 4: "#fbbf24", 5: "#f97316",
  6: "#ef4444", 7: "#dc2626", 8: "#b91c1c", 9: "#991b1b", 10: "#7f1d1d"
};

function renderProbBars(probDist) {
  const container = document.getElementById("probBars");
  container.innerHTML = "";
  const maxProb = Math.max(...probDist.map(d => d.prob));
  probDist.forEach((d, idx) => {
    const row = document.createElement("div");
    row.className = "prob-row";
    row.innerHTML = `
      <span class="prob-score-lbl">${d.score}</span>
      <div class="prob-track">
        <div class="prob-fill" id="pf${d.score}"
             style="background:${SCORE_COLOURS[d.score] || '#64748b'}"></div>
      </div>
      <span class="prob-pct">${d.prob}%</span>`;
    container.appendChild(row);
  });
  // Animate widths after a tick
  setTimeout(() => {
    probDist.forEach(d => {
      const el = document.getElementById("pf" + d.score);
      if (el) el.style.width = (d.prob / maxProb * 100) + "%";
    });
  }, 60);
}

/* ── Render recommendations ──────────────────────────────────────────────── */
function renderRecs(recs) {
  const list = document.getElementById("recsList");
  list.innerHTML = "";
  recs.forEach((r, i) => {
    const li = document.createElement("li");
    li.textContent = r;
    li.style.animationDelay = `${i * 0.12}s`;
    list.appendChild(li);
  });
}

/* ── Show result panel ───────────────────────────────────────────────────── */
function showResult(data) {
  document.getElementById("mhForm").hidden = true;
  document.getElementById("resultPanel").hidden = false;

  document.getElementById("scoreNum").textContent   = data.score;
  document.getElementById("scoreLabel").textContent = data.label;
  document.getElementById("scoreConf").textContent  = `${data.confidence}% confidence`;

  animateRing(data.score, data.colour);
  renderProbBars(data.prob_dist);
  renderRecs(data.recommendations);
}

/* ── Reset ───────────────────────────────────────────────────────────────── */
function resetForm() {
  document.getElementById("resultPanel").hidden = true;
  document.getElementById("mhForm").hidden = false;
  goTo(1);
}

/* ── Form submit ─────────────────────────────────────────────────────────── */
document.getElementById("mhForm").addEventListener("submit", async e => {
  e.preventDefault();

  const btn     = document.getElementById("submitBtn");
  const btnText = btn.querySelector(".btn-text");
  const spinner = btn.querySelector(".btn-spinner");
  btn.disabled  = true;
  btnText.hidden = true;
  spinner.hidden = false;

  try {
    const payload = collectFormData();
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Server error");
    }

    const data = await res.json();
    showResult(data);

  } catch (err) {
    alert("Something went wrong: " + err.message);
  } finally {
    btn.disabled   = false;
    btnText.hidden = false;
    spinner.hidden = true;
  }
});
