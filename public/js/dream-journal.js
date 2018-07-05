function initDreamJournal() {
  getAndDisplayJournalDreams();
  handleJournalDreamClick(); 
  handleNewDreamClick();
}

function getJournalDreams(callback) {
  setTimeout(() => callback(MOCK_JOURNAL_DREAMS), 100);
}

function displayJournalDreams(data) {
  appState.journalDreams = data.journalDreams;

  let htmlString = '';
  for(index in data.journalDreams) {
    htmlString += `
      <tr class="js-journal-dream" data-dream-id="${data.journalDreams[index].id}">
        <td><a href="javascript:void(0)">${data.journalDreams[index].title}</a></td>
        <td><span class="journal-date">${new Date(data.journalDreams[index].publishDate).toDateString()}</span></td>
        <td><input type="checkbox" class="journal-public-check"></td>
        <td><span class="journal-public">Public</span></td>
      </td>
    `;
  }
  $('.dream-journal-list').html(htmlString);
  showView('dream-journal');
}

function getAndDisplayJournalDreams() {
  getJournalDreams(displayJournalDreams);
}

function handleJournalDreamClick() {
  $('.dream-journal-list').on('click', '.js-journal-dream', function(event) {
    dreamId = $(this).attr('data-dream-id');
    const dream = appState.journalDreams.find(dream => dream.id === dreamId );
    showDreamDetail(dream, 'dream-journal');
  });
}

function handleNewDreamClick() {
  $('#new-dream').click(function() {
    showView('dream-add-edit');
  });
}