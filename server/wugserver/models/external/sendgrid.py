import sendgrid
import os
from sendgrid.helpers.mail import Mail, Email, To, Content
from wugserver.constants import current_domain

sg = sendgrid.SendGridAPIClient(api_key=os.environ.get("SENDGRID_API_KEY"))
domain = current_domain()


# sends verification email
# return: sendgrid API response
def send_verification_email(email: str, token: str):
    verification_path = domain + "/verification/token/" + token
    from_email = Email("hello.yuse.ai@gmail.com")
    to_email = To(email)
    subject = "Email Verification"
    email_html = _verify_email_template(verification_path)
    content = Content("text/html", email_html)
    mail = Mail(from_email, to_email, subject, content)

    mail_json = mail.get()

    return sg.client.mail.send.post(request_body=mail_json)


def send_password_reset_email(email: str, token: str):
    path = domain + "/set_new_password" + "?token=" + token
    from_email = Email("hello.yuse.ai@gmail.com")
    to_email = To(email)
    subject = "Reset Password"
    email_html = _reset_password_template(path)
    content = Content("text/html", email_html)
    mail = Mail(from_email, to_email, subject, content)

    mail_json = mail.get()

    return sg.client.mail.send.post(request_body=mail_json)


def _reset_password_template(path: str) -> str:
    return (
        (
            """
        <!DOCTYPE html>
        <html>
            <head>
            </head>
            <body style="display: flex; justify-content: center; align-items: center; font-size: 16px; font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">
                <div style="width: 480px;">
                    <h4>Password Reset</h4>
                    <p>We have received your request to reset your password, please use the link below to complete the process. Note that this link will expire after 12 hours.</p>
                    <div style="display: flex; justify-content: center; align-items: center;"><a style="border-style: none; font-size: 14px; border-radius: 4px; padding: 16px 8px; color: white; background-color: #7878c3; font-family: inherit; cursor: pointer; text-decoration:none;" href="
        """
        )
        + path
        + (
            """
        ">Reset my password</a></div>
        <p>Or copy this link to your browser directly: 
        """
        )
        + path
        + (
            """  
                    </p>
                    <p>Thanks,</p>
                    <p>The Yuse.ai team</p>
                    <p>Contact us at <a href="https://discord.gg/PwCSdCcWd4">Discord</a></p>
                </div>
            </body>
        </html>
    """
        )
    )


def _verify_email_template(verification_path: str) -> str:
    return (
        (
            """
        <!DOCTYPE html>
        <html>
            <head>
            </head>
            <body style="display: flex; justify-content: center; align-items: center; font-size: 16px; font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">
                <div style="width: 480px;">
                    <h4>Welcome to Yuse.ai!</h4>
                    <p>One final thing before we let you explore our platform on your own: we need to verify your email address for security and account recovery purposes.</p>
                    <div style="display: flex; justify-content: center; align-items: center;"><a style="border-style: none; font-size: 14px; border-radius: 4px; padding: 16px 8px; color: white; background-color: #7878c3; font-family: inherit; cursor: pointer; text-decoration:none;" href="
        """
        )
        + verification_path
        + (
            """
        ">Verify my email</a></div>
        <p>Or copy this link to your browser directly: 
        """
        )
        + verification_path
        + (
            """  
                    </p>
                    <p>Thanks,</p>
                    <p>The Yuse.ai team</p>
                    <p>Contact us at <a href="https://discord.gg/PwCSdCcWd4">Discord</a></p>
                </div>
            </body>
        </html>
    """
        )
    )
