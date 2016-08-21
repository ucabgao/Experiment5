.PHONY: all test clean

default: help

help:
	@echo "   \033[35mmake\033[0m \033[1m命令使用说明\033[0m"
	@echo "   \033[35mmake install\033[0m\t---  安装依赖"
	@echo "   \033[35mmake build\033[0m\t---  生成dist文件"
	@echo "   \033[35mmake test\033[0m\t---  执行单元与UI测试"
	@echo "   \033[35mmake deploy\033[0m\t---  生成发布代码"
	@echo "   \033[35mmake example\033[0m\t---  发布测试页面到gh-page分支"
	@echo "   \033[35mmake dev\033[0m\t---  开发模式（在 build 的基础上 watch 文件变化并自动 build）"
	@echo "   \033[35mmake clean\033[0m\t---  清除已经安装的依赖及缓存"

install:
	@hash="cache-restfulapisdk-$$(cat Makefile package.json | openssl sha1 | tail -c33)"; \
	path="/tmp/$$hash"; \
	src="$$(pwd)"; \
	if [ -d $$path ] && [ -d $$path/node_modules ]; then \
	  if [ ! -d node_modules ]; then \
	    echo "\033[1mLoad\033[0m \033[35mnode_modules\033[0m from \033[32m$$hash\033[0m."; \
	    cp -R $$path/* $$src; \
	  fi; \
	else \
	  if which cnpm > /dev/null; then \
	    cnpm install; \
	  else \
	    npm install; \
	  fi; \
	  mkdir -p $$path; \
	  cp -R $$src/node_modules $$path; \
	fi; \

build: install
	@npm run build

test: build
	@mocha test/unit.js && mocha-casperjs test/ui.js

cover:
	@npm run test-travis

deploy: install
	@npm run deploy

example: deploy
	@if [ ! -d ghpages ]; then \
		git clone git@github.com:youngerheart/restfulapi-sdk.git --branch gh-pages ghpages; \
	fi; \
	cp dist/index.min.js ghpages/dist && cd ghpages && git add .; \
	git commit -m "update ghpages" && git push origin gh-pages -f

dev: install
	@npm run watch && node server.js


clean:
	@echo "正在清除 ... \c"
	@rm -rf {*/**/node_modules,*/**/tmp/cache-undefined-*}
	@echo "\033[32m完成\033[0m"
