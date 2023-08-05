import { FormEvent, ReactNode } from "react";

import "./form.css"

export function FormField(props: {
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

export function UsernameField(props: {
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

export function PasswordField(props: {
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

export function SubmitField(props: {
    title: string, 
    titleLoading: string, 
    isLoading: boolean,
    danger?: boolean
}) {
    var classname = "ui-capsule ui-button-primary form-submit" + (props.isLoading ? " form-submit-loading" : "");
    if (props.danger) {
        classname += " ui-button-danger";
    }
    
    return (
        <input type="submit" 
            value={props.isLoading ? props.titleLoading : props.title} 
            disabled={props.isLoading} 
            className={classname}/>
    )
}

export function FormError(props: {error: string}) {
    return (
        <p id="form-error-message">
            {props.error}
        </p>
    )
}

export function TitledForm(props: {
    title:string, 
    children: ReactNode, 
    formSubmit?: (event: React.FormEvent) => Promise<void>

    nonFormChildren?: ReactNode
}) {
    return (
        // className optional
        <div className="auth-titled-form">
            <p id="form-title">{props.title}</p>
            {props.nonFormChildren}
            <form id="form-field" onSubmit={props.formSubmit}>
                {props.children}
            </form>
        </div>
    )
}

export function Form(props: {
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