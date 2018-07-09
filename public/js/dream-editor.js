function initDreamEditor(dream){
  if(dream === null) {
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
  handleDreamEditSubmit()
}

function handleDreamEditSubmit() {
  $('#dream-editor').submit(function(event) {
    event.preventDefault();
    if(appState.editorMode === 'new') {

    } else {

    }
  });
}