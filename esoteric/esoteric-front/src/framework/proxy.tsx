import { createContext, useContext } from "react";

const EXPIRATION_BUFFER = 60; // 1 minute

export type UserHandle = {
    id: number,
    username: string,
    access: string,
    refresh: string,
    access_exp: number
    refresh_exp: number  // unix epoch timestamp
}

export type User = {
    id: number,
    username: string,
    access: number
}

export type EsotericState = {
    user: UserHandle | null
}

export const AppStateContext = createContext<UserState>([null, () => {}]);

export function useUser() {
    return useContext(AppStateContext);
}

export type UserState = [user: UserHandle | null, setUser: (user: UserHandle | null) => void]

export async function authentication_request(user: UserState, path: string, method: string, body?: any) {
    if (!user[0]) {
        throw new Error("user is null");
    }

    /* if access token is about to expire, refresh it */
    if (user[0].access_exp < new Date().getTime() / 1000 - EXPIRATION_BUFFER) {
        /* if refresh_token is about to expire, set user to null */
        if (user[0].refresh_exp < new Date().getTime() / 1000 - EXPIRATION_BUFFER) {
            user[1](null);
            return;
        }

        try { 
            const access = await fetch(process.env.REACT_APP_API_URL + "/auth/reauthorize", {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + user[0].refresh
                },
                method: "POST",
                body: JSON.stringify({
                    refresh: user[0].refresh
                })
            })

            if (access.ok) {
                const json = await access.json();
                user[1]({
                    id: user[0].id,
                    username: user[0].username,
                    access: json.access_token,
                    refresh: user[0].refresh,
                    access_exp: json.access_claims.exp,
                    refresh_exp: user[0].refresh_exp
                })
            }
            else {
                console.log("failed to refresh token");
                return;
            }
        } catch {
            console.log("failed to refresh token");
            return;
        }
    }


    try {
        return await fetch(process.env.REACT_APP_API_URL + path, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + user[0].access
            },
            body: JSON.stringify(body)
        })
    } catch (err: any) {
        throw err
    }
}

/* admin */
export async function users(user: UserState) {
    try {
        const result = await authentication_request(user, "/auth/users", "GET");
        if (result?.ok) {
            return await result.json() as User[];
        }   
        else {
            throw Error((await result?.json()).error || "Failed to get users");
        }
    } catch (err: any) {
        throw err
    }
}

export async function login(user: UserState, username: string, password: string) {
    try {
        const res = await fetch(process.env.REACT_APP_API_URL + "/auth/authorize", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        
        if (res.ok) {
            const json = await res.json();
            user[1]({
                id: json.id,
                username: json.username,
                access: json.access_token,
                refresh: json.refresh_token,
                access_exp: json.access_claim.exp,
                refresh_exp: json.refresh_claim.exp
            })
        }
        else {
            throw new Error((await res.json()).error); 
        }
    } catch (err: any) {
        throw err
    }
}