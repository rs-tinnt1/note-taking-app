import sgMail from '@sendgrid/mail'

// Initialize SendGrid only if API key is valid
const initializeSendGrid = () => {
  const apiKey = process.env.SENDGRID_API_KEY
  if (apiKey && apiKey.startsWith('SG.')) {
    sgMail.setApiKey(apiKey)
    return true
  }
  return false
}

/**
 * Send welcome email to newly registered user
 * @param {Object} user - User object with name and email
 * @returns {Promise<void>}
 */
export const sendWelcomeEmail = async user => {
  // Check if SendGrid is properly configured
  const isSendGridConfigured = initializeSendGrid()
  try {
    // Check if SendGrid is properly configured
    if (!isSendGridConfigured || !process.env.FROM_EMAIL) {
      console.log('SendGrid not configured or invalid API key, skipping welcome email')
      return
    }

    const fromEmail = process.env.FROM_EMAIL
    const fromName = process.env.FROM_NAME || 'Note Taking App'

    // HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Note Taking App</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .welcome-title {
            color: #27ae60;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .feature-list {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .feature-list h3 {
            color: #2c3e50;
            margin-top: 0;
          }
          .feature-list ul {
            margin: 0;
            padding-left: 20px;
          }
          .feature-list li {
            margin-bottom: 8px;
            color: #555;
          }
          .cta-button {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .cta-button:hover {
            background-color: #2980b9;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📝 Note Taking App</div>
            <h1 class="welcome-title">Welcome, ${user.name}!</h1>
          </div>
          
          <div class="content">
            <p>Thank you for joining our note-taking platform! We're excited to have you on board.</p>
            
            <p>Your account has been successfully created with the email: <strong>${user.email}</strong></p>
            
            <div class="feature-list">
              <h3>🚀 What you can do now:</h3>
              <ul>
                <li>Create and organize your personal notes</li>
                <li>Access your notes from anywhere, anytime</li>
                <li>Edit and update your notes seamlessly</li>
                <li>Keep your thoughts organized and searchable</li>
              </ul>
            </div>
            
            <p>Ready to start taking notes? Log in to your account and begin creating your first note!</p>
            
            <div style="text-align: center;">
              <a href="#" class="cta-button">Get Started</a>
            </div>
          </div>
          
          <div class="footer">
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            <p>Happy note-taking!</p>
            <p><strong>The Note Taking App Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `

    // Plain text version
    const textContent = `
Welcome to Note Taking App!

Hi ${user.name},

Thank you for joining our note-taking platform! We're excited to have you on board.

Your account has been successfully created with the email: ${user.email}

What you can do now:
- Create and organize your personal notes
- Access your notes from anywhere, anytime
- Edit and update your notes seamlessly
- Keep your thoughts organized and searchable

Ready to start taking notes? Log in to your account and begin creating your first note!

If you have any questions or need assistance, feel free to reach out to our support team.

Happy note-taking!
The Note Taking App Team
    `

    const msg = {
      to: user.email,
      from: {
        email: fromEmail,
        name: fromName
      },
      subject: 'Welcome to Note Taking App! 🎉',
      text: textContent,
      html: htmlContent
    }

    await sgMail.send(msg)
    console.log(`Welcome email sent successfully to ${user.email}`)
  } catch (error) {
    // Log error but don't throw - registration should succeed even if email fails
    console.error('Failed to send welcome email:', error.message)
    console.error('User email:', user.email)
  }
}

export default {
  sendWelcomeEmail
}
