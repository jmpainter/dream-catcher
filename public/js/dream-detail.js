function showDreamDetail(dream, backView) {
  $('.dream-title').text(dream.title);
  $('.dream-author').text(dream.userName);
  $('.dream-publish-date').text(new Date(dream.publishDate).toDateString());
  $('.dream-text').text(dream.text);
  showView('dream-detail');
  handleDreamDetailBackClick(backView);
  handleNewDreamClick();
}

function handleDreamDetailBackClick(backView) {
  $('.dream-back').click(function() {
    showView(backView);
  });
}