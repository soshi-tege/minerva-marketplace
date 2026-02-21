import secrets

def is_minerva_email(email: str) -> bool:
    email = (email or "").strip().lower()
    return email.endswith("@minerva.edu") or email.endswith("@edu.minerva.edu")

def validate_password(password: str) -> None:
    if password is None or len(password) < 6:
        raise ValueError("Password must be at least 6 characters.")

def issue_fake_token() -> str:
    return secrets.token_urlsafe(24)

