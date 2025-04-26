import "dotenv/config";

const { MAKE_WEBHOOK_URL } = process.env;

if (!MAKE_WEBHOOK_URL) {
  console.warn("MAKE_WEBHOOK_URL environment variable not set. Cannot trigger Make webhook.");
}

export const triggerMakeWebhook = async (taskName: string, taskDescription: string): Promise<void> => {
  if (!MAKE_WEBHOOK_URL) {
    console.error("Webhook URL is not configured. Cannot trigger webhook.");
    return;
  }

  const url = new URL(MAKE_WEBHOOK_URL);
  url.searchParams.append("taskName", taskName);
  url.searchParams.append("taskDescription", taskDescription);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
    });

    if (!response.ok) {
      // Don't log the full error to the frontend/user
      console.error(`Error triggering Make webhook: HTTP status ${response.status}`);
      // Optionally, log more details to a secure backend log
      // console.error("Make webhook error details:", await response.text());
    } else {
      console.log(`Successfully triggered Make webhook for task: ${taskName}`);
      // You might want to process the response body if Make returns useful info
      // const responseBody = await response.text(); // or response.json()
      // console.log("Make webhook response:", responseBody);
    }
  } catch (error) {
    // Avoid logging potentially sensitive error details directly
    console.error("Error triggering Make webhook: Network or other error occurred.");
    // Log the specific error securely if needed
    // console.error("Detailed error:", error);
  }
};
