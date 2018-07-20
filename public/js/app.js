let API_URL = window.location.protocol + '//' + window.location.hostname;
if(window.location.port) {
  API_URL = API_URL + `:${window.location.port}`;
}

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
  //for manually setting dream journal view
  // $('main').prop('hidden', false);
  // initDreamJournal();
  // appState.isLoggedIn = true;
  // showView('dream-journal');

 // actual start app code
  initRecentDreams();
  showView('recent-dreams');
}
$(startApp);