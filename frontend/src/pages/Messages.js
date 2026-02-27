export default function Messages() {
    return (
        <div class="container messages">
            <div class="card conversations">
                <p><strong>Tom</strong></p>
                <p><strong>Emily</strong></p>
            </div>
            <div class="card chat">
                <div class="message">Is it still available?</div>
                <div class="message you">Yes!</div>
                <input placeholder="Type a message..." style={{ "width": "100%;" }} />
            </div>
        </div>
    )
}
