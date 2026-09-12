export PYTHONPATH=.

.PHONY: run-models run-mobile-clip run-siglip2

run-models:
	uv run python -m models.run

run-mobile-clip:
	bash scripts/run_model.sh mobile_clip MobileCLIP2-S0 dfndr2b

run-siglip2:
	bash scripts/run_model.sh siglip2 google/siglip2-base-patch16-224 webli

test-utils:
	uv run python utils.py