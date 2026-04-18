export default function Button({ children, style, onClick, ...props }) {
    return (
        <button className={style} onClick={onClick} {...props}>{children}</button>
    )
}
