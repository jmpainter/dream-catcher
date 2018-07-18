function initDreamEditor(dream){
  if(!dream) {
    appState.editorMode = 'new';
    $('.dream-editor-mode').text('New');
    $('.dream-editor-submit-label').text('Create');
  } else {
    appState.editorMode = 'update';
    $('.dream-editor-mode').text('Update');
    $('.dream-editor-submit-label').text('Update');
    $('#dream-editor-title').val(dream.title);
    nicEditors.findEditor('dream-editor-text').setContent(dream.text);
  }
  handleDreamEditSubmit();
  handleDreamEditBack();
}

function postOrPutDream(postOrPut) {
  const title = $('#dream-editor-title').val();
  const text = $('#dream-editor-text').val();

  if(title === '' || text === '<br>') {
    $('.dream-editor-message')
      .text('Please enter a title and text.')
      .css('display', 'block');
    return;
  }

  let _url = API_URL + '/dreams';
  let _data = {title, text};
  
  if(postOrPut === 'PUT') {
    _url += `/${appState.currentDream._id}`;
    _data['id'] = appState.currentDream._id;
  }

  $.ajax({
    url: _url,
    type: postOrPut,
    beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${Cookies.get('_dream-catcher-token')}`);
    },
    contentType: 'application/json',
    data: JSON.stringify(_data),
    success: postOrPutSuccess,
    error: postOrPutError
  })
  .catch(err => console.log(err));
}

function postOrPutSuccess() {
  initDreamJournal();
  showView('dream-journal');    
}

function postOrPutError() {
  $('.dream-editor-message')
  .text('There has been an error with your submission.')
  .css('display', 'block');
}

function handleDreamEditSubmit() {
  $('#dream-editor').submit(function(event) {
    event.preventDefault();
    if(appState.editorMode === 'new') {
      postOrPutDream('POST');
    } else {
      postOrPutDream('PUT');
    }
  });
}

function handleDreamEditBack() {
  console.log('back');
  $('.dream-editor-back').click(function(event) {
    initDreamJournal();
    showView('dream-journal');    
  });
}