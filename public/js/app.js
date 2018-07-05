
const appState = {
  dreams: []
};

function showView(viewName) {
  $('.view').hide();
  $('#' + viewName).show();
}

function startApp() {

  //for manually setting views
  $('main').prop('hidden', false);
  showView('login');

  //actual app code below
  // getAndDisplayLatestDreams();
  // handleDreamClick();
}
$(startApp);