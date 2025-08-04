import { Webhook } from "svix"
import User from "../model/User.js"

// API Controller Function to Manage Clerk User With database 

export const clerkWebhooks = async (req, res) => {
    try {
        console.log('=== WEBHOOK CALLED ===')
        console.log('Headers:', Object.keys(req.headers))
        console.log('Body type:', req.body.type)
        console.log('Body data:', JSON.stringify(req.body, null, 2))
        
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        })

        const { data, type } = req.body

        switch (type) {
            case 'user.created':{
                console.log('Creating user:', data.id)
                const userData={
                    _id : data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.imageUrl,
                }
                await User.create(userData)
                console.log('User created successfully:', data.id)
                res.json({})
                  break;
            }
                
            case 'user.updated':{
                console.log('Updating user:', data.id)
                const userData={
                    email: data.email_address[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.imageUrl,
                }
                await User.findByIdAndUpdate(data.id,userData)
                console.log('User updated successfully:', data.id)
                res.json({})
                break;
            }

            case 'user.deleted':{
                await User.findByIdAndDelete(data.id)
                res.json({})
                break;
            }

            default:
                break;
        }

    } catch (error) {
       res.json({success:false,message:error.message})
    }
}