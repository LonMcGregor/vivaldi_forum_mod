fx_vfm.xpi: _locales/* icons/* mods/* options/* themes/* background.js default.css default.js manifest.json mods.js theme.js
	zip -0r $@ $?

android: fx_vfm.xpi
	/mnt/c/android/adb.exe push fx_vfm.xpi /storage/emulated/0/

firefox: fx_vfm.xpi
	/mnt/c/Program\ Files/Firefox\ Developer\ Edition/firefox.exe fx_vfm.xpi &
