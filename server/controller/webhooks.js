import { Webhook } from "svix";
import User from "../model/User.js";

export const clerkWebhooks = async (req, res) => {
  try {
    console.log("=== WEBHOOK CALLED ===");
    console.log("Headers:", req.headers);
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    whook.verify(
      JSON.stringify(req.body),
      {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
      }
    );

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        console.log("Creating user:", data.id);
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        };
        const user = await User.create(userData);
        console.log("User created:", user);
        res.json({ success: true });
        break;
      }

      case "user.updated": {
        console.log("Updating user:", data.id);
        const userData = {
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        console.log("User updated:", data.id);
        res.json({ success: true });
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        console.log("User deleted:", data.id);
        res.json({ success: true });
        break;
      }

      default:
        console.log("Unhandled webhook type:", type);
        res.status(400).json({ success: false, message: "Unhandled webhook type" });
        break;
    }
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
