const BACKEND_URL = "http://localhost:3000";

// 🌐 Navigate to Topics Page
function goToTopics(language) {
  window.location.href = `topics.html?language=${language}`;
}

let allTopics = [];
let filteredByLanguage = [];

// 🧩 Fetch all topics from backend
async function fetchTopics() {
  const res = await fetch(`${BACKEND_URL}/api/topics`);
  return await res.json();
}

// 🧩 Fetch learning list
async function fetchLearningList() {
  const res = await fetch(`${BACKEND_URL}/api/learning`);
  return await res.json();
}

// 🧩 Initialize page
async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const language = urlParams.get("language");
  allTopics = await fetchTopics();

  filteredByLanguage = language
    ? allTopics.filter(t => t.language === language)
    : allTopics;

  const languageTitle = document.getElementById("language-title");
  if (languageTitle)
    languageTitle.textContent = `${language || "All"} Topics`;

  renderTopics(filteredByLanguage);
  renderLearningList();
}

// 🧠 Render topics
function renderTopics(list) {
  const topicList = document.getElementById("topic-list");
  if (!topicList) return;

  topicList.innerHTML = "";
  list.forEach(topic => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img src="${topic.image}" alt="${topic.name}">
      <p><strong>${topic.name}</strong></p>
      <p>Language: ${topic.language}</p>
      <p>Difficulty: ${topic.difficulty}</p>
      <button onclick="addToLearningList('${topic.name}', '${topic.difficulty}', '${topic.image}', '${topic.language}')">
        Add to My List
      </button>
    `;
    topicList.appendChild(div);
  });
}

// 🧭 Sorting + filtering
function sortTopics() {
  const v = document.getElementById("sort-select").value;
  if (v === "name") filteredByLanguage.sort((a, b) => a.name.localeCompare(b.name));
  if (v === "difficulty-asc") filteredByLanguage.sort((a, b) => a.cost - b.cost);
  if (v === "difficulty-desc") filteredByLanguage.sort((a, b) => b.cost - a.cost);
  renderTopics(filteredByLanguage);
}

function filterTopics() {
  const v = document.getElementById("filter-select").value;
  filteredByLanguage =
    v === "all" ? allTopics : allTopics.filter(t => t.category === v);
  renderTopics(filteredByLanguage);
}

// 🧾 Add topic to learning list
async function addToLearningList(name, difficulty, image, language) {
  await fetch(`${BACKEND_URL}/api/learning/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, difficulty, image, language })
  });
  renderLearningList();
}

// 🔁 Decrement/remove topic
async function decrementTopic(name) {
  await fetch(`${BACKEND_URL}/api/learning/decrement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  renderLearningList();
}

// 📘 Render My Learning List
async function renderLearningList() {
  const list = await fetchLearningList();
  const table = document.getElementById("learning-items");
  if (!table) return;

  table.innerHTML = "";
  if (list.length === 0) {
    table.innerHTML = `<tr><td colspan="6">📘 No topics added yet</td></tr>`;
    return;
  }

  list.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${item.image}" class="cart-img"></td>
      <td>${item.name}</td>
      <td>${item.language || "-"}</td>
      <td>${item.totalDifficulty}</td>
      <td>${item.status || "In Progress"}</td>
    `;
    row.addEventListener("click", () => decrementTopic(item.name));
    table.appendChild(row);
  });
}

window.onload = init;
