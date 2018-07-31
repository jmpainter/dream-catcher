function initDreamDetail(backView) {
  handleDreamDetailBackClick(backView);
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

const setHeader = function (xhr) {
  xhr.setRequestHeader('Authorization', `Bearer ${Cookies.get('_dream-catcher-token')}`);
}

function displayCurrentDream(dream) {
  $('.dream-title').text(dream.title);
  const author = dream.author ? dream.author.screenName : '';
  $('.dream-author').text(author);
  $('.dream-publish-date').text(new Date(dream.publishDate).toDateString());
  $('.dream-text').html(dream.text);

  $('.dream-edit').css('display', 'none');
  $('.dream-delete').css('display', 'none');
  $('.dream-comment').css('display', 'none');
  //if user is logged in
  if(Cookies.get('_dream-catcher-token')) {
    //if this is one of theird dreams, show edit and delete buttons, hide the comment button
    if(appState.journalDreams.find(dream => dream._id === appState.currentDream._id)) {
      $('.dream-edit').css('display', 'block');
      $('.dream-delete').css('display', 'block');
      handleDreamEditClick();
      handleDreamDeleteClick();
    } else if(dream.commentsOn === true) {
      //show the comment button
      $('.dream-comment').css('display', 'block');
      handleDreamCommentClick();
    }
  }
  //need to check if a comment is the current user's or 
  //if the comment is on the user's dream
  let commentsHTML = '';
  for(let comment of dream.comments) {
    commentsHTML += `<li><p class="dream-comment-text">${comment.text}</p><p class="dream-comment-author">${comment.author.screenName}</p></li>`;
  }
  $('.dream-comments').html(commentsHTML);

  showView('dream-detail');
}

function getCurrentDreamError() {
  $('.dream-detail-message')
    .text('There was an error in retrieving your dream.')
    .css('visibility', 'visible');  
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
    .css('visibility', 'visible');
  handleDreamDeleteClick();
}

function handleDreamDeleteClick() {
  $('.dream-delete').off().click(function() {
    deleteDream();
  });
}

function addComment() {
  data = {
    text: $('#comment-text').val(),
  }
  
  $.ajax({
    url: `${API_URL}/dreams/${appState.currentDream._id}/comments`,
    type: 'POST',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${Cookies.get('_dream-catcher-token')}`);
    },    
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: getCurrentDream,
    error: createCommentError
  });
}

function createCommentError(xhr, status, error) {
  $('.create-comment-message')
  .text('There was an error in creating your comment.')
  .css('display', 'block');
}

function handleCommentSubmitClick() {
  $('.comment-add-form').submit(function(event) {
    event.preventDefault();
    $('.comment-add-form').css('display', 'none');
    addComment();
  });
}

function handleDreamCommentClick() {
  $('.dream-comment').click(function() {
    $('.comment-add-form').css('display', 'block');
    $('.nicEdit-panelContain').parent().width('100%');
    $('.nicEdit-panelContain').parent().next().width('100%');
    $('.nicEdit-main').width('100%');
    $('.nicEdit-main').height('92px');
    handleCommentSubmitClick();
  })
}