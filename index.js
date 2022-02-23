const fs = require('fs');
const axios = require('axios');
const prompt = require('prompt-sync')({ sigint: true });

let { server, token, roomId, mxid } = JSON.parse(fs.readFileSync('./config.json'));

if (!roomId) {
    roomId = prompt('Room ID: ');
}
if (!mxid) {
    mxid = prompt('Matrix ID: ');
}

// Axios config
const headers = { Authorization: `Bearer ${token}` };
const matrix = axios.create({
    baseURL: `https://${server}/_matrix/client/v3/rooms/${roomId}`,
    headers,
});

async function main() {
    let latestEvent;

    let response = await matrix.get('/state');
    const state = response.data;
    for (const stateEvent of state) {
        if (stateEvent.type === 'm.room.member' && stateEvent.state_key === mxid) {
            latestEvent = stateEvent;
        }
    }

    while (latestEvent?.replaces_state) {
        response = await matrix.get(`/event/${latestEvent.replaces_state}`);
        latestEvent = response.data;
    }

    console.log(latestEvent);
}

main().catch((err) => console.log(err));
