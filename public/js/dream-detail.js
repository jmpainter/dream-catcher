function initDreamDetail() {
  if(appState.viewStack[appState.viewStack.length - 1] !== 'dream-detail') {
    appState.viewStack.push('dream-detail');
  }
  $('.dream-edit').css('display', 'none');
  $('.dream-delete').css('display', 'none');
  $('.dream-comment').css('display', 'none');

  handleDreamDetailBackClick();
  handleCommentDeleteClick();
  getCurrentDream();
}

function getCurrentDream() {
  $.ajax({
    url: `${API_URL}/dreams/${appState.currentDream._id}`,
    type: 'GET',
    beforeSend: Cookies.get('_dream-catcher-token') ? setHeader : null,
    data: {},
    success: displayCurrentDream,
    error: getCurrentDreamError
  })
  .catch(err => console.error(err));
}

function displayCurrentDream(dream) {
  $('.dream-title').text(dream.title);
  const author = dream.author ? dream.author.screenName : '';
  $('.dream-author').text(author);
  $('.dream-publish-date').text(new Date(dream.publishDate).toDateString());
  $('.dream-text').html(dream.text);
  //if user is logged in
  if(Cookies.get('_dream-catcher-token')) {
    //if this is one of the user's dreams, show edit and delete buttons, hide the comment button
    if(dream.author._id === appState.userInfo.id) {
      $('.dream-edit').css('display', 'block');
      $('.dream-delete').css('display', 'block');
      handleDreamEditClick();
      handleDreamDeleteClick();
    } else {
      if(dream.commentsOn === true) {
        //if comments are set to on for the dream, show the comment button
        $('.dream-comment').css('display', 'block');
        handleDreamCommentClick();
      }
    }
  }
  let commentsHTML = getCommentsHTML(dream);
  $('.dream-comments').html(commentsHTML);
  showView('dream-detail');
}

function getCommentsHTML(dream) {
  //need to check if a comment is the current user's or 
  //if the comment is on the user's dream
  let commentsHTML = '';
  for(let comment of dream.comments) {
    commentsHTML += `<li><p class="dream-comment-text">${comment.text}</p><p class="dream-comment-author">${comment.author.screenName}</p>`;
    if(Cookies.get('_dream-catcher-token') && (comment.author._id === appState.userInfo.id || dream.author._id == appState.userInfo.id)) {
      commentsHTML += `<p class="comment-delete"><a class="delete-comment-link" data-comment-id=${comment._id}>delete comment</a></p>`;
    }
  }
  return commentsHTML;
}

function getCurrentDreamError() {
  $('.dream-detail-message')
    .text('There was an error in retrieving your dream.')
    .css('visibility', 'visible');  
}

function handleDreamDetailBackClick(backView) {
  $('.dream-back').off().click(function() {
    returnToPreviousScreen();
  });
}

function handleDreamEditClick() {
  $('.dream-edit').off().click(function() {
    initDreamEditor(false);
  });
}

function deleteDream() {
  if(confirm('Are you sure you want to delete this dream?')) {
    const _url = `${API_URL}/dreams/${appState.currentDream._id}`;
    $.ajax({
      url: _url,
      type: 'DELETE',
      beforeSend: setHeader,
      success: initPreviousScreen,
      error: deleteDreamError
    });
  }
}

function deleteDreamError() {
  $('.dream-detail-message')
    .text('There was an error in deleting your dream.')
    .css('visibility', 'visible');
  handleDreamDeleteClick();
}

function handleDreamDeleteClick() {
  $('.dream-delete').off().click(() => {
    deleteDream();
  });
}

function deleteComment(commentId) {
  if(confirm('Are you sure you want to delete this comment?')) {
    const _url = `${API_URL}/dreams/${appState.currentDream._id}/comments/${commentId}`;
    $.ajax({
      url: _url,
      type: 'DELETE',
      beforeSend: setHeader,
      success: commentSuccess,
      error: deleteCommentError
    });
  }  
}

function deleteCommentError() {
  $('.dream-detail-message')
    .text('There was an error in deleting your comment.')
    .css('visibility', 'visible');
  handleCommentDeleteClick();
}

function handleCommentDeleteClick() {
  $('.dream-comments').off('click', '.delete-comment-link').on('click', '.delete-comment-link', function() {
    commentId = $(this).attr('data-comment-id');
    deleteComment(commentId);
  });
}

function addComment() {
  data = {
    text: $('#comment-text').val(),
  }
  
  $.ajax({
    url: `${API_URL}/dreams/${appState.currentDream._id}/comments`,
    type: 'POST',
    beforeSend: setHeader,
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: commentSuccess,
    error: createCommentError
  });
}

function commentSuccess() {
  setTimeout(initDreamDetail, 250);
}

function createCommentError(xhr, status, error) {
  $('.create-comment-message')
  .text('There was an error in creating your comment.')
  .css('display', 'block');
}

function handleCommentSubmitClick() {
  $('.comment-add-form').off().submit(event => {
    event.preventDefault();
    $('.comment-add-form').css('display', 'none');
    addComment();
  });
}

function handleDreamCommentClick() {
  $('.dream-comment').click(() => {
    $('.comment-add-form').css('display', 'block');
    $('.nicEdit-panelContain').parent().width('100%');
    $('.nicEdit-panelContain').parent().next().width('100%');
    $('.nicEdit-main').width('100%');
    $('.nicEdit-main').height('92px');
    handleCommentSubmitClick();
  })
}