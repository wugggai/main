import sendgrid
import os
from sendgrid.helpers.mail import Mail, Email, To, Content
from wugserver.constants import current_domain

sg = sendgrid.SendGridAPIClient(api_key=os.environ.get("SENDGRID_API_KEY"))
apikey = "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"
sg = sendgrid.SendGridAPIClient(apikey)
domain = current_domain()


# sends verification email
# return: sendgrid API response
def send_verification_email(email: str, token: str):
    verification_path = domain + "/verification/token/" + token
    from_email = Email("tommywei110@gmail.com")
    to_email = To(email)
    subject = "Email Verification"
    email_html = (
        '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><a href="'
        + verification_path
        + '">Verify your email</a></body></html>'
    )
    content = Content("text/html", email_html)
    mail = Mail(from_email, to_email, subject, content)

    mail_json = mail.get()

    return sg.client.mail.send.post(request_body=mail_json)


def send_password_reset_email(email: str, token: str):
    from_email = Email("tommywei110@gmail.com")
    to_email = To(email)
    subject = "Reset Password"
    email_html = (
        '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><p>'
        + token
        + "</p></body></html>"
    )
    content = Content("text/html", email_html)
    mail = Mail(from_email, to_email, subject, content)

    mail_json = mail.get()

    return sg.client.mail.send.post(request_body=mail_json)
