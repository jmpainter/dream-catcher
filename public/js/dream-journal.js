function initDreamJournal() {
  getAndDisplayJournalDreams();
  handleJournalDreamClick(); 
  handleNewDreamClick();
}

function getJournalDreams(callback) {
  $.ajax({
    url: API_URL + '/dreams?personal=true',
    type: 'GET',
    beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${Cookies.get('_dream-catcher-token')}`);
    },
    data: {},
    success: callback
  })
  .catch(err => console.error(err));
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
    htmlString += `
      <div class="row">
        <div class="col-3">
          <a data-dream-id="${dream._id}" href="javascript:void(0)">${dream.title}</a>
        </div>
        <div class="col-3">
          <span class="journal-date">${new Date(dream.publishDate).toDateString()}</span>
          <label for="public-check" class="journal-public">Public</span>;
          <input data-dream-id="${dream._id}" type="checkbox" id="public-check" class="journal-public-check" ${dream.public ? 'checked' : ''}>
        </div>
      </div>
    `;
  });
  $('.dream-journal-list').html(htmlString);
  showView('dream-journal');
}

function getAndDisplayJournalDreams() {
  getJournalDreams(displayJournalDreams);
}

function toggleDreamPublic(dreamId, checkOrUncheck) {

  let _url = `${API_URL}/dreams/${dreamId}`;
  let _data = {id: dreamId};

  if(checkOrUncheck === 'check') {
    _data['public'] = true;
  } else {
    _data['public'] = false;
  }
  
  $.ajax({
    url: _url,
    type: 'PUT',
    beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${Cookies.get('_dream-catcher-token')}`);
    },
    contentType: 'application/json',
    data: JSON.stringify(_data),
    success: toggleDreamPublicSuccess,
    error: toggleDreamPublicError
  });
}

function toggleDreamPublicSuccess() {
  getAndDisplayJournalDreams();
}

function toggleDreamPublicError() {
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

  $('.dream-journal-list').on('click', 'input', function(event) {
    dreamId = $(this).attr('data-dream-id');
    let checkOrUncheck = 'check';
    if($(this).attr('checked')) {
      checkOrUncheck = 'uncheck';
    }
    toggleDreamPublic(dreamId, checkOrUncheck);
  });
}

function handleNewDreamClick() {
  $('.new-dream').click(function() {
    initDreamEditor();
    $('#dream-editor').css('visibility', 'visible');
    showView('dream-editor');
  });
}