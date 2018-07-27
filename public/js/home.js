function initRecentDreams() {
  getAndDisplayLatestDreams();
  handleDreamClick();
  handleLoginClick();
  handleRegisterClick();
  handleLogoClick();
  handleLogoutClick();
  handleHomeClick();
  handleDreamJournalClick();
  handleGetStartedClick();
}

function getLatestDreams(callback) {
  $.getJSON(API_URL + '/dreams', callback);
}

function displayLatestDreams(data) {
  appState.latestDreams = data.dreams;
  $('main').prop('hidden', false);

  let htmlString = '';

  appState.latestDreams.forEach(dream => {
    htmlString += `
      <div class="flex-col" data-dream-id="${dream._id}">
        <img class="dream-icon" src="img/dream-icon${Math.floor(Math.random() * 100) + 1}.svg">
        <div class="home-dream-details">
          <p class="home-title"><a href="javascript:void(0)">${dream.title}</a></p>
          <p class="home-author">by ${dream.author.screenName || dream.author.username}</p>
          <p class="home-publish-date">${new Date(dream.publishDate).toDateString()}</p>
        </div>
      </div>      
    `;
  });
  $('.flex-container').html(htmlString);
  showView('recent-dreams');
}

function getAndDisplayLatestDreams() {
  getLatestDreams(displayLatestDreams);
}

function handleDreamClick() {
  $('.flex-container').on('click', '.flex-col', function(event) {
    dreamId = $(this).attr('data-dream-id');
    appState.currentDream = appState.latestDreams.find(dream => dream._id === dreamId );
    showDreamDetail('recent-dreams');
  });
}

function handleLoginClick() {
  $('.login-link').click(function(event) {
    initLogin();
    showView('login');
    toggleNav();
  });
}

function handleLogoutClick() {
  $('.logout-link').click(function(event) {
    Cookies.remove('_dream-catcher-token');
    setMenu('public');
    initRecentDreams();
    showView('recent-dreams');
    toggleNav();
  });  
}

function handleRegisterClick() {
  $('.register-link').click(function(event) {
    initCreateAccount();
    showView('create-account');
    toggleNav();
  });
}

function handleLogoClick() {
  $('.logo').click(function(event) {
    initRecentDreams();
    showView('recent-dreams');
  });
}

function handleHomeClick() {
  $('.home-link').click(function(event) {
    initRecentDreams();
    showView('recent-dreams');
    toggleNav();
  });
}

function handleDreamJournalClick() {
  $('.dream-journal-link').click(function(event) {
    initDreamJournal();
    showView('dream-journal');
    toggleNav();
  });
}

function handleGetStartedClick() {
  $('.get-started-button').click(function(event) {
    initCreateAccount();
    showView('create-account');
  })
}