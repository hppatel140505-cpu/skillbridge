import { Webhook } from "svix"
import User from "../model/User.js"

// API Controller Function to Manage Clerk User With database 

export const clerkWebhooks = async (req, res) => {
    try {
        console.log('Webhook received:', req.body.type)
        
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
                const userData={
                    email: data.email_address[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.imageUrl,
                }
                await User.findByIdAndUpdate(data.id,userData)
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
        console.error('Webhook error:', error.message)
        if (error.message.includes('Invalid signature')) {
            console.error('Webhook signature verification failed')
            return res.status(401).json({success:false,message:'Invalid webhook signature'})
        }
        res.status(500).json({success:false,message:error.message})
    }
}