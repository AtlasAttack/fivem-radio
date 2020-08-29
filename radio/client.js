const customRadios = [];
let isPlaying = false;
let index = -1;
let volume = GetProfileSetting(300) / 20;
let previousVolume = volume;
let broadcastTime = 0;

for (let i = 0, length = GetNumResourceMetadata("lobb-radio", "supersede_radio"); i < length; i++) {
    const radio = GetResourceMetadata("lobb-radio", "supersede_radio", i);

    if (!availableRadios.includes(radio)) {
        console.error(`radio: ${radio} is an invalid radio.`);
        continue;
    }

    try {
        const data = JSON.parse(GetResourceMetadata("lobb-radio", "supersede_radio_extra", i));
        if (data !== null) {
            customRadios.push({
                "isPlaying": false,
                "name": radio,
				"duration": data.duration,
                "data": data
            });
            if (data.name) {
                AddTextEntry(radio, data.name);
            }
        } else {
            console.error(`radio: Missing data for ${radio}.`);
        }
    } catch (e) {
        console.error(e);
    }
}

RegisterNuiCallbackType("radio:ready");
on("__cfx_nui:radio:ready", (data, cb) => {
	console.log("Lobb Radio ready");
    SendNuiMessage(JSON.stringify({ "type": "create", "radios": customRadios, "volume": volume }));
    previousVolume = -1;
});
SendNuiMessage(JSON.stringify({ "type": "create", "radios": customRadios, "volume": volume }));

const PlayCustomRadio = (radio) => {
    isPlaying = true;
    index = customRadios.indexOf(radio);
    ToggleCustomRadioBehavior();
    SendNuiMessage(JSON.stringify({ "type": "play", "radio": radio.name }));
	SendNuiMessage(JSON.stringify({ "type": "seek", "time": broadcastTime }));
};

const StopCustomRadios = () => {
    isPlaying = false;
    ToggleCustomRadioBehavior();
    SendNuiMessage(JSON.stringify({ "type": "stop" }));
};

const ToggleCustomRadioBehavior = () => {
    SetFrontendRadioActive(!isPlaying);

    if (isPlaying) {
        StartAudioScene("DLC_MPHEIST_TRANSITION_TO_APT_FADE_IN_RADIO_SCENE");
    } else {
        StopAudioScene("DLC_MPHEIST_TRANSITION_TO_APT_FADE_IN_RADIO_SCENE");
    }
};

onNet("radio:setBroadcastTime", (timeValue) => {
	broadcastTime = timeValue;
    
});

setInterval(function(){ 
       broadcastTime += 1;
	   //console.log("Broadcast time: "+broadcastTime);
}, 1000);

setTick(() => {
    if (IsPlayerVehicleRadioEnabled()) {
        let playerRadioStationName = GetPlayerRadioStationName();

        let customRadio = customRadios.find((radio) => {
            return radio.name === playerRadioStationName;
        });
		if(customRadio && broadcastTime >= customRadio.duration){
			//console.log("Resetting local broadcast time!")
			//broadcastTime = 0;
		}else{
			//console.log("Broadcast time: "+broadcastTime);
		}
        if (!isPlaying && customRadio) {
            PlayCustomRadio(customRadio);
        } else if (isPlaying && customRadio && customRadios.indexOf(customRadio) !== index) {
            StopCustomRadios();
            PlayCustomRadio(customRadio);
        } else if (isPlaying && !customRadio) {
            StopCustomRadios();
        }
    } else if (isPlaying) {
        StopCustomRadios();
    }


    volume = GetProfileSetting(300) / 20;
    if (previousVolume !== volume) {
        SendNuiMessage(JSON.stringify({ "type": "volume", "volume": volume }));
        previousVolume = volume;
    }
});
