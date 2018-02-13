const path = require('path');
require('babel-preset-env');

module.exports = [
	{
		entry: {
			'demo/demo': './demo/demo.js'
		},
		output: {
			filename: '[name].min.js',
			path: __dirname
		},
		devtool: 'source-map',
		externals: /parallaxative/,
		module: {
			rules: [
				{
					test: /demo\.js/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: ['env']
							}
						}
					]
				}
			]
		},
		devServer: {
			contentBase: __dirname,
			openPage: 'demo/',
			port: 7575,
			open: true,
			host: "0.0.0.0"
		}
	},
	{
		entry: {
			'dist/parallaxative.es7': './src/parallaxative.js?es7',
			'dist/parallaxative.es5': './src/parallaxative.js?es5',
		},
		output: {
			filename: '[name].min.js',
			path: __dirname
		},
		devtool: 'source-map',
		module: {
			rules: [
				{
					test: /parallaxative\.js$/,
					exclude: /node_modules/,
					oneOf: [
						{
							resourceQuery: /es7/,
							use: [ 'uglify-loader', 'script-loader', 'eslint-loader' ]
						},
						{
							resourceQuery: /es5/,
							use: [
								'uglify-loader',
								{
									loader: 'babel-loader',
									options: {
										presets: ['env']
									}
								}
							]
						}
					]
				}
			]
		}
	}
];
