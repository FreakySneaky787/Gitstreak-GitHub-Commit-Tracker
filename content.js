chrome.runtime.sendMessage({ type: "GET_STREAK" }, (response) => {
  // Catch errors so we don't accidentally break the GitHub page
  if (chrome.runtime.lastError || !response || response.error) return;

  const { streak, hasCommittedToday } = response;
  const iconColor = hasCommittedToday ? '#FF9600' : '#AFB2BA';
  const borderColor = hasCommittedToday ? '#E5E5E5' : '#E5E5E5';

  const widget = document.createElement('div');
  widget.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 14px;
    border-radius: 20px;
    background: #FFFFFF;
    border: 2px solid ${borderColor};
    border-bottom: 4px solid ${borderColor};
    font-family: -apple-system, system-ui, sans-serif;
    font-weight: 800;
    font-size: 14px;
    margin-right: 12px;
    color: #4B4B4B;
    z-index: 9999;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    cursor: pointer;
    transition: transform 0.1s;
  `;
  
  widget.onmousedown = () => widget.style.transform = 'translateY(2px)';
  widget.onmouseup = () => widget.style.transform = 'translateY(0)';
  
  widget.innerHTML = `<span style="font-size: 16px; filter: drop-shadow(0 2px 4px rgba(255,150,0,0.3)); ${!hasCommittedToday ? 'filter: grayscale(100%);' : ''}">🔥</span> <span>${streak}</span>`;

  const userNav = document.querySelector('.AppHeader-user') || document.querySelector('.Header-item:last-child');
  
  if (userNav && userNav.parentNode) {
    userNav.parentNode.insertBefore(widget, userNav);
  } else {
    widget.style.position = 'fixed';
    widget.style.bottom = '24px';
    widget.style.right = '24px';
    document.body.appendChild(widget);
  }
});