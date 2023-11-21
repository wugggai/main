from email_validator import validate_email, EmailNotValidError


def normalize_email(raw_email: str) -> str:
    try:
        emailinfo = validate_email(raw_email, check_deliverability=False)

        return emailinfo.normalized

    except EmailNotValidError as e:
        print(str(e))
        raise e
