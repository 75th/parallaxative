module.exports = {
	"env": {
		"browser": true,
		"es6": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"sourceType": "module"
	},
	"rules": {
		"indent": [
			"warn",
			"tab",
			{
				"ignoredNodes": ["ConditionalExpression"],
				"SwitchCase": 1
			}
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"warn",
			"single"
		],
		"semi": [
			"error",
			"always"
		],
		"no-console": [
			"error",
			{
				"allow": [ "warn", "error" ]
			}
		]
	}
};