#!/usr/bin/python

from datetime import datetime
import pymongo
import click

client = pymongo.MongoClient("localhost", 27017)
collection = client.health.events

@click.group()
def cli():
    pass

@cli.command()
@click.option("--water", "-w", type=int, required=True, help="Amount of water drank in ml")
def water(water):
    """Registers that x ml of water was drank now"""
    collection.insert_one({"time": datetime.now().astimezone(), "water": water})

@cli.command()
@click.option("--amount", "-a", type=int, required=True, help="Amount of panodil pills taken")
def panodil(amount):
    """Registers that x amount of panodil pills was taken now"""
    collection.insert_one({"time": datetime.now().astimezone(), "panodil": amount})

@cli.command()
@click.option("--inhales", "-i", type=int, required=True, help="Amount of inhales")
def symbicort(inhales):
    """Registers that x inhales of Symbicort medicin was taken"""
    collection.insert_one({"time": datetime.now().astimezone(), "symbicort-inhales": inhales})

@cli.command()
@click.option("--comment", "-c", type=str, default=None, help="Optional comment")
def headache(comment):
    """Registers a headache"""
    obj = {"time": datetime.now().astimezone(), "headache": True}
    if comment:
        obj["comment"] = comment

    collection.insert_one(obj)

if __name__ == '__main__':
    cli()
