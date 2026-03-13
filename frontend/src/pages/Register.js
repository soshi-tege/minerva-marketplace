import Body from "../components/Body"
import Heading from "../components/Heading"

export default function Register() {
    return (
        <Body>
            <Heading level={2}>
                Register
            </Heading>
            <form className="form">
                <label for="name">
                    Name: <input id="name" name="name" type="text" />
                </label>
                <label for="email">
                    Email: <input id="email" name="email" type="email" />
                </label>
                <label for="password">
                    Password: <input id="password" name="password" type="password" />
                </label>
                <input type="submit" />
            </form>
        </Body>
    )
}
