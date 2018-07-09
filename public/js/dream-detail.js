function showDreamDetail(dream, backView) {
  appState.currentDream = dream;
  $('.dream-title').text(dream.title);
  $('.dream-author').text(dream.userName);
  $('.dream-publish-date').text(new Date(dream.publishDate).toDateString());
  $('.dream-text').text(dream.text);
  showView('dream-detail');
  handleDreamDetailBackClick(backView);
  if(appState.isLoggedIn === true) {
    $('.dream-edit').css('visibility', 'visible');
    handleDreamEditClick();
  } else {
    $('.dream-edit').css('visibility', 'hidden');
  }
}

function handleDreamDetailBackClick(backView) {
  $('.dream-back').click(function() {
    showView(backView);
  });
}

function handleDreamEditClick() {
  $('.dream-edit').click(function() {
    initDreamEditor(appState.currentDream);
    showView('dream-editor');
  });
}