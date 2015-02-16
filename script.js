window.onload = function() {
	document.getElementById('solve').onclick = function() {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			chrome.tabs.executeScript({
				file: 'run.js'
			});
			window.close();
		});
	};
};