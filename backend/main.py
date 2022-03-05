import base64
import hashlib
import os
import urllib
from datetime import datetime, timedelta
from pathlib import Path
from uuid import UUID, uuid4

from bson.binary import Binary, UuidRepresentation
from bson.codec_options import DEFAULT_CODEC_OPTIONS, CodecOptions
from dateutil import parser
from fastapi import Cookie, Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from loguru import logger
from pymongo import MongoClient

logger = logger.opt(colors=True)

mongo_connection_string = (
    os.environ["MONGO_CONNECTION_STRING"]
    if "MONGO_CONNECTION_STRING" in os.environ
    else "localhost"
)

client = MongoClient(mongo_connection_string)
db = client.health
std_opts = CodecOptions(uuid_representation=UuidRepresentation.STANDARD)
events_collection = db.get_collection("events", codec_options=std_opts)

app = FastAPI()

# HOME
@app.get("/")
async def home():
    return FileResponse("static/index.html")


# STATIC
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

# API
@app.get("/api/water/{start}/{end}")
async def water_since(start, end):
    start = parser.parse(start)
    end = parser.parse(end)
    water = 0
    events = list(
        events_collection.find(
            {"$and": [{"time": {"$gt": start}}, {"time": {"$lt": end}}]}
        )
    )
    for event in events:
        if "water" in event:
            water += event["water"]
    logger.info(f"Got {water}mL of water between: {start} - {end}")
    return water


@app.get("/api/panodil")
async def panodil():
    latest = datetime.fromtimestamp(0)
    for panodil_event in events_collection.find({"panodil": {"$exists": True}}):
        latest = max(panodil_event["time"], latest)
    logger.info(f"Last Panodil {datetime.now().astimezone() - latest.astimezone()} ago")
    return latest.astimezone()
