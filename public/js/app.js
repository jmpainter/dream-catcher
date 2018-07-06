const appState = {
  latestDreams: [],
  journalDreams: [],
  editorMode: '',
  isLoggedIn: false
};

function showView(viewName) {
  $('.view').hide();
  $('#' + viewName).show();
}

function startApp() {
  //for manually setting a view
  $('main').prop('hidden', false);
  initDreamJournal();
  showView('dream-journal');

  // actual start app code
  // initRecentDreams();
  // showView('recent-dreams');
}
$(startApp);