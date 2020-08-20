#!/usr/bin/env python3
from tinydb import TinyDB, Query
import json
import traceback
from asyncio import get_event_loop
import aiohttp_cors
from discord.ext import commands
from aiohttp.web import AppRunner, Application, TCPSite

from api import routes


class DiscordFoundry(commands.Bot):
    """Bot extension to enable higher-level configuration."""
    def __init__(self, formatter=None,
                 pm_help=False, **options):
        with open("config.json") as conf:
            self.config = json.load(conf)
        self.prefix = self.config["prefix"]
        self.db = TinyDB(self.config["db-path"])
        self.search = Query()
        super().__init__(self.config["prefix"], formatter=formatter,
                         description=self.config["description"],
                         pm_help=pm_help, **options)
        for extension in self.config["initial_extensions"]:
            try:
                self.load_extension(f"cogs.{extension}")
            except Exception:
                print(f'Failed to load extension {extension}.')
                traceback.print_exc()


async def run_bot():
    app = Application()
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
            )
    })
    app.add_routes(routes)
    for route in list(app.router.routes()):
        cors.add(route)
    runner = AppRunner(app)
    await runner.setup()
    with open("config.json") as conf:
        conf = json.load(conf)
        site = TCPSite(runner, conf["ip"], conf["port"])
    bot = DiscordFoundry()
    app['bot'] = bot
    app['cors'] = cors
    await site.start()
    try:
        await bot.start(bot.config["token"])
    except Exception:
        await bot.close(),
        raise
    finally:
        await runner.cleanup()

if __name__ == '__main__':
    loop = get_event_loop()
    loop.run_until_complete(run_bot())
print("Exited successfully.")
