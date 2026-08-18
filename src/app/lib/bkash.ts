import config from "../config"
import { redisClient } from "./redis";

export const getBkashIdToken = async () => {
    try {
        const IdTokenKey="bkash:idToken"
        const RefreshTokenKey="bkash:refreshToken"
        
        let bkashIdToken = await redisClient.get(IdTokenKey);
        const bkashIdTokenTTL = await redisClient.ttl(IdTokenKey)
        let bkshRefreshToken = await redisClient.get(RefreshTokenKey);
        

        if(bkashIdTokenTTL <600 && bkshRefreshToken){
            const RefreshTokenResponse = await fetch(`${config.bkash_base_url}/tokenized/checkout/token/refresh`,{
             method :"POST",
                headers:{
                "Content-Type" : "application/json",
                Accept: "application/json",
                username : config.bkash_username,
                passsword : config.bkash_password,
                },
                     body : JSON.stringify({
                     app_key : config.bkash_app_key,
                     app_secret : config.bkash_app_secret,
                     refreshtoken: bkshRefreshToken,
                    })
                });
            const bkshRefreshTokenResult = await RefreshTokenResponse.json()

            bkashIdToken=bkshRefreshTokenResult.id_token as string

            await redisClient.set(IdTokenKey,bkashIdToken,{
                expiration:{
                    type:"EX",
                    value:60*60,
                }
            })

            return bkashIdToken
        }

        if(bkashIdToken){
            return bkashIdToken
        }
    const response = await fetch(`${config.bkash_base_url}/tokenized/checkout/token/grant`,{
        method :"POST",
        headers:{
            "Content-Type" : "application/json",
            Accept: "application/json",
            username : config.bkash_username,
            passsword : config.bkash_password,
        },
        body : JSON.stringify({
            app_key : config.bkash_app_key,
            app_secret : config.bkash_app_secret,
        })
    });
    if(!response.ok){
        throw new Error("Bkash Access Token grant Failed");
    }
    const result = await response.json();
    //bkash id token set
    await redisClient.set(IdTokenKey,result.id_token,{
        expiration:{
            type :"EX",
            value:60*60
        }
    })
    //bkash refresh id token set
    await redisClient.set(RefreshTokenKey,result.refresh_token,{
        expiration:{
            type:"EX",
            value:60*60*24*28
        }
    })

    bkashIdToken = result.id_token
    return bkashIdToken;
        
    } catch (error:any) {
        throw new Error(error.message)
    }
}