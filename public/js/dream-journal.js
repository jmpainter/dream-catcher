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
    success: displayJournalDreams
  })
  .catch(err => console.error(err));
}

function displayJournalDreams(data) {
  appState.journalDreams = data.dreams;

  let htmlString = '';
  appState.journalDreams.forEach(dream => {
    htmlString += `
      <tr class="js-journal-dream">
        <td><a data-dream-id="${dream._id}" href="javascript:void(0)">${dream.title}</a></td>
        <td><span class="journal-date">${new Date(dream.publishDate).toDateString()}</span></td>
        <td><input data-dream-id="${dream._id}" type="checkbox" class="journal-public-check" ${dream.public ? 'checked' : ''}></td>
        <td><span class="journal-public">Public</span></td>
      </td>
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
    showDreamDetail('dream-journal');
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