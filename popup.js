document.addEventListener("DOMContentLoaded", async () => {
  const mainView = document.getElementById("main-view");
  const settingsView = document.getElementById("settings-view");
  const userIn = document.getElementById("username");
  const patIn = document.getElementById("pat");
  const notifyIn = document.getElementById("notify-toggle");
  
  const config = await chrome.storage.local.get(['username', 'pat', 'notifyEnabled']);
  
  if (config.username) {
    userIn.value = config.username;
    patIn.value = config.pat || '';
    notifyIn.checked = config.notifyEnabled || false;
    loadMainView(config.username);
  }

  document.getElementById("settings-btn").addEventListener("click", () => {
    mainView.classList.add("hidden");
    settingsView.classList.remove("hidden");
  });

  document.getElementById("save-btn").addEventListener("click", async () => {
    const username = userIn.value.trim();
    if (!username) return;

    await chrome.storage.local.set({
      username: username,
      pat: patIn.value.trim(),
      notifyEnabled: notifyIn.checked
    });
    
    loadMainView(username);
  });
});

function loadMainView(username) {
  document.getElementById("settings-view").classList.add("hidden");
  document.getElementById("main-view").classList.remove("hidden");
  document.getElementById("user-display").innerText = `@${username}`;

  chrome.runtime.sendMessage({ type: "GET_STREAK" }, (res) => {
    const status = document.getElementById("status-bar");
    
    if (chrome.runtime.lastError || !res) {
      status.innerText = "App offline 💤";
      status.className = "stat-value status-risk";
      return;
    }

    if (res.error) {
      status.innerText = "User not found 🤔";
      status.className = "stat-value status-risk";
      return;
    }

    // Insert Values
    document.getElementById("streak-val").innerText = res.streak;
    document.getElementById("longest-streak").innerText = res.longestStreak;
    
    const flame = document.getElementById("flame-container");
    flame.className = res.hasCommittedToday ? "active" : "inactive";
    
    // Short, punchy English motivations
    let motivation = "";
    if (res.streak > 30) {
      motivation = "Unstoppable! 🤯";
    } else if (res.streak > 14) {
      motivation = "Machine! 🤖";
    } else if (res.streak > 3) {
      motivation = "On fire! 🔥";
    } else if (res.streak > 0) {
      motivation = "Looking good! 💪";
    } else {
      motivation = "Time to code! 💻";
    }
    
    if (res.hasCommittedToday) {
      status.innerText = motivation;
      status.className = "stat-value status-safe";
    } else {
      // If no commit today, check if there is an active streak to lose
      status.innerText = res.streak > 0 ? "At risk! ⚠️" : "Time to code! 💻";
      status.className = "stat-value status-risk";
    }
  });
}