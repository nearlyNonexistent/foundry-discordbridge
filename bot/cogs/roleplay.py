"""This cog provides basic roleplay utilities."""
# Third-party imports
import dice
from discord.ext import commands
from pyparsing import ParseException


class Roleplay(commands.Cog):
    """Provides a basic dice-roller, not integrated with FoundryVTT."""
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def roll(self, ctx, *, message: str):
        """Roll dice. Uses standard dice notation."""
        try:
            await ctx.send(f"Your dice roll: {dice.roll(message)}")
            await ctx.message.add_reaction("🎲")
        except ParseException:
            await ctx.send("Invalid dice roll!")


def setup(bot):
    """Load the cog."""
    bot.add_cog(Roleplay(bot))
