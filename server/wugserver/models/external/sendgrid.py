import sendgrid
import os
from sendgrid.helpers.mail import Mail, Email, To, Content

sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))

# sends verification email
# return: sendgrid API response
def send_verification_email(email: str, token: str, requestDomain: str):
  verification_path = requestDomain + "api/verification/token/" + token
  from_email = Email("tommywei110@gmail.com")
  to_email = To(email)
  subject = "Email Verification"
  email_html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><a href="' + verification_path + '">Verify your email</a></body></html>'
  content = Content("text/html", email_html)
  mail = Mail(from_email, to_email, subject, content)

  mail_json = mail.get()

  return sg.client.mail.send.post(request_body=mail_json)
