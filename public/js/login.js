function initLogin() {
  handleLoginSubmit();
}

function handleLoginSubmit() {
  $('#login-form').submit(function(event) {
    event.preventDefault();
    alert('click');
  });
}