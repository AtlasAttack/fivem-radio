resource_manifest_version "44febabe-d386-4d18-afbe-5e627f4af937"

-- Example custom radios
supersede_radio "RADIO_16_SILVERLAKE" { url = "http://calebcreates.tech/radio_one.ogg", volume = 0.5, name = 'Paragon Radio\nECB Unlimited', duration = 240.0 }


files {
	"index.html"
}

ui_page "index.html"

client_scripts {
	"data.js",
	"client.js"
}
