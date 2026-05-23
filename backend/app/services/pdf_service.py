"""Generate PDF interview reports using ReportLab."""

import io
from datetime import datetime, timezone
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


class PDFService:
    """Create downloadable interview performance PDFs."""

    @staticmethod
    def generate_interview_report(
        user_name: str,
        interview_data: dict[str, Any],
        responses: list[dict[str, Any]],
    ) -> bytes:
        """
        Build a PDF report for an interview session.

        Returns PDF file as bytes.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Heading1"],
            fontSize=18,
            textColor=colors.HexColor("#1a365d"),
        )
        story = []

        story.append(Paragraph("PrepPilot Interview Report", title_style))
        story.append(Spacer(1, 0.2 * inch))
        story.append(
            Paragraph(
                f"Candidate: <b>{user_name}</b> | Generated: "
                f"{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
                styles["Normal"],
            )
        )
        story.append(Spacer(1, 0.3 * inch))

        summary_data = [
            ["Role", interview_data.get("role", "N/A")],
            ["Type", interview_data.get("interview_type", "N/A")],
            ["Difficulty", interview_data.get("difficulty", "N/A")],
            ["Final Score", str(interview_data.get("final_score", "N/A"))],
            ["Technical", str(interview_data.get("technical_score", "N/A"))],
            ["Communication", str(interview_data.get("communication_score", "N/A"))],
            ["Status", interview_data.get("status", "N/A")],
        ]
        table = Table(summary_data, colWidths=[2 * inch, 4 * inch])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#edf2f7")),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("PADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )
        story.append(table)
        story.append(Spacer(1, 0.4 * inch))

        story.append(Paragraph("Question & Answer Summary", styles["Heading2"]))
        for resp in responses:
            story.append(
                Paragraph(
                    f"Q{resp.get('question_number', '?')}: {resp.get('question_text', '')[:200]}",
                    styles["Heading3"],
                )
            )
            story.append(
                Paragraph(
                    f"Score: {resp.get('score', 'N/A')} | "
                    f"Technical: {resp.get('technical_score', 'N/A')} | "
                    f"Communication: {resp.get('communication_score', 'N/A')}",
                    styles["Normal"],
                )
            )
            answer = (resp.get("answer_text") or "No answer provided")[:500]
            story.append(Paragraph(f"Answer: {answer}", styles["Normal"]))
            story.append(Spacer(1, 0.2 * inch))

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()


pdf_service = PDFService()
