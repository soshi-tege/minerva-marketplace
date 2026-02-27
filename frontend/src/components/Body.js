import { Container, Stack } from "react-bootstrap"

export default function Body({ children }) {
    return (
        <Container>
            <Stack direction="horizontal" className="Body">
                <Container>
                    {children}
                </Container>
            </Stack>
        </Container>
    )
}