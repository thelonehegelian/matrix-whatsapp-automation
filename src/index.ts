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

const HELP_MESSAGE = `To create a task in Trello, send a message in the following format:

Task: [Your Task Title]
Description: [Detailed description of your task]

Example:
Task: Buy Groceries
Description: Need milk, eggs, and bread.`;

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

    // --- Handle Text Messages ---
    if (event.getType() === "m.room.message") {
      const content = event.getContent();
      const msgBody = content?.body;
      const sender = event.getSender();

      // Ignore replies from the bot itself to prevent loops
      if (typeof msgBody === "string" && (msgBody.startsWith("BOT_REPLY: ") || msgBody === HELP_MESSAGE)) {
        return;
      }

      // Check for /help command
      if (typeof msgBody === "string" && msgBody.trim() === "/help") {
        console.log(`Received /help command from ${sender}`);
        try {
          // Send the help message as a notice to differentiate it
          await client.sendNotice(whatsAppRoomId, HELP_MESSAGE);
        } catch (error) {
          console.error("Error sending help message:", error);
        }
        return; // Help command handled
      }

      // Check for Task/Description format from ANY sender
      if (typeof msgBody === "string" && msgBody.length > 0) {
        const { taskName, taskDescription } = parseTaskAndDescription(msgBody);

        // If parsing was successful, trigger webhook and reply
        if (taskName && taskDescription) {
          console.log(`Parsed Task: "${taskName}", Description: "${taskDescription}" from ${sender}`);
          try {
            await triggerMakeWebhook(taskName, taskDescription);
            await client.sendTextMessage(whatsAppRoomId, "BOT_REPLY: Task Created in Trello");
          } catch (error) {
            console.error("Error triggering webhook or sending reply for parsed task. Sender was:", sender);
          }
          return; // Task message handled, don't process further
        }
      }

      // --- If NOT a Task/Description message or /help, check sender ---

      // Handle BOT'S OWN messages (original reversal logic)
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
        return; // Bot's own non-task message handled
      }

      // Handle messages from OTHER users (standard handler, if not /help or task)
      if (sender !== userId) {
        handleMessage(event);
        return;
      }
    }

    // --- Handle Reactions ---
    if (event.getType() === "m.reaction") {
      handleReaction(event);
      return;
    }

    // Log other event types if needed, but don't process them with handlers
    // console.log("Skipping unhandled event type:", event.getType());
  });
};

start();
