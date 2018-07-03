
function getLatestDreams(callback) {
  setTimeout(() => callback(MOCK_LATEST_DREAMS), 100);
}

function displayLatestDreams(data) {
  $('main')
    .prop('hidden', false)
    .append('<div class="row"><div class="col-12"><h2>Latest Dreams</h2>');

  for(index in data.latestDreams) {
    $('main').append('<p>' + data.latestDreams[index].title + '</p');
  }
  $('main').append('</div></div>');

}

function getAndDisplayLatestDreams() {
  getLatestDreams(displayLatestDreams);
}

function startApp() {
  //getAndDisplayLatestDreams();
}
$(startApp);