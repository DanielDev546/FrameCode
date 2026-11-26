// @hutch cli=0.30.0 cottontail=0.7.3
export default {
	scripts: {
		start: ["hutch", "electrobun", "dev"],
		dev: ["hutch", "electrobun", "dev"],
		build: ["hutch", "electrobun", "build", "--env=stable"],
	},
	electrobun: {
		version: "2.0.7",
	},
};
