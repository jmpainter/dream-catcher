const appState = {
  latestDreams: [],
  journalDreams: []
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

  bkLib.onDomLoaded(nicEditors.allTextAreas);
}
$(startApp);