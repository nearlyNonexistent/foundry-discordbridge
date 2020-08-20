"""This cog handles the FoundryVTT ==> Discord chat."""
from discord.ext import commands
from discord import Embed
from datetime import datetime
from markdownify import markdownify as md


class FVTTBridge(commands.Cog):
    """Chat-bridging."""

    def __init__(self, bot):
        self.bot = bot
        self.db = self.bot.db
        self.search = self.bot.search

    @commands.group()
    async def rpb(self, ctx):
        """Commands for handling the RPBridge."""
        pass

    @rpb.command(aliases=['delete'])
    @commands.is_owner()
    async def remove(self, ctx, message_id):
        """Delete the message ID from the channel and the search database.
        Good for accidental leaks of GM secrets."""
        self.db.remove(self.search.message == int(message_id))
        message = await ctx.channel.fetch_message(int(message_id))
        await message.delete()
        await ctx.message.add_reaction("👍")

    @rpb.command()
    async def search(self, ctx, campaign, user, *, contents):
        """Search the database by campaign and by-character.
        Alternative to Discord search which can't handle webhook author."""
        results = self.db.search((self.search.doctype == "rpbridge") &
                                 (self.search.user == user) &
                                 (self.search.campaign == campaign))
        results_formatted = ""
        embed = Embed(title="Search Results",
                      description="This may not include all matches.",
                      color=0x478732)
        for i in results:
            if contents.lower() in i["contents"].lower():
                message = await ctx.fetch_message(i["message"])
                if len(i["contents"]) > 40:
                    preview = i["contents"][0:40]
                else:
                    preview = i["contents"]
                embed.add_field(name=i["timestamp"],
                                value=f'["{preview}..."]({message.jump_url})',
                                inline=True)
        await ctx.send(results_formatted, embed=embed)

    async def _send(self, json):
        """/message POST
        This is called by the REST API to send messages
        Messages are handled separately due to them being logged.
        Embeds are not logged.
        Messages are saved to the database and sent out via the webhook.
        The input argument is a json object cast to a dict by the webserver.
        It must contain the user, campaign, contents, and avatar URL.
        The campaign field must match up to a pre-configured campaign.
        It handles where the message should be sent, and which webhook."""
        campaign_entry = self.db.search((self.search.doctype == "campaign") &
                                        (self.search.campaign
                                        == json["campaign"]))
        if not campaign_entry:
            return
        else:
            campaign_entry = campaign_entry[0]
        json["content"] = md(json["content"])
        note_data = {"doctype": "rpbridge",
                     "user": json["user"],
                     "campaign": json["campaign"],
                     "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                     "contents": json["content"]}
        webhook = await self.bot.fetch_webhook(campaign_entry["webhook"])
        message = await webhook.send(json["content"],
                                     wait=True,
                                     username=json["user"],
                                     avatar_url=json["avatar_url"])
        note_data["message"] = message.id
        self.db.insert(note_data)

    async def _embed(self, json):
        """/embed POST
        This is called by the REST API to send embeds.
        Embeds are handled separately because they are not logged.
        The input argument is a json object cast to a dict by the webserver.
        It must contain all the fields that _send messages must.
        In addition, it must contain a nested object called embed.
        Embed must contain the author, color, title, etc.
        They can also contain key-value field pairs."""
        campaign_entry = self.db.search((self.search.doctype == "campaigns") &
                                        (self.search.campaign
                                        == json["campaign"]))
        campaign_entry = campaign_entry[0]
        if not campaign_entry:
            return
        embed = Embed(title=json["embed"]["title"],
                      description=json["embed"]
                      ["description"],
                      color=int(json["embed"]["color"]))
        embed.set_author(name=json["embed"]["author"],
                         icon_url=json["embed"]["avatar_url"])
        if len(json["embed"]["fields"]) > 0:
            for field in json["embed"]["fields"]:
                embed.add_field(name=field["name"],
                                value=field["value"],
                                inline=False)
        if json["embed"]["image"]:
            embed.set_thumbnail(url=json["embed"]["image"])
        embed.set_footer(text=json["embed"]["footer"])
        webhook = await self.bot.fetch_webhook(campaign_entry["webhook"])
        await webhook.send(json["content"],
                           wait=True,
                           username=json["user"],
                           avatar_url=json["avatar_url"],
                           embed=embed)

    @rpb.group()
    async def campaign(self, ctx):
        """Commands for handling the Campaigns."""
        pass

    @campaign.command(aliases=['remove'])
    @commands.is_owner()
    async def delete(self, ctx, campaign: str):
        """Remove a campaign and all its messages from the search tool.
        You must delete the channel's messages yourself."""
        webhook = self.db.search((self.search.doctype == "campaign") &
                                 (self.search.campaign == campaign))
        webhooky = await self.bot.fetch_webhook(webhook[0]["webhook"])
        await webhooky.delete()
        self.db.remove((self.search.doctype == "campaign") &
                       (self.search.campaign == campaign))
        self.db.remove((self.search.doctype == "rpbridge") &
                       (self.search.campaign == campaign))
        await ctx.message.add_reaction("👍")

    @campaign.command(aliases=['new'])
    @commands.is_owner()
    async def add(self, ctx, campaign: str):
        """Add a new campaign.
        The campaign with the matching Title given will post here."""
        new_webhook = await ctx.channel.create_webhook(
            name=f"FVTT Bridge - {campaign}")
        self.db.insert({"doctype": "campaign",
                        "campaign": campaign,
                        "channel": ctx.channel.id,
                        "webhook": new_webhook.id})
        await ctx.message.add_reaction("👍")

    @campaign.command()
    @commands.is_owner()
    async def move(self, ctx, campaign: str):
        """Moves a campaign to the channel you use this command in."""
        webhook = self.db.search((self.search.doctype == "campaigns") &
                                 (self.search.campaign == campaign))
        webhooky = await self.bot.fetch_webhook(webhook[0]["webhook"])
        await webhooky.delete()
        new_webhook = ctx.channel.create_webhook(
            name=f"FVTT Bridge - {campaign}")
        self.db.update({"channel": ctx.channel.id, "webhook": new_webhook.id},
                       (self.search.doctype == "campaigns") &
                       (self.search.campaign == campaign))
        await ctx.message.add_reaction("👍")


def setup(bot):
    """Load the cog."""
    bot.add_cog(FVTTBridge(bot))
