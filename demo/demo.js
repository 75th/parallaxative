document.addEventListener('DOMContentLoaded', function() {
	window.scrollers = [];
	window.scrollers.push(
		new Scroller(
			document.querySelector('div.target'),
			{},
			[new ScrollerAnimation([document.querySelector('.target h1')])]
		)
	);
});