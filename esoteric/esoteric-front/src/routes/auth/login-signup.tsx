import React, { FormEvent, ReactNode, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { AuthPage } from "./auth";

import "./form.css"
import "./auth.css"
import "../../framework/globals.css"
import { UserState, login, useUser } from "../../framework/proxy";
const halfFadeoutMillis = 200;

var timeouts: NodeJS.Timeout[] = [];

enum Page {
    Login,
    Signup,
    Verify,
    Reset,
}

function FormField(props: {
    value?: string,
    hidden?: string | boolean,
    placeholder: string,
    autocomplete: string,
    setState: (email: string) => void,
    setError: (error: string) => void
    autoFocus?: boolean,
}) {
    
    return (
        // value is optional
        <input 
            value={props.value} 
            autoFocus={props.autoFocus === true}
            type="text" 
            placeholder={props.placeholder}
            autoComplete={props.autocomplete}
            className={"form-text-input" + (props.hidden ? " null" : "")}
            onChange={
                (event) => {
                    props.setState(event.target.value)
                    props.setError("");
                }
            }/>
    )
}

function UsernameField(props: {
    value?: string,
    hidden?: string | boolean,
    setState: (email: string) => void,
    setError: (error: string) => void
}) {

    return (
        // value is optional
        <input 
            value={props.value} 
            autoFocus
            type="text" 
            placeholder="uname" 
            autoComplete="username" 
            className={"form-text-input" + (props.hidden ? " null" : "")}
            onChange={
                (event) => {
                    props.setState(event.target.value)
                    props.setError("");
                }
            }/>
    )
}

function PasswordField(props: {
    placeholder: string, 
    passwordType: string, 
    value?: string,
    setState: (password: string) => void,
    setError: (error: string) => void
}) {

    return (
        // value is optional
        <input 
            type="password" 
            placeholder={props.placeholder}
            autoComplete={props.passwordType + "-password"}
            className="form-text-input"
            value={props.value}
            onChange={
                (event) => {
                    props.setState(event.target.value)
                    props.setError("");
                }
            }/>
    )
}

function SubmitField(props: {
    title: string, 
    titleLoading: string, 
    isLoading: boolean
}) {
    
    return (
        <input type="submit" 
            value={props.isLoading ? props.titleLoading : props.title} 
            disabled={props.isLoading} 
            className={"capsule form-submit" + (props.isLoading ? " form-submit-loading" : "")}/>
    )
}

function FormError(props: {error: string}) {
    return (
        <p id="form-error-message">
            {props.error}
        </p>
    )
}

function TitledForm(props: {
    title:string, 
    children: ReactNode, 
    formSubmit?: (event: React.FormEvent) => Promise<void>

    nonFormChildren?: ReactNode
}) {
    return (
        // className optional
        <div className="auth-titled-form">
            <p>{props.title}</p>
            {props.nonFormChildren}
            <form id="form-field" onSubmit={props.formSubmit}>
                {props.children}
            </form>
        </div>
    )
}

function Form(props: {
        formSubmit:(event: FormEvent) => Promise<void>,
        setUname: (uname: string) => void,
        setError: (error: string) => void,
        setPass:  (error: string) => void,

        uname: string,
        pass: string,

        children: ReactNode,
        
        title: string,
        titleLoading: string,
        isLoading: boolean
    }) {

    return (
        <TitledForm title={props.title} formSubmit={props.formSubmit}>
            {/* uname */}
            <UsernameField
                value={props.uname}
                setState={props.setUname}
                setError={props.setError}/>
            <PasswordField 
                value={props.pass}
                placeholder="password" 
                passwordType="current"
                setState={props.setPass}
                setError={props.setError}/>

            {props.children}

            <SubmitField 
                title={props.title} 
                titleLoading={props.titleLoading}
                isLoading={props.isLoading}/>
        </TitledForm>
    )
}

function ThirdPartyAPI(props: React.PropsWithChildren<{
        isLoading: boolean, 
        request: () => Promise<void>, 
        setError:(error: string) => void,
        setLoading:(loading: boolean) => void,
        icon: ReactNode
    }>) {

    return (
        <span className="auth-third-party-api" onClick={async () => {
            if (props.isLoading) {
                return;
            }
            props.setError("")
            props.setLoading(true);
            try {
                await props.request();
                // see if it exists in the database
                // const alreadyExists = (await dbReadDoc("users", auth.currentUser!.uid))?.exists();
                // if (!alreadyExists) {
                //     await createBlankUser(auth.currentUser!.uid)
                // }

            } catch (error:any) {
                props.setError(error.message);
            }
            props.setLoading(false);

        }}>
            {props.icon}
            <p>
                {props.children}
            </p>
        </span>
    )
}

interface propsBase {
    isClear: boolean

    uname: string
    pass: string
    page : Page

    setPage: (page: Page) => void
    setUname: (uname: string) => void,
    setPass:  (pass: string) => void,
    setIsClear: (isClear: boolean) => void

    user: UserState

    navigate: NavigateFunction
}

interface stateBase {
    error: string,
    
    isLoading: boolean
}

abstract class LoginSignupBase<state extends stateBase> extends React.Component<propsBase, state> {
    title: string 
    titleLoading: string
    alternate: string
    alternateIntro: string

    constructor(props : propsBase, title:string, titleLoading:string, alternate:string, alternateIntro:string) {
        super(props);

        this.title = title;
        this.titleLoading = titleLoading;
        this.alternate = alternate;
        this.alternateIntro = alternateIntro;

    }

    go(to:string) {
        this.props.navigate(to);
    }

    // might want to split this
    render() {
        const setUname = this.props.setUname
        const setPass = this.props.setPass
        const setError = (error:string) => {this.setState({"error":error})}
        const setLoading = (isLoading:boolean) => {this.setState({"isLoading":isLoading})}

        return (
            <div id="auth-opacity-handle" className={(this.props.isClear ? " auth-clear-handle" : "")}>
                <Form
                    title={this.title}
                    titleLoading={this.titleLoading}
                    isLoading={this.state.isLoading}

                    uname={this.props.uname}
                    pass={this.props.pass}

                    setUname={setUname}
                    setPass={setPass}
                    setError={setError}

                    formSubmit={this.formSubmit.bind(this)}
                >
                    {this.thirdFormItem()}
                </Form>

                {/* Sign up with google or github */}
                <div id="auth-third-party">
                    <Separator>OR</Separator>
                        <ThirdPartyAPI
                            icon={<img alt="Google" src="/svg/google-logo.svg"/>}

                            isLoading={this.state.isLoading}
                            setLoading={setLoading}
                            setError={setError}

                            request={async () => {setError("Google OAuth2.0 disabled")}}
                            >
                            {this.title} with Google
                        </ThirdPartyAPI>
                    <Separator/>
                        <ThirdPartyAPI
                            icon={<img alt="Facebook" src="/svg/facebook-logo.svg"/>}

                            isLoading={this.state.isLoading}
                            setLoading={setLoading}
                            setError={setError}

                            request={async () => {setError("Facebook OAuth2.0 disabled")}}
                            >
                            {this.title} with Facebook
                        </ThirdPartyAPI>
                    <Separator/>
                </div>

                <FormError error={this.state.error}/>

                {/* Switching to login or signup */}
                <p>
                    {this.alternateIntro}<br/>
                    <button onClick={() => {
                        const next = this.props.page === Page.Login ? Page.Signup : Page.Login;
                        this.transitionTo(next);
                    }}>
                        {this.alternate}
                    </button>
                    {' '}
                    instead
                </p>
                
            </div>
        )
    }

    transitionTo(page: Page) {
        this.props.setIsClear(true);

        // clear existing timeouts
        for (const to of timeouts) {
            clearTimeout(to);
        }
        timeouts = [];

        // switch
        timeouts.push(setTimeout(() => {
            this.props.setPage(page);
        }, halfFadeoutMillis))
        // clear off
        timeouts.push(setTimeout(() => {
            this.props.setIsClear(false);
        }, halfFadeoutMillis + 30))              
    }

    abstract formSubmit(event: FormEvent): Promise<void>;
    abstract thirdFormItem() : ReactNode;
}

function Separator(props : React.PropsWithChildren<{}>) {
    if (props.children) {
        return (
            <div className="auth-separator">
                <span/>
                {props.children}
                <span/>
            </div>
        )
    }
    return (
        <div className="auth-separator">
            <span/>
        </div>
    )
}

class LoginWindow extends LoginSignupBase<stateBase> {

    constructor(props:propsBase){
        super(props, "Log in", "Logging in...", "Sign up", "Don't have an account?")
        this.state = {
            error: "",
            
            isLoading: false,
        }
    }

    thirdFormItem() {
        return (
            <p>
                Forgot password?{' '}
                {/* vannilla span so that it ignores the enter commands */}
                <span onClick={async () => {
                    this.setState({error: "User-initiated password reset disabled. Contact admin directly."})
                }}>
                    Reset here
                </span>
            </p>
        )
    }

    async formSubmit(event: FormEvent) {
        event.preventDefault();

        this.setState({error: ""})
        this.setState({isLoading: true})
        try {
            await login(this.props.user, this.props.uname, this.props.pass);
            // await logInWithUnameAndPassword(this.props.uname, this.props.pass);
            // from amazon api, apparently going to show user not found if it's 
            this.go('/')
            // try create a blank user 
        } catch (err:any) {
            // if (err.message === 'reverify-needed') {
            //     // sendCode(this.props.uname)
            //     this.transitionTo(Page.Verify);
            //     return
            // }
            
            console.error("Login form submit error:", err.message)
            this.setState({error: err.message})
        }
        this.setState({isLoading: false})
    } 
}

interface signupState extends stateBase {
    passConfirm: string
}

class SignupWindow extends LoginSignupBase<signupState> {

    constructor(props: propsBase){
        super(props, "Sign up", "Signing up...","Log in", "Already have an account?")
        this.state = {
            passConfirm: "",
            error: "",
            
            isLoading: false,
        }
    }

    thirdFormItem() {
        return (
            <PasswordField 
                placeholder="confirm password" 
                passwordType="current"
                value={this.state.passConfirm}
                
                setState={(passConfirm:string) => {this.setState({passConfirm: passConfirm})}}
                setError={(error:string) => {this.setState({error: error})}}
            />
        )
    }

    async formSubmit(event : FormEvent) {
        event.preventDefault();

        if (this.props.pass !== this.state.passConfirm) {
            this.setState({error: "'Confirm password' does not match 'password' field"})
            return;
        }

        this.setState({error: ""})
        this.setState({isLoading: true})

        try {
            // const result = await signUpWithUnameAndPassword(this.props.uname, this.props.pass);
            // if (!result.userConfirmed) {
            //     this.transitionTo(Page.Verify);
            // } else {
            //     this.go('/loginhandle')
            // }
            // try create a user
        } catch (err: any) {
            this.setState({error: err.message})
        }
        this.setState({isLoading: false})
    }
}

/* not ported yet */
function VerifyCode(props: {uname: string}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("")

    const [code, setCode] = useState("")
    
    const navigate = useNavigate();

    async function formSubmit(event: React.FormEvent) {
        event.preventDefault(); 

        if (code.length < 6) {
            setError("Please enter all six digits.")
            return;
        }
        setError("")
        setLoading(true);

        try {
            // await verifyCode(props.uname, "" + code);
            navigate('/loginhandle')
        } catch (err : any) {
            setError(err.message)
        }

        setLoading(false);
    }

    return (
        <TitledForm title="Verify Uname" formSubmit={formSubmit}>
            <p>
                An uname has been sent to {props.uname} with a six-digit code to confirm your identity. Please enter it or
                <button onClick={() => {/* sendCode(props.uname)} */}}>resend</button>
            </p>

            <FormField 
                placeholder="six-digit code"
                autocomplete="off" 
                value={"" + code}
                setState={(str: string) => {
                    setCode(str.replace(/\D/g, '').substring(0, Math.min(str.length, 6)));
                }}
                setError={setError}/>

            <SubmitField title="Verify" titleLoading="Verifying..." isLoading={loading}/>

            <FormError error={error}/>
        </TitledForm>
    )
}

/* not ported yet */
function ResetPassword(props: {uname: string}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("")

    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [newPassword1, setNewPassword1] = useState("")
    

    const navigate = useNavigate();

    async function formSubmit(event: React.FormEvent) {
        event.preventDefault(); 

        if (code.length < 6) {
            setError("Please enter all six digits.")
            return;
        }
        if (newPassword !== newPassword1) {
            setError("'Confirm new password' does not match 'new password' field");
            return;
        }

        setError("")
        setLoading(true);

        try {
            // await completeResetPassword(props.uname, code, newPassword);
            navigate('/loginhandle')
        } catch (err : any) {
            setError(err.message)
        }

        setLoading(false);
    }

    return (
        <TitledForm title="Reset Uname" formSubmit={formSubmit} nonFormChildren={
            <p>
                An uname has been sent to {props.uname} with a six-digit code to confirm your identity. Please enter it or 
                <button onClick={() => {
                    // resetPassword(props.uname)
                }}>
                    resend
                </button>
            </p>
        }>
            <UsernameField 
                value={props.uname}
                hidden
                setState={() => {}}
                setError={() => {}}
            />

            <FormField 
                placeholder="six-digit code"
                autocomplete="off" 
                value={"" + code}
                setState={(str: string) => {
                    setCode(str.replace(/\D/g, '').substring(0, Math.min(str.length, 6)));
                }}
                setError={setError}/>

            <PasswordField
                placeholder="new password"
                passwordType="new"
                setState={setNewPassword}
                setError={setError}
            />

            <PasswordField
                placeholder="confirm new password"
                passwordType="new"
                setState={setNewPassword1}
                setError={setError}
            />

            <SubmitField title="Reset" titleLoading="Verifying..." isLoading={loading}/>

            <FormError error={error}/>
        </TitledForm>
    )
}

function Window(props : {page: Page}) {

    const [page, setPage] = useState(props.page);
    const [isClear, setIsClear] = useState(false);

    const [uname, setUname] = useState("")
    const [password, setPassword] = useState("");

    const unameDisattachedUser = useUser();

    const navigate = useNavigate();
    var current : ReactNode;

    switch (page) {
        case Page.Signup:
            current = (
                <SignupWindow
                    page={page}
                    uname={uname}
                    pass={password}
                    isClear={isClear}

                    setPage={setPage}
                    setUname={setUname}
                    setPass={setPassword}
                    setIsClear={setIsClear}

                    user={unameDisattachedUser}

                    navigate={navigate}
                />
            )
            break;
        case Page.Login:
            current = (
                <LoginWindow
                    page={page}
                    uname={uname}
                    pass={password}
                    isClear={isClear}

                    setPage={setPage}
                    setUname={setUname}
                    setPass={setPassword}
                    setIsClear={setIsClear}

                    user={unameDisattachedUser}

                    navigate={navigate}
                />
            )
            break;
        case Page.Verify:
            current = (
                <VerifyCode 
                    uname={uname}
                />
            )
            break;
        case Page.Reset:
            current = (
                <ResetPassword
                    uname={uname}
                />
            )
            break;
    }

    return (
        <AuthPage terms={
            <p>
                Account operations are currently limited. <button onClick={() => {navigate("/")}}>View home</button> for alternate options.
            </p>
        }>
            {current}
        </AuthPage>
    )
}

export function Signup() {
    // user should always be at the top level where it's stateless, bc otherwise it clogs up for some reason
    return (
        <Window page={Page.Signup}/>
    )
}

export function Login() {
    return (
        <Window page={Page.Login}/>
    )
}