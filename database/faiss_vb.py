import sys
from PIL import Image
import open_clip
import faiss
import torch
import asyncio
import websockets
import json
import pandas as pd
import os
import re
from websockets.exceptions import ConnectionClosedOK

