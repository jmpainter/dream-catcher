function initRecentDreams() {
  if(appState.viewStack[appState.viewStack.length - 1] !== 'recent-dreams') {
    appState.viewStack.push('recent-dreams');
  }  
  getLatestDreams();
  handleDreamClick();
  handleLoginClick();
  handleRegisterClick();
  handleLogoClick();
  handleLogoutClick();
  handleHomeClick();
  handleDreamJournalClick();
  handleGetStartedClick();
}

function getLatestDreams(page = 1) {
  $.getJSON(API_URL + `/dreams?page=${page}`, displayLatestDreams);
}

function displayLatestDreams(data) {
  console.log(data);
  appState.latestDreams = data.dreams;
  appState.currentPage =  parseInt(data.current);
  appState.totalPages =  parseInt(data.pages);

  $('main').prop('hidden', false);

  let htmlString = '';

  appState.latestDreams.forEach(dream => {
    htmlString += `
      <div class="flex-col" data-dream-id="${dream._id}">
        <img class="dream-icon" src="img/dream-icon${Math.floor(Math.random() * 100) + 1}.svg">
        <div class="home-dream-details">
          <p class="home-title"><a href="javascript:void(0)">${dream.title}</a></p>
          <p class="home-author">by ${dream.author.screenName || dream.author.username}</p>
          <p class="home-publish-date">${new Date(dream.publishDate).toDateString()}</p>
        </div>
      </div>      
    `;
  });
  $('.flex-container').html(htmlString);
  $('.dreams-next').css('display', 'none');
  $('.dreams-previous').css('display', 'none');
  if(appState.currentPage < appState.totalPages) {
    $('.dreams-next').css('display', 'inline-block');
    handleNextDreamsClick();
  }
  if(appState.currentPage > 1) {
    $('.dreams-previous').css('display', 'inline-block');
    handlePreviousDreamsClick();
  }
  showView('recent-dreams');
}

function handleDreamClick() {
  $('.flex-container').off('click', '.flex-col').on('click', '.flex-col', function(event) {
    dreamId = $(this).attr('data-dream-id');
    appState.currentDream = appState.latestDreams.find(dream => dream._id === dreamId );
    initDreamDetail();
  });
}

function handleNextDreamsClick() {
  $('.dreams-next').off().click(function(event) {
    getLatestDreams((appState.currentPage + 1).toString());
  })
}

function handlePreviousDreamsClick() {
  $('.dreams-previous').off().click(function(event) {
    getLatestDreams((appState.currentPage - 1).toString());
  })
}

function handleLoginClick() {
  $('.login-link').off().click(function(event) {
    initLogin();
    toggleNav();
  });
}

function handleLogoutClick() {
  $('.logout-link').off().click(function(event) {
    Cookies.remove('_dream-catcher-token');
    appState.userInfo = null;
    setMenu('public');
    initRecentDreams();
    toggleNav();
  });  
}

function handleRegisterClick() {
  $('.register-link').off().click(function(event) {
    initCreateAccount();
    toggleNav();
  });
}

function handleLogoClick() {
  $('.logo').off().click(function(event) {
    initRecentDreams();
  });
}

function handleHomeClick() {
  $('.home-link').off().click(function(event) {
    initRecentDreams();
    toggleNav();
  });
}

function handleDreamJournalClick() {
  $('.dream-journal-link').off().click(function(event) {
    initDreamJournal();
    toggleNav();
  });
}

function handleGetStartedClick() {
  $('.get-started-button').off().click(function(event) {
    initCreateAccount();
  })
}