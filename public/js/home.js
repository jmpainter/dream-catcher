function initRecentDreams() {
  getAndDisplayLatestDreams();
  handleDreamClick();
  handleLoginClick();
  handleRegisterClick();
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
        <span class="author">by ${dream.author.screenName || dream.author.username}</span>
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
      $('.register-link').css('visibility', 'visible');
      initRecentDreams();
      showView('recent-dreams');     
    }
  });
}

function handleRegisterClick() {
  $('.register-link').click(function(event) {
    initCreateAccount();
    showView('create-account');
  });
}

function handleLogoClick() {
  $('.logo').click(function(event) {
    initRecentDreams();
    showView('recent-dreams');
  });
}