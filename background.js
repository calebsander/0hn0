chrome.runtime.onInstalled.addListener(function() {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([
			{
				conditions: [
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: {
							hostSuffix: '0hn0.com'
						}
					})
				],
				actions: [
					new chrome.declarativeContent.ShowPageAction()
				]
			}
		]);
	});
});