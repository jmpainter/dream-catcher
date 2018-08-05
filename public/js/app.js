let API_URL = window.location.protocol + '//' + window.location.hostname;
if(window.location.port) {
  API_URL = API_URL + `:${window.location.port}`;
}

const appState = {
  userInfo: null,
  latestDreams: [],
  journalDreams: [],
  currentDream: null,
  currentPage: 1,
  totalPages: null,
  editorMode: '',
  viewStack: []
};

//used for returning from POST PUT or DELETE where updated data must be shown
function initPreviousScreen() {
  //pop off currend screen;
  appState.viewStack.pop();
  //get previous screen
  const prevScreen = appState.viewStack.pop();
  if(prevScreen === 'recent-dreams') {
    initRecentDreams();
  } else if (prevScreen === 'dream-detail') {
    initDreamDetail();
  } else if (prevScreen === 'dream-editor') {
    initDreamEditor();
  } else if (prevScreen === 'dream-journal') {
    initDreamJournal();
  }
}

//used for back button when no initialization of prevous screen is necessary
function returnToPreviousScreen() {
  //pop off currend screen;
  appState.viewStack.pop();
  //get previous screen
  const prevScreen = appState.viewStack[appState.viewStack.length - 1];
  showView(prevScreen);
}

function showView(viewName) {
  $('.view').css('display', 'none');
  $('#' + viewName).css('display', 'block');
}

function toggleNav(){
  const nav = $('.top-nav');
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

function setHeader(xhr) {
  xhr.setRequestHeader('Authorization', `Bearer ${Cookies.get('_dream-catcher-token')}`);
}

function setJournalDreams(data) {
  appState.journalDreams = data.dreams;
}

function getUserOnAppStartError() {
  $('.home-screen-message')
  .text('There was an error in retrieving your user information.')
  .css('display', 'block');  
}

function handleToggleNav() {
  $('.menu-link').click(() => {
    toggleNav();
  })
}

function startApp() {
  if(Cookies.get('_dream-catcher-token')) {
    setMenu('user');
    getJournalDreams(setJournalDreams);
    getUserInfo(getUserOnAppStartError);
  } else {
    setMenu('public');
  }
  handleToggleNav();
  initRecentDreams();
}

$(startApp);