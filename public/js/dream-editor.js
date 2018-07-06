function initDreamEditor(dreamId = null){
  if(dreamId === null) {
    appState.editorMode = 'new';
    $('.dream-editor-mode').text('New');
    $('#dream-editor-button-label').text('Create');
  }
}