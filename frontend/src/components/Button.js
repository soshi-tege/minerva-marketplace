export default function Button({ children, style, onClick }) {
    return (
        <button className={style} onClick={onClick}>{children}</button>
    )
}
