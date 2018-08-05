function initCreateAccount(){
  $('#account-username').val('');
  $('#account-password').val('');
  $('#account-first-name').val('');
  $('#account-last-name').val('');
  $('#account-screen-name').val(''); 
  $('.create-account-message').css('display', 'none');
  handleAccountCreate();
  showView('create-account');
}

function createAccount() {
  data = {
    username: $('#account-username').val(),
    password: $('#account-password').val(),
    firstName: $('#account-first-name').val(),
    lastName: $('#account-last-name').val(),
    screenName: $('#account-screen-name').val()
  }

  $.ajax({
    url: API_URL + '/users',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: createAccountSuccess,
    error: createAccountError
  });
}

function createAccountError(xhr) {
  let message;
  if(xhr.responseText) {
    const xhrResponse = JSON.parse(xhr.responseText);
    message = xhrResponse.location ? xhrResponse.location + ' ' : '';
    message += xhrResponse.message;
  } else {
    message = "There has been an error in creating your account."
  }
  $('.create-account-message')
    .text(message)
    .css('display', 'block');
}

function createAccountSuccess() {
  loginUser($('#account-username').val(), $('#account-password').val());
}

function handleAccountCreate() {
  $('.create-account-form').off().submit(event => {
    event.preventDefault();
    createAccount();
  });
}