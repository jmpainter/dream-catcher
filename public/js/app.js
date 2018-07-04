
const appState = {
  dreams: []
};

function showView(viewName) {
  $('.view').hide();
  if(viewName === 'start') {
    $('#' + viewName).show();
  } else {
    $('#' + viewName).fadeIn('slow');
  }
}

function startApp() {

  //for manually setting views
  $('main').prop('hidden', false);
  showView('dream-detail');

  //actual app code below
  // getAndDisplayLatestDreams();
  // handleDreamClick();
}
$(startApp);