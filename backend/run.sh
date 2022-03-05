#!/bin/sh
uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT --reload --use-colors --log-config log_conf.json