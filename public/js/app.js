const IS_LOCAL = true;
let API_URL;
if(IS_LOCAL) {
  API_URL = 'http://localhost:8080';
} else {
  API_URL = 'https://afternoon-wave-33296';
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