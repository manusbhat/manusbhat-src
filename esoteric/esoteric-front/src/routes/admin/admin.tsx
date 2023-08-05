import { FormEvent, useEffect, useState } from "react";
import { User, UserState, authentication_request, useUser, users } from "../../framework/proxy";
import { StandardTemplate } from "../../framework/template";
import { Form, FormError, FormField, SubmitField, TitledForm } from "../../framework/form";

import "./admin.css"
import "../../framework/globals.css";

function Users() {
    const [usrs, setUsers] = useState<User[]>([]);

    const admin = useUser();
    useEffect(() => {
        const worker = async () => {
            try {
                const result = await users(admin);
                setUsers(result);
            } catch (e) {
                console.log(e);
            }
        }

        worker();
    }, [])

    return (
        <div className="window-background admin-form">
            <table>
                <thead>
                    <td className="admin-users-uname">username</td>
                    <td>id</td>
                    <td>access</td>
                </thead>

                {usrs.map((u) => {
                return (
                    <tbody key={u.id}>
                        <td className="admin-users-uname">{u.username}</td>
                        <td>{u.id}</td>
                        <td>{u.access}</td>
                    </tbody>
                )
            })}
            </table>
           
        </div>
    )
}

type AdminState = {
    username: string,
    newUsername: string,
    password: string,
    error: string,
    loading: boolean
}

function AdminForm(props: {
    title: string,
    titleLoading: string,
    confirm: (state: AdminState) => string,
    usernameField?: boolean, 
    newUsernameField?: boolean, 
    passwordField?: boolean,
    danger?: boolean,
    formSubmit: (state: AdminState, user: UserState) => Promise<any>
}) {
    const [username, setUsername] = useState("");
    const [nusername, setNusername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const user = useUser();

    const submit = async (event: FormEvent) => {
        const state = {
            username: username,
            newUsername: nusername,
            password: password,
            error: error,
            loading: loading
        };

        event.preventDefault();
        if (!window.confirm(props.confirm(state))) {
            setError("Operation cancelled")
            return
        }

        setLoading(true);
        setError("");

        try {
            const result = await props.formSubmit(state, user);

            if (!result?.ok) {
                setError("Failed to create user: " + (await result?.json()).error);
            }
            else {
                window.alert("Success!")
                window.location.reload();
            }
            setLoading(false);
        } catch (e: any) {
            setError(e.message);
            setLoading(false);
            return;
        }
    }

    return (

        <div className="window-background admin-form">
            <TitledForm 
                title={props.title} 
                formSubmit={submit}
                >
                {props.usernameField &&
                    <FormField
                        value={username}
                        placeholder="username"
                        setState={setUsername}
                        setError={setError}
                        autocomplete="off"
                        autoFocus
                    />
                }

                {props.newUsernameField &&
                    <FormField
                        value={nusername}
                        placeholder="new username"
                        setState={setNusername}
                        setError={setError}
                        autocomplete="off"
                        autoFocus
                    />
                }

                {props.passwordField &&
                    <FormField
                        value={password}
                        placeholder="password"
                        setState={setPassword}
                        setError={setError}
                        autocomplete="off"
                    />
                }

                <SubmitField 
                    title={props.title}
                    titleLoading={props.titleLoading}
                    isLoading={loading}
                    danger={props.danger}
                />

                <FormError error={error} />
            </TitledForm>
        </div>
    ) 
}

function CreateUser() {
    return (
        <AdminForm
            title="Create User"
            titleLoading="Creating User"
            confirm={(state) => `Are you sure you want to create user {username=${state.username}, password=${state.password}}?`}
            usernameField
            passwordField
            formSubmit={async (state, user) => {
                return await authentication_request(user, "/auth/user", "POST", {
                    "username": state.username, 
                    "password": state.password,
                    "access": 0
                });
            }}
        />
    )
}

function UserUname() {
    return (
        <AdminForm
            title="Set Username"
            titleLoading="Setting User"
            confirm={(state) => `Are you sure you want to set username {username=${state.username}, new=${state.newUsername}}?`}
            usernameField
            newUsernameField
            formSubmit={async (state, user) => {
                return await authentication_request(user, "/auth/user/username", "PUT", {
                    "username": state.username, 
                    "new_username": state.newUsername,
                });
            }}
        />
    )
}

function UserPassword() {
    return (
        <AdminForm
            title="Set Password"
            titleLoading="Setting Password"
            confirm={(state) => `Are you sure you want to rewrite password? {username=${state.username}, password=${state.password}}?`}
            usernameField
            passwordField
            formSubmit={async (state, user) => {
                return await authentication_request(user, "/auth/user/password", "PUT", {
                    "username": state.username, 
                    "password": state.password,
                });
            }}
        />
    )
}

function DeleteUser() {
    return (
        <AdminForm
            title="Delete User"
            titleLoading="Deleting User"
            confirm={(state) => `Are you sure you want to delete user {username=${state.username}}?`}
            usernameField
            danger
            formSubmit={async (state, user) => {
                return await authentication_request(user, "/auth/user", "DELETE", state.username);
            }}
        />
    )
}

function UserOps() {

    // list users
    // change user password
    // change user username
    // create user
    // delete user 

    return (
        <div id="admin-user-col">
            <h1>Users</h1>
            <Users />
            <CreateUser />
            <UserUname />
            <UserPassword />
            <DeleteUser />
        </div>
    )
}
 


export default function Admin() {
    const user = useUser();
    const [usrs, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const worker = async () => {
            try {
                const result = await users(user);
                setUsers(result);
            } catch (e) {
                console.log(e);
            }
        }

        worker();
    }, [])

    return (
        <StandardTemplate active='Admin' useStreaks={false}>
            <UserOps />
            

        </StandardTemplate>
    )
}