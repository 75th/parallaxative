document.addEventListener('DOMContentLoaded', function() {
	window.scrollAnimations = [];

	window.scrollAnimations.push(
		new Px.ScrollAnimation('div.target h1'),

		new Px.ParallaxAnimation(
			'blockquote .bg',
			{
				valueSets: new Px.ParallaxAnimationValueSet({
					scrollPixelsPerParallaxPixel: 2
				})
			}
		)
	);
});