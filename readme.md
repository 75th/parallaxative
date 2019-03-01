# Parallaxative

A vanilla JS library to help those who must implement parallax under duress. Contains several classes to help run code based on the viewport position of an HTML element.

This seems to work decently in most circumstances, but the API is in the process of being cleaned up substantially, and it needs massive documentation improvements. Use at your own risk.

Special thanks to [Barry T. Smith](https://twitter.com/thebarrytone) for the [excellent name](http://motherfuckingwebsite.com)

## Usage

`/src/parallaxative.js` is an ES7 module; `/dist/parallaxative.min.js` is an ES5 script you can shove into a `<script>` tag. They both offer utility classes with no default side effects.

The classes are *kind of* documented in the module file; friendlier documentation here is on my TODO list.

`/demo/demo.js` has very basic examples of how to use `ScrollAnimation` and `ParallaxAnimation`.

See the [issue queue](https://github.com/75th/parallaxative/issues) to get an idea of the improvements I want to make.

### Development and demo

~~`npm install`, as always. Then `npm run build` to compile changes, or `npm run demo` to launch the demo page.~~

Bundling and demo preview are now handled by [CodeKit](https://codekitapp.com/) (version 3.8 or higher). Webpack and all other JavaScript-based build tools are abominations whose primary benefit is providing security vulnerabilities for GitHub to detect and pester you about.



## Included classes

### `ScrollDetector`

Give its constructor an HTMLElement, and its methods will give you a float representing its relative progress across your screen:

- **0** means it's one pixel away from scrolling onto the bottom of the screen
- **1** means it's just barely scrolled off the top of the screen
- All other values are interpolated linearly

A constructor option allows you to track horizontal instead of vertical scrolling, and all the classes below work (or can easily be made to work) with horizontal scrolling as well.

### `ScrollTrigger`

Give its constructor a `ScrollDetector`, a function, and a float, and it will run the function when the `ScrollDetector` is greater than or equal to the float.

This class is most unfinished one in the library.

### `ScrollAnimationValueSet`

This class manages the CSS values for a `ScrollAnimation`; it doesn't do much beyond merging supplied options with default options. I need to think about whether this class should even exist, or just be rolled into `ScrollAnimation` itself.

### `ScrollAnimation`

Changes an element's `style` attribute on scroll (throttled by `requestAnimationFrame`) based on the output of a `ScrollDetector` and the CSS rules you describe in one or more `ScrollAnimationValueSet`s.

### `ParallaxAnimationValueSet`

Manages the CSS values for a `ParallaxAnimation`.

### `ParallaxAnimation`

A subclass of `ScrollAnimation` for the special case of a background element that needs to scroll at a precise factor of the speed at which the page is being scrolled. Handles proper sizing of the background element.