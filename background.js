chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_STREAK") {
    updateStreakData().then(sendResponse);
    return true; 
  }
});

async function updateStreakData() {
  const data = await chrome.storage.local.get(['username', 'pat']);
  const username = data.username;
  const pat = data.pat;
  
  if (!username) return { error: "Unconfigured" };

  let days = [];
  try {
    if (pat && pat.trim() !== "") {
      days = await fetchGraphQL(username, pat.trim());
    } else {
      days = await fetchScraping(username);
    }
  } catch (err) {
    return { error: err.message };
  }

  const streakData = calculateStreak(days);
  
  chrome.action.setBadgeText({ text: streakData.streak.toString() });
  chrome.action.setBadgeBackgroundColor({ 
    color: streakData.hasCommittedToday ? '#58CC02' : '#FF4B4B' 
  });

  return streakData;
}

// 🟢 BULLETPROOF SCRAPER (Ignores tags, just looks for raw data)
async function fetchScraping(username) {
  const res = await fetch(`https://github.com/users/${username}/contributions`);
  if (!res.ok) throw new Error("Could not load GitHub profile.");
  
  const text = await res.text();
  const days = [];
  
  // This looks for ANY HTML element that has a data-date attribute (td, rect, div, etc)
  const matches = [...text.matchAll(/<[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*>/g)];
  
  matches.forEach(match => {
    const entireTag = match[0];
    const date = match[1];
    
    // Checks for data-level, data-tier, or data-count (GitHub changes these randomly)
    const levelMatch = entireTag.match(/data-(?:level|tier|count)="(\d+)"/);
    
    if (levelMatch) {
      days.push({
        date: date,
        count: parseInt(levelMatch[1], 10)
      });
    }
  });

  if (days.length === 0) throw new Error("Calendar not found on GitHub page.");
  return days.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// 🟢 PRIVATE REPO API
async function fetchGraphQL(username, pat) {
  const query = `
    query { 
      user(login: "${username}") { 
        contributionsCollection { 
          contributionCalendar { 
            weeks { contributionDays { contributionCount date } } 
          } 
        } 
      } 
    }
  `;
  
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { 'Authorization': `bearer ${pat}` },
    body: JSON.stringify({ query })
  });
  
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  
  const weeks = json.data.user.contributionsCollection.contributionCalendar.weeks;
  return weeks.flatMap(w => w.contributionDays).map(d => ({
    date: d.date,
    count: d.contributionCount
  })).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// 🟢 MATH ENGINE
function calculateStreak(days) {
  if (!days.length) return { streak: 0, hasCommittedToday: false, longestStreak: 0 };

  const hasCommittedToday = days[0].count > 0;
  let streak = 0;

  // CURRENT Streak
  let startIndex = hasCommittedToday ? 0 : 1;
  for (let i = startIndex; i < days.length; i++) {
    if (days[i].count > 0) streak++;
    else break;
  }

  // LONGEST Streak
  let longestStreak = 0;
  let tempStreak = 0;
  for (let i = 0; i < days.length; i++) {
    if (days[i].count > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  return { streak, hasCommittedToday, longestStreak };
}