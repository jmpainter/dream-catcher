function initDreamEditor(dream){
  if(dream === null) {
    appState.editorMode = 'new';
    $('.dream-editor-mode').text('New');
    $('#dream-editor-button-label').text('Create');
  } else {
    appState.editorMode = 'update';
    $('.dream-editor-mode').text('Update');
    $('#dream-editor-button-label').text('Update');
    $('#dream-editor-title').val(dream.title);
    nicEditors.findEditor('dream-editor-text').setContent(dream.text);
  }
}