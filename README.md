## README(Backend)

run this command to start the backend

```shell
python manage.py runserver
```

open in

[127.0.0.1/8000](127.0.0.1/8000)

---

URL configuration defined in `game/urls.py`

- `/admin/`: Django admin panel accessible for site administration.
  - username:`admin`
  - email: `admin@ut.ee`
  - password:`admin`
- `/game/`: Endpoint for game-related functionalities.
- `/__debug__/`: Debugging endpoint for debugging purposes.

---

## Game Join API

### Endpoint:
`/game/join`

### Method:
POST

### Request Parameters:
- `nickname` (string): The nickname of the player.
- `role` (string): The role the player wants to assume in the game (e.g., "hider" or "seeker").
- `roomId` (string): The ID of the room the player wants to join.

### Request Body Example:
```json
{
    "nickname": "Paul",
    "role": "hider",
    "roomId": "Caladan"
}