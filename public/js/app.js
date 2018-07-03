
function getLatestDreams(callback) {
  setTimeout(() => callback(MOCK_LATEST_DREAMS), 100);
}

function displayLatestDreams(data) {
  $('main').prop('hidden', false);

  let htmlString = `
    <div class="row">
      <div class="col-12">
        <ul class="dream-list"> 
  `;
  for(index in data.latestDreams) {
    htmlString += `
      <li>
        <a href="javascript:void(0)">${data.latestDreams[index].title}</a>
        <span class="author">by ${data.latestDreams[index].userName}</span>
        <span class="date">- ${new Date(data.latestDreams[index].publishDate).toDateString()}</span>
      </li>
    `;
  }
  htmlString += `
        </ul>
      </div>
    </div>
  `;
  $('main').html(htmlString);
 
}

function getAndDisplayLatestDreams() {
  getLatestDreams(displayLatestDreams);
}

function startApp() {
  getAndDisplayLatestDreams();
}
$(startApp);