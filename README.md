# Find the first m.room.member state event in a room for a user

Follow the state chain for `m.room.member` events for a user in a room to find where they first joined or who
originally invited them.

Copy `config.example.json` to `config.json`, set server URL (where the client-server API is exposed)
and your access token. Optionally also set the room and user ID. If not set, the script will ask you.

`roomId` also accepts a room alias.

Only tested with Node 16

```bash
node index.js
Room ID: !someRoom:matrix.org
Matrix ID: @example:matrix.org
{
  content: { displayname: 'example', membership: 'invite' },
  origin_server_ts: 1600000000000,
  room_id: '!someRoom:matrix.org',
  sender: '@someone-else:matrix.org',
  state_key: '@example:matrix.org',
  type: 'm.room.member',
  unsigned: { age: 7400000000 },
  event_id: '$anEventId',
  user_id: '@someone-else:matrix.org',
  age: 74000000000
}
```
