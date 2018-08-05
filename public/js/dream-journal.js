function initDreamJournal() {
  appState.viewStack.push('dream-journal');
  handleJournalDreamClick(); 
  handleNewDreamClick();
  getJournalDreams(displayJournalDreams);
  showView('dream-journal');
}

function getJournalDreams(callback) {
  $.ajax({
    url: API_URL + '/dreams?personal=true',
    type: 'GET',
    beforeSend: setHeader,
    data: {},
    success: callback,
    error: getJournalDreamsError
  });
}

function getJournalDreamsError() {
  $('.dream-journal-message')
    .text('Dream journal retrieval was unsuccessful.')
    .css('display', 'block');  
}

function getDreamJournalDreamHTML(dream) {
  let htmlString = '';
  htmlString += `
  <div class="row">
    <div class="col-3">
      <a data-dream-id="${dream._id}" href="javascript:void(0)">${dream.title}</a>
    </div>
    <div class="col-3">
      <span class="journal-date">${new Date(dream.publishDate).toDateString()}</span>
    </div>
    <div class="col-3">
      <label for="public${dream._id}" class="journal-public">Public</label>;
      <input id="public${dream._id}" data-dream-id="${dream._id}" type="checkbox" class="journal-check public-check" ${dream.public ? 'checked' : ''}>`;

  if(dream.public) {
    htmlString += `
        <label for="comments${dream._id}" class="journal-public">Comments</label>;
        <input id="comments${dream._id}" data-dream-id="${dream._id}" type="checkbox" id="" class="journal-check comments-check" ${dream.commentsOn ? 'checked' : ''}>`
  }
  htmlString += `
    </div>
  </div>`;
  return htmlString;
}

function displayJournalDreams(data) {
  appState.journalDreams = data.dreams;
  let htmlString = '';
  if(appState.journalDreams.length === 0) {
    htmlString = `<div class="row"><div class="col-6"><p>Start creating your first dream entry by clicking the 'New Dream' button above.
     You will have the option of publishing the dream once it is created. Public dreams can be opened for comments.</p>
     <p>Dictating into Dream Catcher from a mobile phone is a convenient way to make entries!</p></div><div class="col-6"></div>`;
  } else {
    appState.journalDreams.forEach(dream => htmlString += getDreamJournalDreamHTML(dream));
  }
  $('.dream-journal-list').html(htmlString);
}

function updateDream(dreamId, checkOrUncheck, type) {
  const updateData = {id: dreamId};
  if(checkOrUncheck === 'check') {
    updateData[type] = true;
  } else {
    updateData[type] = false;
    if(type === 'public') {
      updateData['commentsOn'] = false;
    }
  }
  
  $.ajax({
    url: `${API_URL}/dreams/${dreamId}`,
    type: 'PUT',
    beforeSend: setHeader,
    contentType: 'application/json',
    data: JSON.stringify(updateData),
    success: updateDreamSuccess,
    error: updateDreamError
  });
}

function updateDreamSuccess() {
  //set a pause to account for possible databases latency
  window.setTimeout(getJournalDreams, 250, displayJournalDreams);
}

function updateDreamError() {
  $('.dream-journal-message')
    .text('Dream status update was unsuccessful.')
    .css('display', 'block');  
}

function handleJournalDreamClick() {
  $('.dream-journal-list').off('click', 'a').on('click', 'a', function(event) {
    dreamId = $(this).attr('data-dream-id');
    appState.currentDream = appState.journalDreams.find(dream => dream._id === dreamId );
    initDreamDetail();
  });

  $('.dream-journal-list').off('click', '.public-check').on('click', '.public-check', function(event) {
    dreamId = $(this).attr('data-dream-id');
    let checkOrUncheck = 'uncheck';
    if($(this).is(':checked')) {
      checkOrUncheck = 'check';
    }
    updateDream(dreamId, checkOrUncheck, 'public');
  });

  $('.dream-journal-list').off('click', '.comments-check').on('click', '.comments-check', function(event) {
    dreamId = $(this).attr('data-dream-id');
    let checkOrUncheck = 'uncheck';
    if($(this).is(':checked')) {
      checkOrUncheck = 'check';
    }
    updateDream(dreamId, checkOrUncheck, 'commentsOn');
  });  
}

function handleNewDreamClick() {
  $('.new-dream').off().click(() => {
    $('#dream-editor').css('visibility', 'visible');
    initDreamEditor(true);
  });
}