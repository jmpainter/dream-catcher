function initRecentDreams() {
  getAndDisplayLatestDreams();
  handleDreamClick();
  handleLoginClick();
  handleLogoClick();
}

function getLatestDreams(callback) {
  $.getJSON(API_URL + '/dreams', callback);
}

function displayLatestDreams(data) {
  appState.latestDreams = data.dreams;
  $('main').prop('hidden', false);

  let htmlString = '';
  appState.latestDreams.forEach(dream => {
    htmlString += `
      <li class="js-dream" data-dream-id="${dream._id}">
        <a href="javascript:void(0)">${dream.title}</a><br class="mobile"/>
        <span class="author">by ${dream.author.screenName}</span>
        <span class="date">- ${new Date(dream.publishDate).toDateString()}</span>
      </li>
    `;
  });
  $('.dream-list').html(htmlString);
  showView('recent-dreams');
}

function getAndDisplayLatestDreams() {
  getLatestDreams(displayLatestDreams);
}

function handleDreamClick() {
  $('.dream-list').on('click', '.js-dream', function(event) {
    dreamId = $(this).attr('data-dream-id');
    appState.currentDream = appState.latestDreams.find(dream => dream._id === dreamId );
    showDreamDetail('recent-dreams');
  });
}

function handleLoginClick() {
  $('.login-link').click(function(event) {
    if(appState.isLoggedIn === false) {
      initLogin();
      showView('login');
    } else {
      appState.isLoggedIn = false;
      $('.login-link').text('Log In');
      initRecentDreams();
      showView('recent-dreams');     
    }
  });
}

function handleLogoClick() {
  $('.logo').click(function(event) {
    initRecentDreams();
    showView('recent-dreams');
  });
}