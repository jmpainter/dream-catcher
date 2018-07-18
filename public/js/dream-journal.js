function initDreamJournal() {
  getAndDisplayJournalDreams();
  handleJournalDreamClick(); 
  handleNewDreamClick();
}

function getJournalDreams(callback) {
  $.getJSON(API_URL + '/dreams?personal=true', callback);

  $.ajax({
    url: API_URL + '/dreams?personal=true',
    type: 'GET',
    beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', `Bearer ${Cookies.get('_dream-catcher-token')}`);
    },
    data: {},
    success: displayJournalDreams
  })
  .catch(err => console.log(err));
}

function displayJournalDreams(data) {
  appState.journalDreams = data.dreams;

  let htmlString = '';
  appState.journalDreams.forEach(dream => {
    htmlString += `
      <tr class="js-journal-dream">
        <td><a data-dream-id="${dream._id}" href="javascript:void(0)">${dream.title}</a></td>
        <td><span class="journal-date">${new Date(dream.publishDate).toDateString()}</span></td>
        <td><input type="checkbox" class="journal-public-check"></td>
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

function handleJournalDreamClick() {
  $('.dream-journal-list').on('click', 'a', function(event) {
    dreamId = $(this).attr('data-dream-id');
    appState.currentDream = appState.journalDreams.find(dream => dream._id === dreamId );
    showDreamDetail('dream-journal');
  });
}

function handleNewDreamClick() {
  $('#new-dream').click(function() {
    initDreamEditor();
    $('#dream-editor').css('visibility', 'visible');
    showView('dream-editor');
  });
}