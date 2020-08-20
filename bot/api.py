from aiohttp import web

routes = web.RouteTableDef()


@routes.post('/message')
async def post_message(request):
    client = request.app['bot']
    json = await request.json()
    bridge = client.get_cog("FVTTBridge")
    await bridge._send(json)
    return web.Response(text="Success")


@routes.post('/embed')
async def post_embed(request):
    client = request.app['bot']
    json = await request.json()
    bridge = client.get_cog("FVTTBridge")
    await bridge._embed(json)
    return web.Response(text="Success")
