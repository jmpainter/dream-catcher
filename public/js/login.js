function initLogin() {
  handleLoginSubmit();
}

function loginUser(username, password) {
  const data = {username, password};
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
    $('.register-link').css('visibility', 'hidden');
    $('#username').val('');
    $('#password').val('');
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
}

function handleLoginSubmit() {
  $('.login-form').submit(function(event) {
    event.preventDefault();
    const username = $('#username').val();
    const password = $('#password').val();
    loginUser(username, password);
  });
}