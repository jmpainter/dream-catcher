function initDreamEditor(dreamId = null){
  debugger;
  if(dreamId === null) {
    appState.editorMode = 'new';
    $('.dream-editor-mode').text('New');
    $('#dream-editor-button-label').text('Create');
  } else {
    appState.editorMode = 'edit';
    $('.dream-editor-mode').text('Edit');    
    $('#dream-editor-button-label').text('Update');
  }
  handleEditorSubmit();
}

function handleEditorSubmit() {
  $('#dream-editor-form').submit(function(event) {
    alert('click');
  });
}