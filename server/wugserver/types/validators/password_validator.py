import re


def is_valid_password(password: str) -> bool:
    # Check if password length is at least 8 characters
    if len(password) < 8:
        return False

    # Check if password contains a non-alphabetical character
    if not re.search(r"[^a-zA-Z]", password):
        return False

    # Check if password contains an uppercase letter
    if not re.search(r"[A-Z]", password):
        return False

    # Check if password contains a number
    if not re.search(r"\d", password):
        return False

    # Check if password contains a lowercase letter
    if not re.search(r"[a-z]", password):
        return False

    return True
