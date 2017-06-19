chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.time !== undefined && request.descriptions !== undefined) {
      setTime(request.time);
      setMessage(request.descriptions.join("; "));
      sendResponse({ success : true });
    } else {
      sendResponse({ success : false, message : "There was an error adding the time to the page. Please try again." });
    }
  }
)

function setTime(time) {
	var timeInput = document.getElementById('ctl00_ctl00_ctl00_ctl00_ContentPlaceHolder1_ContentPlaceHolder1_ContentPlaceHolder1_ContentPlaceHolder1_TimeUsed');
	timeInput.value = time;
}

function setMessage(message) {
	var messageInput = document.getElementById('ctl00_ctl00_ctl00_ctl00_ContentPlaceHolder1_ContentPlaceHolder1_ContentPlaceHolder1_ContentPlaceHolder1_txtWorkPerformed');
	messageInput.value = message;
}
