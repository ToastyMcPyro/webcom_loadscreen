fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'webcom_loadscreen'
author 'WebCom'
description 'Drag-and-Drop Loadscreen Creator with Collaborative Editing & Dashboard Integration'
version '1.0.0'

dependency 'oxmysql'
dependency 'ox_lib'

webcom_module_name 'loadscreen'
webcom_module_version '1.0.0'
webcom_module_capabilities '["loadscreen.edit","loadscreen.deploy","loadscreen.view"]'

-- FiveM native loadscreen (shown during game loading)
loadscreen 'html/loadscreen/index.html'
loadscreen_manual_shutdown 'yes'
loadscreen_cursor 'yes'

-- In-game NUI editor overlay
ui_page 'html/editor/index.html'

shared_scripts {
    '@ox_lib/init.lua',
    'shared/enums.lua',
    'shared/utils.lua',
    'config.lua',
}

client_scripts {
    'client/cl_editor.lua',
    'client/cl_collaboration.lua',
    'client/cl_main.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/sv_storage.lua',
    'server/sv_permissions.lua',
    'server/sv_collaboration.lua',
    'server/sv_discord.lua',
    'server/sv_playtime.lua',
    'server/sv_loadscreen.lua',
    'server/sv_dashboard.lua',
    'server/sv_media.lua',
    'server/sv_main.lua',
}

files {
    'html/loadscreen/index.html',
    'html/loadscreen/css/*.css',
    'html/loadscreen/js/*.js',
    'html/loadscreen/media/music/*',
    'html/loadscreen/media/video/*',
    'html/loadscreen/media/manifest.json',
    'html/editor/index.html',
    'html/editor/css/*.css',
    'html/editor/js/*.js',
    'sql/install.sql',
    'sql/seed-templates.sql',
}
