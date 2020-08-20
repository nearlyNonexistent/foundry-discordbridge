"""Core cog for basic administrative functionality, MUST be loaded."""
from discord.ext import commands
import inspect


class Administration(commands.Cog):
    """Core bot functions manager; reloading modules and configuration."""
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @commands.is_owner()
    async def exit(self, ctx):
        """Close the bot. (Owner only.)"""
        await ctx.message.add_reaction("💤")
        await ctx.bot.logout()

    @commands.command(name='load', hidden=True)
    @commands.is_owner()
    async def load_cog(self, ctx, *, cog: str):
        """Command which Loads a Module.
        Remember to use dot path. e.g: cogs.owner"""
        try:
            self.bot.load_extension(f"cogs.{cog}")
        except Exception as e:
            await ctx.send(f'**`ERROR:`** {type(e).__name__} - {e}')
        else:
            await ctx.message.add_reaction("👍")

    @commands.command(name='unload', hidden=True)
    @commands.is_owner()
    async def unload_cog(self, ctx, *, cog: str):
        """Command which Unloads a Module.
        Remember to use dot path. e.g: cogs.owner"""
        try:
            self.bot.unload_extension(f"cogs.{cog}")
        except Exception as e:
            await ctx.send(f'**`ERROR:`** {type(e).__name__} - {e}')
        else:
            await ctx.message.add_reaction("👍")

    @commands.command(name='reload', hidden=True)
    @commands.is_owner()
    async def reload_cog(self, ctx, *, cog: str):
        """Command which Reloads a Module.
        Remember to use dot path. e.g: cogs.owner"""
        try:
            self.bot.unload_extension(f"cogs.{cog}")
            self.bot.load_extension(f"cogs.{cog}")
        except Exception as e:
            await ctx.send(f'**`ERROR:`** {type(e).__name__} - {e}')
        else:
            await ctx.message.add_reaction("👍")

    @commands.command(hidden=True)
    @commands.is_owner()
    async def reload_config(self, ctx):
        """Reload configuration file."""
        try:
            self.bot.set_config(self.bot.cli_args)
        except Exception as e:
            await ctx.send(f'**`ERROR:`** {type(e).__name__} - {e}')
        else:
            await ctx.message.add_reaction("👍")

    @commands.command(name='eval', pass_context=True, hidden=True)
    @commands.is_owner()
    async def eval_(self, ctx, *, command):
        res = eval(command)
        if inspect.isawaitable(res):
            await ctx.send(await res)
        else:
            await ctx.send(res)

    @commands.Cog.listener()
    async def on_ready(self):
        """Notify the prompt."""
        print("Bot ready.")


def setup(bot):
    bot.add_cog(Administration(bot))
