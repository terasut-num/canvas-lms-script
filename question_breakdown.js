(() => {
  const normalizeWS = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const toNumber = (text) => {
    const m = String(text ?? "").match(/(\d+)/);
    return m ? Number(m[1]) : 0;
  };
  const sanitizeForFull = (answerText) =>
    String(answerText ?? "").replaceAll(":", "-").replaceAll(";", "-");

  const section = document.querySelector("#question-statistics-section") || document;
  const questionBoxes = Array.from(section.querySelectorAll(".question-statistics.content-box"));

  if (!questionBoxes.length) {
    console.warn("No .question-statistics.content-box found. Try scrolling to load content or check selectors.");
    window.__qb = { csv: "", rows: [], questionBoxes: [] };
    return;
  }

  const rows = [];

  for (const box of questionBoxes) {
    // Question no. from <h3 class="screenreader-only">Question 1</h3>
    const h3 = box.querySelector(".question-top-left header h3.screenreader-only");
    const qNoText = normalizeWS(h3?.textContent); // "Question 1"
    const qNoMatch = qNoText.match(/Question\s*(\d+)/i);
    const qNoLabel = qNoMatch ? `Question ${Number(qNoMatch[1])}` : (qNoText || "");

    // Question
    const question = normalizeWS(box.querySelector(".question-text")?.textContent);

    // Discrimination Index
    const diRaw = normalizeWS(box.querySelector(".discrimination-index-section em.index")?.textContent)
      .replace("+", "");
    const discriminationIndex = diRaw ? Number(diRaw) : "";

    // Answers + respondents
    const answerTrs = Array.from(box.querySelectorAll("table.answer-drilldown-table tbody tr"));
    const answers = [];
    const counts = [];
    let correctAnswer = "";

    for (const tr of answerTrs) {
      const ansText = normalizeWS(tr.querySelector("span.answerText")?.textContent);

      const btnText = normalizeWS(tr.querySelector("td.respondent-link button")?.textContent);
      const respondentCount = toNumber(btnText);

      answers.push(ansText);
      counts.push(respondentCount);

      // Correct Answer extraction (rule 1)
      const srOnly = normalizeWS(tr.querySelector("span.screenreader-only")?.textContent);
      if (srOnly.includes("(Correct answer)")) {
        correctAnswer = srOnly.split(", (Correct answer)")[0].trim();
      }
    }

    while (answers.length < 5) answers.push("");
    while (counts.length < 5) counts.push(0);

    const [a, b, c, d, e] = answers.slice(0, 5);
    const [na, nb, nc, nd, ne] = counts.slice(0, 5);

    // Full Question and Answer formatting (rule 2 + 3)
    const fullQA =
      `${question}` +
      `\n:` + sanitizeForFull(a) +
      `\n;` + sanitizeForFull(b) +
      `\n;` + sanitizeForFull(c) +
      `\n;` + sanitizeForFull(d) +
      `\n;` + sanitizeForFull(e);

    rows.push([
      qNoLabel,
      question,
      a, b, c, d, e,
      correctAnswer,
      na, nb, nc, nd, ne,
      discriminationIndex,
      fullQA
    ]);
  }

  const header = [
    "Question no.",
    "Question",
    "Answer A",
    "Answer B",
    "Answer C",
    "Answer D",
    "Answer E",
    "Correct Answer",
    "No. of people in Choice A",
    "No. of people in Choice B",
    "No. of people in Choice C",
    "No. of people in Choice D",
    "No. of people in Choice E",
    "Discrimination Index",
    "Full Question and Answer"
  ];

  const csv =
    header.map(csvEscape).join(",") + "\n" +
    rows.map(r => r.map(csvEscape).join(",")).join("\n");

  // Save for debugging in console
  window.__qb = { csv, rows, questionBoxes };

  // Download CSV
  try {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "question_breakdown.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    console.log("✅ Download started: question_breakdown.csv");
  } catch (e) {
    console.warn("⚠️ Could not auto-download CSV:", e);
  }
})();
