#!/usr/bin/python
import sys
import os

python = sys.executable
os.execl(python, python, *sys.argv)