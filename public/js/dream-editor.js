function initDreamEditor(isNew){
  appState.viewStack.push('dream-editor');
  const dream = appState.currentDream;
  //clean out any old text
  $('#dream-editor-title').val('');
  nicEditors.findEditor('dream-editor-text').setContent('');

  if(isNew) {
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
  $('.dream-editor-message').css('display', 'none');
  $('.dream-editor-form').css('display', 'block');
  $('.nicEdit-panelContain').parent().width('100%');
  $('.nicEdit-panelContain').parent().next().width('98%');
  $('.nicEdit-main').width('100%');
  $('.nicEdit-main').height('300px');
  handleDreamEditSubmit();
  handleDreamEditBack();
  showView('dream-editor');
}

function postOrPutDream(postOrPut) {
  const title = $('#dream-editor-title').val();
  const text = nicEditors.findEditor('dream-editor-text').getContent();

  if(title === '' || text === '<br>' || text === '') {
    $('.dream-editor-message')
      .text('Please enter a title and text.')
      .css('display', 'block');
      handleDreamEditSubmit();
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
    beforeSend:setHeader,
    contentType: 'application/json',
    data: JSON.stringify(_data),
    success: postOrPutDreamSuccess,
    error: postOrPutError
  });
}

function postOrPutDreamSuccess() {
  //go back two screens after edit to bypass dream detail screen
  if(appState.viewStack[appState.viewStack.length - 2] !== 'dream-journal') {
    appState.viewStack.pop();
  }
  initPreviousScreen();
}

function postOrPutError() {
  $('.dream-editor-message')
  .text('There has been an error with your submission.')
  .css('display', 'block');
  handleDreamEditSubmit();
}

function handleDreamEditSubmit() {
  $('.dream-editor-form').off().submit(event => {
    event.preventDefault();
    if(appState.editorMode === 'new') {
      postOrPutDream('POST');
    } else {
      postOrPutDream('PUT');
    }
  });
}

function handleDreamEditBack() {
  $('.dream-editor-back').off().click(event => {
    event.preventDefault();
    returnToPreviousScreen();
  });
}