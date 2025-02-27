import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { upsertUser } from "@/lib/db/upsert-user";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no svix headers, return 400
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret);
  
  let evt: WebhookEvent;

  // Verify the webhook payload
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error verifying webhook", { status: 400 });
  }

  // Handle the webhook event
  const eventType = evt.type;

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, image_url, first_name, last_name } = evt.data;
      
      // Get the primary email
      const emailObject = email_addresses?.[0];
      const email = emailObject?.email_address;
      
      if (!id || !email) {
        return new NextResponse("Missing user data", { status: 400 });
      }
      
      // Construct the name from first and last name
      const name = [first_name, last_name].filter(Boolean).join(" ") || null;
      
      // Upsert the user in our database
      await upsertUser({
        id,
        email,
        name,
        imageUrl: image_url,
      });
      
      return NextResponse.json({ success: true, eventType });
    }
    
    if (eventType === "user.deleted") {
      // We rely on database cascading deletes to handle user deletion
      // The user's boards, cards, etc. will be automatically deleted
      return NextResponse.json({ success: true, eventType });
    }
    
    // Return a 200 response for other event types
    return NextResponse.json({ success: true, eventType });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Error processing webhook", { status: 500 });
  }
} 