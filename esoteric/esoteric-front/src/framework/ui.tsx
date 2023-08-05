import "./ui.css"

export function Button(props: React.PropsWithChildren<{onClick?: () => void, secondary?: boolean}>) {
    return (
        <button className={props.secondary ? "ui-capsule button-secondary" : "ui-capsule button-primary"} onClick={props.onClick}>
            {props.children}
        </button>
    )
}