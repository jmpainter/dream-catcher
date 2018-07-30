let API_URL = window.location.protocol + '//' + window.location.hostname;
if(window.location.port) {
  API_URL = API_URL + `:${window.location.port}`;
}

const appState = {
  latestDreams: [],
  journalDreams: [],
  currentDream: null,
  editorMode: ''
};

function showView(viewName) {
  $('.view').hide();
  $('#dream-editor').css('visibility', 'hidden');
  $('#' + viewName).show();
  if(viewName === 'dream-editor') {
    $('#dream-editor').css('visibility', 'visible');
  }
}

function toggleNav(){
  const nav = $('#my-top-nav');
  if (nav.attr('class') === 'top-nav'){
    nav.attr('class', 'top-nav responsive');
  } else {
    nav.attr('class', 'top-nav');
  }
}

function setMenu(type) {
  if(type === 'user') {
    $('.public-link').css('display', 'none');
    $('.splash').css('display', 'none');
    $('.user-link').css('display', 'block');
  } else {
    $('.user-link').css('display', 'none');
    $('.public-link').css('display', 'block');
  }
}

function setJournalDreams(data) {
  appState.journalDreams = data.dreams;
}

function startApp() {
  //for manually setting dream journal view
  // $('main').prop('hidden', false);
  // initDreamJournal();

 // actual start app code
  if(Cookies.get('_dream-catcher-token')) {
    setMenu('user');
    getJournalDreams(setJournalDreams);
  } else {
    setMenu('public');
  }
  initRecentDreams();
}
$(startApp);