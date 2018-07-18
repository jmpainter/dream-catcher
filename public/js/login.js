function initLogin() {
  handleLoginSubmit();
}

function handleLoginSubmit() {
  $('.login-form').submit(function(event) {
    event.preventDefault();
    var _username = $('#username').val();
    var _password = $('#password').val();
    const data = {username: _username, password: _password};
    $.ajax({
      type: 'POST',
      url: API_URL + '/auth/login',
      contentType: 'application/json',
      data: JSON.stringify(data)
    })
    .done(function(data){
      Cookies.set('_dream-catcher-token', data.authToken, {expires: 1});
      appState.isLoggedIn = true;
      $('.login-link').text('Log Out');
      initDreamJournal();
      showView('dream-journal');
    })
    .catch(err => {
      if(err.responseText === 'Unauthorized') {
        $('.login-message')
          .text('Incorrect Login')
          .css('display', 'block');  
      }
    });
  });
}