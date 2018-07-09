const appState = {
  latestDreams: [],
  journalDreams: [],
  currentDream: null,
  editorMode: '',
  isLoggedIn: false
};

function showView(viewName) {
  $('.view').hide();
  $('#dream-editor').css('visibility', 'hidden');
  $('#' + viewName).show();
  if(viewName = 'dream-editor') {
    $('#dream-editor').css('visibility', 'visible');
  }
}

function startApp() {
  //for manually setting a view
  $('main').prop('hidden', false);
  initDreamJournal();
  appState.isLoggedIn = true;
  showView('dream-journal');

  // actual start app code
  // initRecentDreams();
  // showView('recent-dreams');
}
$(startApp);