.PHONY: build;

build : index.js ;

index.js : $(wildcard lib/*.ts)
	tsc lib/Ossuary.ts --module amd --outFile lib/index.js