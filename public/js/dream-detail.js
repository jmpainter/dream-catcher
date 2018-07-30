function showDreamDetail(backView) {
  const dream = appState.currentDream;
  console.log(dream);
  $('.dream-title').text(dream.title);
  const author = dream.author ? dream.author.screenName : '';
  $('.dream-author').text(author);
  $('.dream-publish-date').text(new Date(dream.publishDate).toDateString());
  $('.dream-text').html(dream.text);
  let commentsHTML = '';
  for(let comment of dream.comments) {
    commentsHTML += `<li><p class="dream-comment-text">${comment.text}</p><p class="dream-comment-author">${comment.author.screenName}</p></li>`;
  }
  $('.dream-comments').html(commentsHTML);
  showView('dream-detail');
  handleDreamDetailBackClick(backView);

  //if user is logged in
  if(Cookies.get('_dream-catcher-token')) {
    //if this is one of theird dreams, show edit and delete buttons, hide the comment button
    if(appState.journalDreams.find(dream => dream._id === appState.currentDream._id)) {
      $('.dream-edit').css('display', 'block');
      $('.dream-delete').css('display', 'block');
      $('.dream-comment').css('display', 'none');
      handleDreamEditClick();
      handleDreamDeleteClick();
    } else {
      //show the comment button
      $('.dream-edit').css('display', 'none');
      $('.dream-delete').css('display', 'none');
      $('.dream-comment').css('display', 'block');
      handleDreamCommentClick();
    }
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

function handleDreamCommentClick() {

}