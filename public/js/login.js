function initLogin() {
  handleLoginSubmit();
}

function handleLoginSubmit() {
  $('.login-form').submit(function(event) {
    event.preventDefault();
    appState.isLoggedIn = true;
    $('.login-link').text('Log Out');
    initDreamJournal();
    showView('dream-journal');
  });
}