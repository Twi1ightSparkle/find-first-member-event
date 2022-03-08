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

async function main() {
    // Resolve alias if this is provided instead of Room ID
    if (roomId.startsWith('#')) {
        const resolveAlias = axios.create({
            baseURL: `https://${server}/_matrix/client/r0/directory/room/${roomId.replace('#', '%23')}`,
        });

        let response;
        try {
            response = await resolveAlias.get();
        } catch (err) {
            console.log(err.response?.data?.error ?? `Unknown error occurred resolving ${roomId}`);
            process.exit(1);
        }
        roomId = response.data.room_id;
    }

    // Axios config
    const headers = { Authorization: `Bearer ${token}` };
    const matrix = axios.create({
        baseURL: `https://${server}/_matrix/client/v3/rooms/${roomId}`,
        headers,
    });

    // Fetch all state from the room
    let response;
    try {
        response = await matrix.get('/state');
    } catch (err) {
        console.log(err.response?.data?.error ?? 'Unknown error occurred');
        process.exit(1);
    }

    // Find the latest m.room.member state event for the specified user
    let latestEvent;
    const state = response.data;
    for (const stateEvent of state) {
        if (stateEvent.type === 'm.room.member' && stateEvent.state_key === mxid) {
            latestEvent = stateEvent;
            break;
        }
    }

    // Follow chain until the first m.room.member event for user is reached
    while (latestEvent?.replaces_state) {
        response = await matrix.get(`/event/${latestEvent.replaces_state}`);
        latestEvent = response.data;
    }

    console.log(latestEvent ?? `No m.room.member event found in room ${roomId} for user ${mxid}`);
}

main().catch((err) => console.log(err));
