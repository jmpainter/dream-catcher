
function getLatestDreams(callback) {
  setTimeout(() => callback(MOCK_LATEST_DREAMS), 100);
}

function getLatestDreams(data) {
  
}

function getAndDisplayLatestDreams() {
  getLatestDreams(displayLatestDreams);
}

function startApp() {
  getAndDisplayLatestDreams();
}
$(startApp);