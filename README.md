# Example Matrix Tool

Example app for Matrix chat integration tools.

This app keeps track of roles within a group chat. It has a keyword that the app responds to ("example") and then the rest of the interface is put together from emoji reactions and replies.

## Getting started

1. Clone the repo or fork the REPL
1. Copy the `.env.example` file and rename `.env`
1. Register on Matrix ([app.element.io](https://app.element.io) is a popular way)
1. Copy your user id, homeserver and access token from Element into the `.env` file. Here is a screenshot: ![element user id](https://raw.githubusercontent.com/King-Mob/example-matrix-tool/refs/heads/main/element_user_id.png) ![element homserver and access token](https://raw.githubusercontent.com/King-Mob/example-matrix-tool/refs/heads/main/element_homeserver_access_token.png)
1. Create a WhatsApp group and invite your testing buddy to it
1. Start conversation with @whatsappbot on a homeserver (find homeserver url at in-person event) and follow the login process
1. Open the WhatsApp chat you want to connect to through Element
1. Copy the room id of the WhatsApp chat into the `.env` file
1. Run the command `npm install`
1. Run the command `npm run dev`
1. Ask your testing buddy to send "hello" to the WhatsApp group
1. Marvel in delight at your newfound power

For testing you can replace the whatsAppRoomId with just a normal Matrix room id, makes it easier to test by yourself. You will need an additional matrix user in the group with you, however this isn't too difficult to create.
