function initLogin() {
  handleLoginSubmit();
  $('.login-message')
    .text('')
    .css('display', 'none');    
  showView('login');
}

function getUserInfo(errorCallback) {
  $.ajax({
    url: `${API_URL}/users`,
    type: 'GET',
    beforeSend: setHeader,
    data: {},
    error: errorCallback,
    success: getUserSuccess
  });
}

function getUserSuccess(user) {
  appState.userInfo = user;
}

function getUserOnLoginError() {
  $('.login-message')
    .text('There was an error in retrieving your user information.')
    .css('display', 'block');  
}

function loginUser(username, password) {
  const data = {username, password};
  $.ajax({
    type: 'POST',
    url: API_URL + '/auth/login',
    contentType: 'application/json',
    data: JSON.stringify(data),
    error: loginError,
    success: loginSuccess    
  })
}

function loginSuccess(data) {
  setMenu('user');
  Cookies.set('_dream-catcher-token', data.authToken, {expires: 30});
  $('#username').val('');
  $('#password').val('');
  getUserInfo();
  initDreamJournal();
}

function loginError(err) {
  let message;
  if(err.responseText === 'Unauthorized') {
    message = 'Incorrect Login';
  } else {
    message = 'There was an error with logging in';
  }
  $('.login-message')
    .text(message)
    .css('display', 'block');  
}

function handleLoginSubmit() {
  $('.login-form').submit(event => {
    event.preventDefault();
    const username = $('#username').val();
    const password = $('#password').val();
    loginUser(username, password);
  });
}