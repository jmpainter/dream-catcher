function showDreamDetail(dream, backView) {
  appState.currentDream = dream;
  $('.dream-title').text(dream.title);
  $('.dream-author').text(dream.userName);
  $('.dream-publish-date').text(new Date(dream.publishDate).toDateString());
  $('.dream-text').text(dream.text);
  if(appState.isLoggedIn === true && appState.journalDreams.find(userDream => dream.id === userDream.id)) {
    $('.dream-edit-button').css('visibility', 'visible');
  }
  showView('dream-detail');
  handleDreamDetailBackClick(backView);
  handleDreamEditClick();
}

function handleDreamDetailBackClick(backView) {
  $('.dream-back').click(function() {
    showView(backView);
  });
}

function handleDreamEditClick() {
  $('.dream-edit-button').click(function() {
    alert('click');
    initDreamEditor(appState.currentDream.id);
    showView('dream-editor');
  })
}