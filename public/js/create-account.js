function initCreateAccount(){
  $('#account-username').val('');
  $('#account-password').val('');
  $('#account-firstName').val('');
  $('#account-lastName').val('');
  $('#account-screenName').val(''); 
  $('.account-create-message').css('display', 'none');
  handleAccountCreate();
}

function createAccount() {
  data = {
    username: $('#account-username').val(),
    password: $('#account-password').val(),
    firstName: $('#account-firstName').val() || '',
    lastName: $('#account-lastName').val() || '',
    screenName: $('#account-screenName').val() || ''
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

function createAccountError(xhr, status, error) {
  let message;
  const xhrResponse = JSON.parse(xhr.responseText);
  message = xhrResponse.location ? xhrResponse.location + ' ' : '';
  message += xhrResponse.message;

  $('.account-create-message')
  .text(message)
  .css('display', 'block');
  handleAccountCreate();
}

function createAccountSuccess() {
  loginUser($('#account-username').val(), $('#account-password').val());
}

function handleAccountCreate() {
  $('.create-account-form').off().submit(function(event) {
    event.preventDefault();
    createAccount();
  });
}