function showDreamDetail(dream) {
  // <h1 class="dream-title">Golden Girls</h1>
  // <h2><span class="dream-author">sreynolds</span> <span class="dream-publish-date">11/12/2017</span></h2>
  // <p class="dream-text">I was dreaming last night of watching a standup comic, who was telling some really hilarious jokes I hadn't heard before. "I wish I could steal these jokes," I thought to myself. The dream then started going a little lucid; I realized I was dreaming. This led me to realize, "wait, if I'm dreaming, therse are my jokes!" I resolved to remember them. Of course, when I woke up I remembered the dream but can't remember a damned one of the jokes.</p>
  // <button class="back">Back</button>
  console.log('got here');
  $('.dream-title').text(dream.title);
  $('.dream-author').text(dream.userName);
  $('.dream-publish-date').text(new Date(dream.publishDate).toDateString());
  $('.dream-text').text(dream.text);
  showView('dream-detail');
  handleDreamDetailBackClick();
}

function handleDreamDetailBackClick() {
  $('.dream-back').click(function() {
    showView('recent-dreams');
  });
}