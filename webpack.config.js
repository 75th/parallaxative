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
			'dist/parallaxative': './src/parallaxative.js?es5',
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
	}
];
