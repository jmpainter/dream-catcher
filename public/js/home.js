function initRecentDreams() {
  getAndDisplayLatestDreams();
  handleDreamClick();
  handleLoginClick();
  handleLogoClick();
}

function getLatestDreams(callback) {
  setTimeout(() => callback(MOCK_LATEST_DREAMS), 100);
}

function displayLatestDreams(data) {
  appState.latestDreams = data.latestDreams;
  $('main').prop('hidden', false);

  let htmlString = '';
  for(index in data.latestDreams) {
    htmlString += `
      <li class="js-dream" data-dream-id="${data.latestDreams[index].id}">
        <a href="javascript:void(0)">${data.latestDreams[index].title}</a>
        <span class="author">by ${data.latestDreams[index].userName}</span>
        <span class="date">- ${new Date(data.latestDreams[index].publishDate).toDateString()}</span>
      </li>
    `;
  }
  $('.dream-list').html(htmlString);
  showView('recent-dreams');
}

function getAndDisplayLatestDreams() {
  getLatestDreams(displayLatestDreams);
}

function handleDreamClick() {
  $('.dream-list').on('click', '.js-dream', function(event) {
    dreamId = $(this).attr('data-dream-id');
    const dream = appState.latestDreams.find(dream => dream.id === dreamId );
    showDreamDetail(dream, 'recent-dreams');
  });
}

function handleLoginClick() {
  $('.login-link').click(function(event) {
    if(appState.isLoggedIn === false) {
      initLogin();
      showView('login');
    } else {
      appState.isLoggedIn = false;
      $('.login-link').text('Log Out');      
    }
  });
}

function handleLogoClick() {
  $('#logo').click(function(event) {
    initRecentDreams();
    showView('recent-dreams');
  });
}