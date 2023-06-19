import re


def is_valid_email(raw_email: str) -> bool:
    return re.fullmatch(r"^[\w\.-]+@[\w\.-]+\.\w+$", raw_email)
