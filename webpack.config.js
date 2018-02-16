const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractSass = new ExtractTextPlugin({
    filename: "[name].css"
});

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
		module: {
			rules: [
				{
					test: /demo\.js/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: ['env'],
								plugins: ['transform-object-assign']
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
			'demo/demo': './demo/demo.scss'
		},
		output: {
			filename: '[name].css',
			path: __dirname
		},
		devtool: 'source-map',
		module: {
			rules: [
				{
					test: /\.scss/,
					exclude: /node_modules/,
					use: extractSass.extract({
						use: [
							{
								loader: 'css-loader',
								options: {
									sourceMap: true,
									url: false
								}
							},
							{
								loader: 'sass-loader',
								options: {
									sourceMap: true
								}
							}
						]
					})
				}
			]
		},
		externals: {
			images: /\.(gif|jpg|jpeg|png)$/
		},
		plugins: [ extractSass ]
	},
	{
		entry: {
			'dist/parallaxative': './src/parallaxative.js?es5'
		},
		output: {
			filename: '[name].min.js',
			path: __dirname,
			library: 'Parallaxative'
		},
		devtool: 'source-map',
		module: {
			rules: [
				{
					test: /parallaxative\.js$/,
					exclude: /node_modules/,
					use: [
						'uglify-loader',
						{
							loader: 'babel-loader',
							options: {
								presets: ['env'],
								plugins: ['transform-object-assign']
							}
						},
						'eslint-loader'
					]
				}
			]
		}
	},
	{
		entry: {
			'dist/parallaxative': './src/parallaxative.css'
		},
		output: {
			filename: '[name].css',
			path: __dirname
		},
		module: {
			rules: [
				{
					test: /\.css/,
					exclude: /node_modules/,
					use: extractSass.extract({
						use: [
							{
								loader: 'css-loader',
								options: {
									sourceMap: false,
									url: false
								}
							}
						]
					})
				}
			]
		},
		externals: {
			images: /\.(gif|jpg|jpeg|png)$/
		},
		plugins: [ extractSass ]
	},
];
