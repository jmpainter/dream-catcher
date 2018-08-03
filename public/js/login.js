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
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', `Bearer ${Cookies.get('_dream-catcher-token')}`);
    },
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
    data: JSON.stringify(data)
  })
  .done(function(data){
    setMenu('user');
    Cookies.set('_dream-catcher-token', data.authToken, {expires: 30});
    $('#username').val('');
    $('#password').val('');
    getUserInfo();
    initDreamJournal();
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