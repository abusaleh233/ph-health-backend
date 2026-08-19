import config from "../config"
import { redisClient } from "./redis"

export const getBkashIdToken = async () => {
    try {
        const IdTokenkey="bkash:idToken"
        const RefreshTokenKey = "bkash:refreshToken"

        let bkashIdToken = await redisClient.get(IdTokenkey)
        const bkashIDTokenTTL = await redisClient.ttl(IdTokenkey)

        const bkashRefreshToken = await redisClient.get(RefreshTokenKey)
        const bkashRefreshTokenTTL = await redisClient.ttl(RefreshTokenKey)

        if((bkashIDTokenTTL <= 600 || !bkashIdToken) && bkashRefreshToken && bkashRefreshTokenTTL > 600){
           
            const RefreshTokenResponse = await fetch(`${config.bkash_base_url}/tokenized/checkout/token/refresh`,{
                method:"POST",
                headers:{
                    "Content-Type" :"application/json",
                    Accept :"application/json",
                    username :config.bkash_username,
                    password :config.bkash_password,

                },
                body:JSON.stringify({
                    app_key:config.bkash_app_key,
                    app_secret:config.bkash_app_secret,
                    refresh_token:bkashRefreshToken,

                })
            });

            if(!RefreshTokenResponse){
                throw new Error("Bkash Access Token grant Failed");
            }

            const bkshRefreshTokenResult = await RefreshTokenResponse.json();

            bkashIdToken = bkshRefreshTokenResult.id_token as string;

            await redisClient.set(IdTokenkey,bkashIdToken,{
                expiration:{
                    type:"EX",
                    value: 60*60
                }
            })

            return bkashIdToken;
        }

        if(bkashIDTokenTTL > 600){
            return bkashIdToken
        }

        //response 

        
    } catch (error:any) {
        throw new Error(error.message)
        
    }

}