# Parallaxative

A vanilla JS library to help those who must implement parallax under duress. Contains several classes to help run code based on the viewport position of an HTML element.

This seems to work decently in most circumstances, but the API is very ugly; it needs massive cleanup and documentation improvements. Use at your own risk.

Special thanks to [Barry T. Smith](https://twitter.com/thebarrytone) for the [excellent name](http://motherfuckingwebsite.com)

## Usage

`/src/parallaxative.js` is an ES7 module; `/dist/parallaxative.min.js` is an ES5 script you can shove into a `<script>` tag. They both offer utility classes with no default side effects.

The classes are *kind of* documented in the module file; friendlier documentation here is on my TODO list.

`/demo/demo.js` has very basic examples of how to use `ScrollAnimation` and `ParallaxAnimation`. Again, the API is super ugly; see the TODO below to get an idea of the improvements I want to make.

### Development and demo

`npm install`, as always. Then `npm run build` to compile changes, or `npm run demo` to launch the demo page.

## Included classes

### `ScrollDetector`

Give its constructor an HTMLElement, and its methods will give you a float representing its relative progress across your screen:

- **0** means it's one pixel away from scrolling onto the bottom of the screen
- **1** means it's just barely scrolled off the top of the screen
- All other values are interpreted linearly

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


## TODO

(*roughly in order of importance*)

- [ ] Add necessary default CSS for `ParallaxAnimation`s
- [ ] Document all classes extensively in code and in readme
- [ ] Accept strings/dicts everywhere objects are now required
    - Accept a media query string instead of a MediaQueryList object
    - Accept a dict with options instead of an object already instantiated
      with those options
    - *Et cetera*
- [ ] Accept single objects everywhere arrays of objects are now required
- [ ] Disable `ParallaxAnimation`s in IE by default?
- [ ] Clean up or eliminate the `AnimationValueSet` classes
    - If not eliminate, then maybe add `ParallaxAnimationValueSet.prototype.getCSSValue()`? I can't remember at the moment whether it makes sense to do that
- [ ] Substantially improve the power and flexibility of the `ScrollTrigger` class
- [ ] Implement `startPosition` and `endPosition` options in `ScrollAnimation`
- [ ] Enhance  `ScrollDetector.prototype.relativeScrollPosition()` to base the `0` and `1` points at places other than immediately before/after the element scrolls onto/off the screen
    - Enhance `ScrollAnimation` and `ScrollTrigger` to allow the above
- [ ] Conditionally accept CSS versions of style property names
- [ ] Conditionally autoprefix CSS/JS style property names