# tess-exercise

## Installation

 `npm install`

## Run App

`node app.js`

Application runs on url ::  `http://localhost:9820`


### User Endpoints

- Register user

```
POST /user/register
Request:
{
    "name": "bob",
    "disability": 0|1
}

Response:
{
    "status": 200,
    "users": {
        "_id": "60c5eb44e270a14bec3ba022",
        "name": "bob",
        "disability": 1,
        "createdAt": "2021-06-13T11:25:56.682Z",
        "updatedAt": "2021-06-13T11:25:56.682Z",
        "__v": 0
    }
}
```


- List all users
```
GET /user/list
```


--------------------------------------------------------------

 ------------------------------


### Parking Slots Endpoints
 - Add new parking slot 
 ```
 POST /park/new-slot

{}
 ```
 - Get current statistics of parking slots
  ```
  GET /park/stats
  ```
 - get total available slots for booking
 ```
 GET /park/available
 ```

 - get total booked slots
 ```
 GET /park/booked
 ```

 - book a new slot
 ```
 POST /park/book
 Request:
 {
    "name": "kat",
    "quota": "general|reserved"
 }

 Response:
 {
    "status": 200,
    "booked_at": "2021-06-13T10:37:38.609Z",
    "token": "kpv205v6"
}
 ```

 - claim the booked parking slot
 ```
 POST /park/checkin
 Request:
 {
    "token": "kpv205v6",
 }

 Response:
 {
    "status": 200,
    "expires_at": "2021-06-13T10:37:38.609Z"
}
 ```
