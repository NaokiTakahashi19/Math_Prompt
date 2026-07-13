(function () {
  function formatTimestamp(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join('-') + ' ' + [pad(date.getHours()), pad(date.getMinutes())].join(':');
  }

  function setUpdatedBadges() {
    const timestamp = formatTimestamp(document.lastModified);
    document.querySelectorAll('[data-app-updated]').forEach((node) => {
      node.textContent = timestamp ? `更新: ${timestamp}` : '更新日時不明';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setUpdatedBadges);
  } else {
    setUpdatedBadges();
  }
})();
