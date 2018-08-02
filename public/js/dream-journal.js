function initDreamJournal() {
  handleJournalDreamClick(); 
  handleNewDreamClick();
  getJournalDreams(displayJournalDreams);
  showView('dream-journal');
}

function getJournalDreams(callback) {
  $.ajax({
    url: API_URL + '/dreams?personal=true',
    type: 'GET',
    beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${Cookies.get('_dream-catcher-token')}`);
    },
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

function displayJournalDreams(data) {
  appState.journalDreams = data.dreams;
  let htmlString = '';
  if(appState.journalDreams.length === 0) {
    htmlString = `<div class="row"><div class="col-6"><p>Start creating your first dream entry by clicking the 'New Dream' button above.
     You will have the option of publishing the dream once it is created.</p>
     <p>Dictating into Dream Catcher from a mobile phone is a convenient way to make entries!</p></div><div class="col-6"></div>`;
  }

  appState.journalDreams.forEach(dream => {
    console.log(dream);
    htmlString += `
      <div class="row">
        <div class="col-3">
          <a data-dream-id="${dream._id}" href="javascript:void(0)">${dream.title}</a>
        </div>
        <div class="col-3">
          <span class="journal-date">${new Date(dream.publishDate).toDateString()}</span>
        </div>
        <div class="col-3">
          <span class="journal-public">Public</span>;
          <input data-dream-id="${dream._id}" type="checkbox" class="journal-check public-check" ${dream.public ? 'checked' : ''}>`;
    if(dream.public) {
      htmlString += `
          <span class="journal-public">Comments</span>;
          <input data-dream-id="${dream._id}" type="checkbox" id="" class="journal-check comments-check" ${dream.commentsOn ? 'checked' : ''}>`
    }
    htmlString += `
        </div>
      </div>`;
  });
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
  console.log(updateData);
  $.ajax({
    url: `${API_URL}/dreams/${dreamId}`,
    type: 'PUT',
    beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${Cookies.get('_dream-catcher-token')}`);
    },
    contentType: 'application/json',
    data: JSON.stringify(updateData),
    success: updateDreamSuccess,
    error: updateDreamError
  });
}

function updateDreamSuccess() {
  window.setTimeout(getJournalDreams, 250, displayJournalDreams);
}

function updateDreamError() {
  $('.dream-journal-message')
    .text('Dream status update was unsuccessful.')
    .css('display', 'block');  
}

function handleJournalDreamClick() {
  $('.dream-journal-list').on('click', 'a', function(event) {
    dreamId = $(this).attr('data-dream-id');
    appState.currentDream = appState.journalDreams.find(dream => dream._id === dreamId );
    initDreamDetail('dream-journal');
  });

  $('.dream-journal-list').on('click', '.public-check', function(event) {
    dreamId = $(this).attr('data-dream-id');
    let checkOrUncheck = 'uncheck';
    if($(this).is(':checked')) {
      checkOrUncheck = 'check';
    }
    updateDream(dreamId, checkOrUncheck, 'public');
  });

  $('.dream-journal-list').on('click', '.comments-check', function(event) {
    dreamId = $(this).attr('data-dream-id');
    let checkOrUncheck = 'uncheck';
    if($(this).is(':checked')) {
      checkOrUncheck = 'check';
    }
    updateDream(dreamId, checkOrUncheck, 'commentsOn');
  });  
}

function handleNewDreamClick() {
  $('.new-dream').click(function() {
    $('#dream-editor').css('visibility', 'visible');
    initDreamEditor(true);
  });
}