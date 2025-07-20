# Email Sender Application

This is a FastAPI-based application for sending personalized emails with attachments. It allows users to upload an Excel file containing recipient details and a resume file to be sent as an attachment.

## Features

- **Upload Excel File**: Supports Excel files with columns `Name`, `Email`, and `Company`.
- **Upload Resume File**: Sends the uploaded resume as an attachment.
- **Personalized Emails**: Generates email content dynamically based on a provided prompt.
- **Concurrency Control**: Limits the number of concurrent email sends to avoid server overload.
- **Environment Variables**: Uses `.env` file for secure configuration of SMTP credentials.

## Prerequisites

- Python 3.12 or higher
- `pip` package manager

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd email-sender
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the root directory and add your SMTP credentials:
   ```env
   SMTPUSER='your-email@gmail.com'
   SMTPPASSWORD='your-email-password'
   ```

## Usage

1. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

2. Open your browser and navigate to:
   ```
   http://127.0.0.1:8000
   ```

3. Use the `/send-emails/` endpoint to send emails. You can use tools like [Postman](https://www.postman.com/) or [cURL](https://curl.se/) to test the endpoint.

## API Endpoints

### `GET /`
- **Description**: Health check endpoint.
- **Response**: Returns `Hello`.

### `POST /send-emails/`
- **Description**: Sends personalized emails with the uploaded resume as an attachment.
- **Request Parameters**:
  - `prompt` (Form): Email body template (e.g., `Hello {name}, welcome to {company}!`).
  - `subject` (Form): Email subject.
  - `excel_file` (File): Excel file containing `Name`, `Email`, and `Company` columns.
  - `resume_file` (File): PDF file to be sent as an attachment.
- **Response**: JSON object with the status of each email sent.

## Example Excel File Format

| Name       | Email                | Company       |
|------------|----------------------|---------------|
| John Doe   | john.doe@example.com | Example Corp  |
| Jane Smith | jane.smith@example.com | Acme Inc.    |

## Technologies Used

- **FastAPI**: Web framework for building APIs.
- **aiosmtplib**: Async SMTP client for sending emails.
- **pandas**: Data analysis and manipulation library.
- **dotenv**: For loading environment variables.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [aiosmtplib Documentation](https://aiosmtplib.readthedocs.io/)
