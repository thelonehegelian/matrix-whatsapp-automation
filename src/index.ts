import "dotenv/config";
import * as sdk from "matrix-js-sdk";
import { RoomEvent, ClientEvent, MatrixEvent } from "matrix-js-sdk";
import handleMessage from "./messages";
import handleReaction from "./reactions";
import { triggerMakeWebhook } from "./integrations/make/trello";
import { parseTaskAndDescription } from "./utils";

const { homeserver, access_token, userId, whatsAppRoomId } = process.env;

const client = sdk.createClient({
  baseUrl: homeserver,
  accessToken: access_token,
  userId,
});

const start = async () => {
  console.log("Starting matrix example tool...");
  console.log(`User ID: ${userId}`);
  console.log(`Homeserver: ${homeserver}`);
  await client.startClient();
  console.log("Matrix client started, waiting for sync...");

  client.once(ClientEvent.Sync, async (state, prevState, res) => {
    // state will be 'PREPARED' when the client is ready to use
    console.log(`Client sync state: ${state}`);
    if (state === "PREPARED") {
      console.log("Client synced and ready!");
    }
  });

  const scriptStart = Date.now();

  client.on(RoomEvent.Timeline, async function (event: MatrixEvent, room, toStartOfTimeline) {
    const eventTime = event.getTs();

    if (scriptStart > eventTime) {
      return; //don't run commands for old messages
    }

    if (event.getRoomId() !== whatsAppRoomId) {
      return; // don't activate unless in the active room
    }

    if (event.getType() === "m.room.message") {
      const content = event.getContent();
      const msgBody = content?.body;
      const sender = event.getSender();

      if (typeof msgBody === "string" && msgBody.startsWith("BOT_REPLY: ")) {
        return;
      }

      if (typeof msgBody === "string" && msgBody.length > 0) {
        const { taskName, taskDescription } = parseTaskAndDescription(msgBody);

        if (taskName && taskDescription) {
          console.log(`Parsed Task: "${taskName}", Description: "${taskDescription}" from ${sender}`);
          try {
            await triggerMakeWebhook(taskName, taskDescription);
            await client.sendTextMessage(whatsAppRoomId, "BOT_REPLY: Task Created in Trello");
          } catch (error) {
            console.error("Error triggering webhook or sending reply for parsed task. Sender was:", sender);
          }
          return;
        }
      }

      if (sender === userId) {
        if (typeof msgBody === "string" && msgBody.length > 0) {
          const reversedMessage = "BOT_REPLY: " + msgBody.split("").reverse().join("");
          try {
            console.log(`Bot reversing its own message: "${msgBody}"`);
            await client.sendTextMessage(whatsAppRoomId, reversedMessage);
          } catch (error) {
            console.error("Error sending reversed message from bot. Original message:", msgBody);
          }
        }
        return;
      }

      if (sender !== userId) {
        handleMessage(event);
        return;
      }
    }

    if (event.getType() === "m.reaction") {
      handleReaction(event);
      return;
    }
  });
};

start();
