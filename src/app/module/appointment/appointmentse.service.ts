import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash"

const bookAppointment =async () =>{

    const bkashIdToken= await getBkashIdToken();

    if(!bkashIdToken){
        throw new Error("no bkash access token");
    }

     const bkashCreatePaymentRespons = await fetch(`${config.bkash_base_url}/tokenized/checkout/create`,{
        method:"POST",
        headers:{
            "Content-Type": "application/json",
            Accept: "application/json",
            authorization: bkashIdToken,
            "x-app-key": config.bkash_app_key,
        },
        body:JSON.stringify({
                "mode": "0011",
                "payerReference": "01723888888",
                "callbackURL": `${config.bkash_callback_url}/appointment/book-appointment/payment/callback`,
                "merchantAssociationInfo": "MI05MID54RF09123456One",
                "amount": "500",
                "currency": "BDT",
                "intent": "sale",
                "merchantInvoiceNumber": "Inv0124"
        })

     });

     const  bkashCreatePaymentResult = await bkashCreatePaymentRespons.json();

     return bkashCreatePaymentResult



}

export const AppoinmentServices = {
    bookAppointment,
}