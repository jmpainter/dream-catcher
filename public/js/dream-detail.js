function showDreamDetail(backView) {
  const dream = appState.currentDream;
  console.log(dream);
  $('.dream-title').text(dream.title);
  const author = dream.author ? dream.author.screenName : '';
  $('.dream-author').text(author);
  $('.dream-publish-date').text(new Date(dream.publishDate).toDateString());
  $('.dream-text').html(dream.text);
  showView('dream-detail');
  handleDreamDetailBackClick(backView);
  if(Cookies.get('_dream-catcher-token') && appState.journalDreams.find(dream => dream._id === appState.currentDream._id)) {
    $('.dream-edit').css('visibility', 'visible');
    $('.dream-delete').css('visibility', 'visible');
    handleDreamEditClick();
    handleDreamDeleteClick();
  } else {
    $('.dream-edit').css('visibility', 'hidden');
    $('.dream-delete').css('visibility', 'hidden');
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

function deleteDream() {
  if(confirm('Are you sure you want to delete this dream?')) {
    const _url = `${API_URL}/dreams/${appState.currentDream._id}`;
    $.ajax({
      url: _url,
      type: 'DELETE',
      beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization', `Bearer ${Cookies.get('_dream-catcher-token')}`);
      },
      success: deleteDreamSuccess,
      error: deleteDreamError
    });
  }
}

function deleteDreamSuccess() {
  initDreamJournal();
  showView('dream-journal');
}

function deleteDreamError() {
  $('.dream-detail-message')
    .text('There was an error in deleting your dream.')
    .css('display', 'block');
  handleDreamDeleteClick();
}

function handleDreamDeleteClick() {
  $('.dream-delete').off().click(function() {
    deleteDream();
  });
}